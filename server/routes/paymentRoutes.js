const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const crypto = require('crypto');
const Booking = require('../models/Booking');

const router = express.Router();
const USD_PRICES = Object.freeze({
  'Backpacking Trips': 1250,
  'Family Hiking Trips': 850,
  'Water Sports & Kayaking': 980,
  'Winter Alpine Sports': 1650,
});
const SANDBOX = 'https://sandbox.sslcommerz.com';
const LIVE = 'https://securepay.sslcommerz.com';
const sslEnabled = () =>
  Boolean(
    process.env.SSLCOMMERZ_STORE_ID &&
    process.env.SSLCOMMERZ_STORE_PASSWORD &&
    process.env.PAYMENT_CALLBACK_BASE_URL &&
    process.env.CLIENT_URL,
  );
const verifoneEnabled = () =>
  Boolean(
    process.env.VERIFONE_API_USER_ID &&
    process.env.VERIFONE_API_KEY &&
    process.env.VERIFONE_ENTITY_ID &&
    process.env.VERIFONE_PAYMENT_CONTRACT_ID &&
    process.env.PAYMENT_CALLBACK_BASE_URL &&
    process.env.CLIENT_URL,
  );
const paymentEnabledFor = country =>
  country === 'BD' ? sslEnabled() : verifoneEnabled();
const baseUrl = () => (process.env.SSLCOMMERZ_MODE === 'live' ? LIVE : SANDBOX);
const roundMoney = value =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;
function getQuote(adventure, guests, billingCountry) {
  const unitPriceUSD = USD_PRICES[adventure];
  const count = Number(guests);
  if (!unitPriceUSD || !Number.isInteger(count) || count < 1 || count > 10)
    return null;
  if (!['BD', 'INTL'].includes(billingCountry)) return null;
  const rate = Number(process.env.USD_TO_BDT_RATE || 120);
  if (!Number.isFinite(rate) || rate <= 0)
    throw new Error('USD_TO_BDT_RATE must be a positive number.');
  const currency = billingCountry === 'BD' ? 'BDT' : 'USD';
  const amount =
    currency === 'BDT'
      ? roundMoney(unitPriceUSD * rate * count)
      : roundMoney(unitPriceUSD * count);
  const equivalentBDT = roundMoney(unitPriceUSD * rate * count);
  const payable =
    currency === 'BDT'
      ? equivalentBDT >= 10 && equivalentBDT <= 500000
      : amount >= 1 && amount <= 100000;
  return {
    currency,
    amount,
    unitPriceUSD,
    guests: count,
    usdToBdtRate: rate,
    equivalentBDT,
    payable,
    paymentProvider: billingCountry === 'BD' ? 'sslcommerz' : 'verifone',
  };
}
function redirectToClient(res, status, bookingId) {
  const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim();
  const url = new URL(clientOrigin);
  url.searchParams.set('payment', status);
  if (bookingId) url.searchParams.set('booking', String(bookingId));
  return res.redirect(303, url.toString());
}
async function validateTransaction(valId) {
  if (!valId || !sslEnabled()) return null;
  const endpoint = `${baseUrl()}/validator/api/validationserverAPI.php`;
  const url = new URL(endpoint);
  url.searchParams.set('val_id', String(valId));
  url.searchParams.set('store_id', process.env.SSLCOMMERZ_STORE_ID);
  url.searchParams.set('store_passwd', process.env.SSLCOMMERZ_STORE_PASSWORD);
  url.searchParams.set('format', 'json');
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok)
    throw new Error(`SSLCOMMERZ validation returned HTTP ${response.status}`);
  return response.json();
}
async function applyValidatedPayment(data) {
  if (
    !data ||
    !['VALID', 'VALIDATED'].includes(String(data.status || '').toUpperCase())
  )
    return { ok: false };
  if (String(data.risk_level || '0') === '1') {
    const riskyBooking = await Booking.findOne({
      transactionId: String(data.tran_id || ''),
    });
    if (riskyBooking && riskyBooking.paymentStatus !== 'paid') {
      riskyBooking.paymentStatus = 'review';
      riskyBooking.validationId = String(data.val_id || '');
      riskyBooking.paymentUpdatedAt = new Date();
      await riskyBooking.save();
    }
    return { ok: false, booking: riskyBooking };
  }
  const booking = await Booking.findOne({
    transactionId: String(data.tran_id || ''),
  });
  if (!booking) return { ok: false };
  const expectedCurrency = booking.paymentCurrency;
  const returnedCurrency = String(
    data.currency_type || data.currency || '',
  ).toUpperCase();
  const returnedAmount = Number(data.currency_amount ?? data.amount);
  if (
    returnedCurrency !== expectedCurrency ||
    !Number.isFinite(returnedAmount) ||
    Math.abs(returnedAmount - booking.paymentAmount) > 0.02
  ) {
    booking.paymentStatus = 'review';
    booking.paymentUpdatedAt = new Date();
    await booking.save();
    return { ok: false, booking };
  }
  // A validated, matching transaction is the only path that marks the booking paid.
  if (booking.paymentStatus !== 'paid') {
    booking.paymentStatus = 'paid';
    booking.validationId = String(data.val_id || '');
    booking.bankTransactionId = String(data.bank_tran_id || '');
    booking.paidAt = new Date();
    booking.paymentUpdatedAt = new Date();
    await booking.save();
  }
  return { ok: true, booking };
}

