const dns = require('node:dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const userAuth = require('../middleware/userAuth');

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
const paymentEnabledFor = country =>
  country === 'BD' && sslEnabled();
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

router.post('/checkout/:bookingId', userAuth.optional, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found.' });
    if (req.user && String(booking.userId || '') !== req.user.id)
      return res.status(403).json({ message: 'You can only pay for your own booking.' });
    const providerEnabled = paymentEnabledFor(booking.billingCountry);
    if (!providerEnabled)
      return res
        .status(503)
        .json({
          message:
            booking.billingCountry === 'BD'
              ? 'SSLCOMMERZ is not configured yet. Your booking request is saved; please contact the team.'
              : 'Online payment is currently available only for Bangladesh billing. Your booking request is saved; please contact the team to arrange payment.',
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
    booking.paymentGateway = 'sslcommerz';
    booking.paymentUpdatedAt = new Date();
    await booking.save();

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