router.get('/quote', (req, res) => {
  try {
    const quote = getQuote(
      String(req.query.adventure || ''),
      Number(req.query.guests),
      String(req.query.billingCountry || 'INTL'),
    );
    if (!quote)
      return res
        .status(400)
        .json({
          message:
            'Choose a valid adventure, guest count, and billing country.',
        });
    res.json({
      ...quote,
      paymentEnabled: paymentEnabledFor(
        String(req.query.billingCountry || 'INTL'),
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SSLCOMMERZ success return: never trust the redirect payload; validate with the gateway.
router.post('/success', async (req, res) => {
  try {
    const validation = await validateTransaction(req.body?.val_id);
    const result = await applyValidatedPayment(validation);
    if (result.ok)
      req.app
        .get('io')
        ?.to('admins')
        .emit('payment:updated', {
          bookingId: String(result.booking._id),
          paymentStatus: result.booking.paymentStatus,
          paidAt: result.booking.paidAt,
        });
    return redirectToClient(
      res,
      result.ok ? 'success' : 'verification_pending',
      result.booking?._id || req.body?.value_a,
    );
  } catch (error) {
    console.error('Payment success callback validation failed:', error.message);
    return redirectToClient(res, 'verification_pending', req.body?.value_a);
  }
});
router.post('/fail', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      transactionId: String(req.body?.tran_id || ''),
    });
    if (booking && booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'failed';
      booking.paymentUpdatedAt = new Date();
      await booking.save();
    }
    return redirectToClient(res, 'failed', booking?._id || req.body?.value_a);
  } catch (error) {
    console.error('Payment fail callback error:', error.message);
    return redirectToClient(res, 'failed');
  }
});
router.post('/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({
      transactionId: String(req.body?.tran_id || ''),
    });
    if (booking && booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'cancelled';
      booking.paymentUpdatedAt = new Date();
      await booking.save();
    }
    return redirectToClient(
      res,
      'cancelled',
      booking?._id || req.body?.value_a,
    );
  } catch (error) {
    console.error('Payment cancel callback error:', error.message);
    return redirectToClient(res, 'cancelled');
  }
});

// Configure this URL as the SSLCOMMERZ IPN listener in the merchant panel.
router.post('/ipn', async (req, res) => {
  try {
    if (!req.body?.val_id || !req.body?.tran_id)
      return res.status(400).send('Missing transaction identifiers');
    const validation = await validateTransaction(req.body.val_id);
    if (!validation || String(validation.tran_id) !== String(req.body.tran_id))
      return res.status(400).send('Transaction validation failed');
    const result = await applyValidatedPayment(validation);
    if (!result.ok)
      return res
        .status(400)
        .send('Payment not validated or amount/currency mismatch');
    req.app
      .get('io')
      ?.to('admins')
      .emit('payment:updated', {
        bookingId: String(result.booking._id),
        paymentStatus: result.booking.paymentStatus,
        paidAt: result.booking.paidAt,
      });
    return res.status(200).send('IPN processed');
  } catch (error) {
    console.error('Payment IPN error:', error.message);
    return res.status(500).send('IPN processing error');
  }
});

// Verifone Hosted Payments Page (international USD bookings). Customer is redirected to a provider-hosted page.
router.post('/verifone/webhook', async (req, res) => {
  try {
    const signature = req.get('x-vfi-jws');
    const jwksUrl =
      process.env.VERIFONE_JWKS_URL ||
      (process.env.VERIFONE_MODE === 'live'
        ? ''
        : 'https://vf11gtostorage1.blob.core.windows.net/test-webhook-sign-keys/test-webhook-sign-keys.jwks');
    if (!signature || !jwksUrl)
      return res
        .status(401)
        .send('Missing Verifone webhook signature configuration');
    const parts = signature.split('.');
    if (parts.length !== 3 || parts[1] !== '')
      return res.status(401).send('Invalid detached webhook signature');
    const protectedHeader = JSON.parse(
      Buffer.from(parts[0], 'base64url').toString('utf8'),
    );
    const kid = protectedHeader.kid;
    const alg = protectedHeader.alg;
    if (
      !kid ||
      !['RS256', 'ES256'].includes(alg) ||
      protectedHeader.b64 !== false
    )
      return res.status(401).send('Unsupported webhook signature');
    const keysResponse = await fetch(jwksUrl, {
      signal: AbortSignal.timeout(10000),
    });
    if (!keysResponse.ok)
      throw new Error('Could not load Verifone webhook public keys');
    const jwks = await keysResponse.json();
    const jwk = (jwks.keys || []).find(
      k => k.kid === kid && (!k.alg || k.alg === alg),
    );
    if (!jwk) return res.status(401).send('Unknown Verifone signing key');
    const bodyText = canonicalizeJson(req.body);
    const signingInput = Buffer.concat([
      Buffer.from(`${parts[0]}.`, 'utf8'),
      Buffer.from(bodyText, 'utf8'),
    ]);
    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    const sig = Buffer.from(parts[2], 'base64url');
    const verify = crypto.createVerify('SHA256');
    verify.update(signingInput);
    verify.end();
    const validSignature =
      alg === 'ES256'
        ? verify.verify({ key: publicKey, dsaEncoding: 'ieee-p1363' }, sig)
        : verify.verify(publicKey, sig);
    if (!validSignature)
      return res.status(401).send('Invalid Verifone webhook signature');

    const event = req.body || {};
    const content = event.content || {};
    const reference = String(content.merchant_reference || '');
    if (!reference) return res.status(400).send('Missing merchant reference');
    const booking = await Booking.findOne({
      transactionId: reference,
      paymentGateway: 'verifone',
    });
    if (!booking) return res.status(404).send('Booking not found');
    const currency = String(content.currency_code || '').toUpperCase();
    const amount = Number(content.amount);
    if (
      currency !== booking.paymentCurrency ||
      !Number.isFinite(amount) ||
      Math.abs(amount - booking.paymentAmount) > 0.02
    ) {
      booking.paymentStatus = 'review';
      booking.paymentUpdatedAt = new Date();
      await booking.save();
      return res.status(400).send('Payment amount or currency mismatch');
    }
    const status = String(content.transaction_status || '').toUpperCase();
    const paidStatuses = new Set([
      'AUTHORISED',
      'CAPTURED',
      'SETTLED',
      'SETTLEMENT_REQUESTED',
      'SETTLEMENT_SUBMITTED',
      'SETTLEMENT_COMPLETED',
    ]);
    const failedStatuses = new Set([
      'FAILED',
      'DECLINED',
      'CANCELLED',
      'REJECTED',
    ]);
    if (paidStatuses.has(status) && booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'paid';
      booking.bankTransactionId = String(content.id || event.eventId || '');
      booking.validationId = String(event.eventId || '');
      booking.paidAt = new Date();
      booking.paymentUpdatedAt = new Date();
      await booking.save();
      req.app
        .get('io')
        ?.to('admins')
        .emit('payment:updated', {
          bookingId: String(booking._id),
          paymentStatus: booking.paymentStatus,
          paidAt: booking.paidAt,
        });
    } else if (failedStatuses.has(status) && booking.paymentStatus !== 'paid') {
      booking.paymentStatus = 'failed';
      booking.paymentUpdatedAt = new Date();
      await booking.save();
      req.app
        .get('io')
        ?.to('admins')
        .emit('payment:updated', {
          bookingId: String(booking._id),
          paymentStatus: booking.paymentStatus,
        });
    }
    return res.status(200).send('Verifone webhook processed');
  } catch (error) {
    console.error('Verifone webhook error:', error.message);
    return res.status(500).send('Webhook processing error');
  }
});

function canonicalizeJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalizeJson).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map(key => `${JSON.stringify(key)}:${canonicalizeJson(value[key])}`)
    .join(',')}}`;
}

router.get('/verifone/return', (req, res) => {
  // The redirect is not proof of payment. Only a verified signed webhook can mark a booking paid.
  const status = req.query.error ? 'failed' : 'verification_pending';
  return redirectToClient(res, status, req.query.bookingId);
});

router.post('/checkout/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found.' });
    const providerEnabled = paymentEnabledFor(booking.billingCountry);
    if (!providerEnabled)
      return res
        .status(503)
        .json({
          message: `Online payment for ${booking.billingCountry === 'BD' ? 'Bangladesh' : 'international'} customers is not configured yet. Your booking request is saved; please contact the team.`,
        });
    if (booking.paymentStatus === 'paid')
      return res.status(409).json({ message: 'This booking is already paid.' });
    if (booking.paymentStatus === 'pending' && booking.transactionId)
      return res
        .status(409)
        .json({
          message:
            'A payment session has already been created for this booking. Complete that checkout or contact support before retrying.',
        });
    const quote = getQuote(
      booking.adventure,
      booking.guests,
      booking.billingCountry,
    );
    if (!quote)
      return res
        .status(400)
        .json({ message: 'Unable to calculate booking total.' });
    if (!quote.payable)
      return res
        .status(400)
        .json({
          message:
            'This total is outside the configured payment limits. Contact the team for an approved alternative.',
        });
    const callbackBase = process.env.PAYMENT_CALLBACK_BASE_URL.replace(
      /\/$/,
      '',
    );
    const tranId =
      `OA${Date.now().toString(36)}${crypto.randomBytes(5).toString('hex')}`.slice(
        0,
        30,
      );
    booking.paymentCurrency = quote.currency;
    booking.paymentAmount = quote.amount;
    booking.unitPriceUSD = quote.unitPriceUSD;
    booking.usdToBdtRate = quote.usdToBdtRate;
    booking.paymentStatus = 'pending';
    booking.transactionId = tranId;
    booking.paymentGateway =
      booking.billingCountry === 'BD' ? 'sslcommerz' : 'verifone';
    booking.paymentUpdatedAt = new Date();
    await booking.save();

    if (booking.billingCountry === 'INTL') {
      const apiBase = (
        process.env.VERIFONE_API_BASE_URL ||
        (process.env.VERIFONE_MODE === 'live'
          ? 'https://emea.gsc.verifone.cloud/oidc/checkout-service'
          : 'https://cst.test-gsc.vfims.com/oidc/checkout-service')
      ).replace(/\/$/, '');
      const auth = Buffer.from(
        `${process.env.VERIFONE_API_USER_ID}:${process.env.VERIFONE_API_KEY}`,
      ).toString('base64');
      const payload = {
        amount: Math.round(quote.amount * 100),
        currency_code: 'USD',
        entity_id: process.env.VERIFONE_ENTITY_ID,
        merchant_reference: tranId,
        return_url: `${callbackBase}/api/payments/verifone/return?bookingId=${encodeURIComponent(String(booking._id))}`,
        shop_url: process.env.CLIENT_URL.split(',')[0].trim(),
        configurations: {
          card: {
            mode: 'PAYMENT',
            payment_contract_id: process.env.VERIFONE_PAYMENT_CONTRACT_ID,
            authorization_type: 'FINAL_AUTH',
          },
        },
      };
      const response = await fetch(`${apiBase}/v2/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json().catch(() => ({}));
      if (
        !response.ok ||
        !(data.url || data.checkout_url || data.redirect_url)
      ) {
        booking.paymentStatus = 'failed';
        booking.paymentUpdatedAt = new Date();
        await booking.save();
        console.error(
          'Verifone checkout creation failed:',
          response.status,
          data.message || data.error || 'Unknown gateway error',
        );
        return res
          .status(502)
          .json({
            message:
              'Verifone could not start checkout. Your booking request is saved; please contact support or try again later.',
          });
      }
      return res.json({
        checkoutUrl: data.url || data.checkout_url || data.redirect_url,
        transactionId: tranId,
        amount: quote.amount,
        currency: quote.currency,
        provider: 'verifone',
      });
    }

    const form = new URLSearchParams({
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      total_amount: quote.amount.toFixed(2),
      currency: quote.currency,
      tran_id: tranId,
      success_url: `${callbackBase}/api/payments/success`,
      fail_url: `${callbackBase}/api/payments/fail`,
      cancel_url: `${callbackBase}/api/payments/cancel`,
      ipn_url: `${callbackBase}/api/payments/ipn`,
      product_name: booking.adventure,
      product_category: 'Travel',
      product_profile: 'non-physical-goods',
      cus_name: booking.customerName,
      cus_email: booking.email,
      cus_phone: booking.phone,
      cus_add1: 'Not provided',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      num_of_item: String(booking.guests),
      value_a: String(booking._id),
    });
    const response = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: AbortSignal.timeout(15000),
    });
    const payload = await response.json();
    if (
      !response.ok ||
      payload.status !== 'SUCCESS' ||
      !payload.GatewayPageURL
    ) {
      booking.paymentStatus = 'failed';
      booking.paymentUpdatedAt = new Date();
      await booking.save();
      console.error(
        'SSLCOMMERZ session initiation failed:',
        payload.failedreason || payload.status,
      );
      return res
        .status(502)
        .json({
          message:
            'SSLCOMMERZ could not start checkout. Your booking request is saved; please contact support or try again later.',
        });
    }
    return res.json({
      checkoutUrl: payload.GatewayPageURL,
      transactionId: tranId,
      amount: quote.amount,
      currency: quote.currency,
      provider: 'sslcommerz',
    });
  } catch (error) {
    console.error('Checkout initiation error:', error.message);
    return res
      .status(502)
      .json({
        message: 'Unable to start payment checkout. Please try again later.',
      });
  }
});

module.exports = router;
