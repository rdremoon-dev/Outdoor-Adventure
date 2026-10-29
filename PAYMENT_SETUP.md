# Outdoor Adventure payments: SSLCOMMERZ + Verifone

This project contains two separate hosted-checkout integrations. It is **sandbox-first** and contains no real merchant credentials.

- **Bangladesh billing (`BD`)**: SSLCOMMERZ checkout in BDT.
- **International billing (`INTL`)**: Verifone Checkout hosted payment page in USD.

The Express backend recalculates the price from its own price table and guest count; it never trusts an amount submitted by the browser. Tour prices are per guest:

- Backpacking Trips: USD 1,250
- Family Hiking Trips: USD 850
- Water Sports & Kayaking: USD 980
- Winter Alpine Sports: USD 1,650

`USD_TO_BDT_RATE` is a business-configured conversion rate used for local BDT pricing. It is not a live exchange rate; `120` in the example is only a placeholder.

## 1. Common configuration

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `CLIENT_URL`, and `PAYMENT_CALLBACK_BASE_URL`.
3. `CLIENT_URL` must be the exact frontend origin (for example `https://your-site.netlify.app`, no trailing slash). `PAYMENT_CALLBACK_BASE_URL` is the public HTTPS backend origin.
4. Set `USD_TO_BDT_RATE` to your actual business rate.
5. Keep credentials in Render Environment or `server/.env`; never put them in `VITE_*` variables or commit `.env` to GitHub.

## 2. SSLCOMMERZ for Bangladesh

Set these values in sandbox mode first:

```env
SSLCOMMERZ_MODE=sandbox
SSLCOMMERZ_STORE_ID=your_sandbox_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sandbox_store_password
```

Use the sandbox credentials from https://developer.sslcommerz.com/doc/v4/. In the merchant panel, configure the IPN listener:

`https://YOUR-BACKEND-DOMAIN/api/payments/ipn`

The backend validates the transaction with SSLCOMMERZ's validation API before marking a booking paid. Browser return data alone is never trusted.

## 3. Verifone hosted checkout for international USD bookings

Verifone's modern hosted checkout requires an onboarded merchant account and the matching sandbox organization/entity and payment-provider contract. Availability and USD processing depend on your Verifone merchant agreement and contract.

Configure the sandbox values provided in Verifone Central / by your Verifone onboarding contact:

```env
VERIFONE_MODE=sandbox
VERIFONE_API_BASE_URL=https://cst.test-gsc.vfims.com/oidc/checkout-service
VERIFONE_API_USER_ID=your_verifone_api_user_uid
VERIFONE_API_KEY=your_verifone_sandbox_api_key
VERIFONE_ENTITY_ID=your_verifone_sandbox_organization_id
VERIFONE_PAYMENT_CONTRACT_ID=your_verifone_sandbox_payment_provider_contract_id
```

The API user ID and API key are sent only from the backend using Verifone's Basic Auth format (`user-uid:api-key`). Do not expose either value to React. The backend sends the amount in minor units (for USD, cents), requests a hosted checkout, and uses a unique internal merchant reference for matching.

Configure a Verifone Central webhook / notification for transaction events and point it to:

`https://YOUR-BACKEND-DOMAIN/api/payments/verifone/webhook`

The webhook must include the `x-vfi-jws` detached signature header. The backend verifies that signature using Verifone's published JWKS, then checks the merchant reference, amount, currency and transaction status before updating payment state. The sandbox JWKS URL is preconfigured in code. For production, set `VERIFONE_JWKS_URL` to the production JWKS URL supplied in Verifone's current documentation/onboarding details; do not reuse the sandbox key set.

The default sandbox API base above is the Global Sandbox endpoint. Verifone accounts can be region-specific, so confirm the correct API base URL, entity ID, currency and payment contract with your provider. If your Verifone account is the legacy 2Checkout (2Sell/2Subscribe) product rather than Verifone Checkout / Verifone Central API, these modern API credentials and endpoints are not interchangeable; ask the provider which product/API your account uses before configuring it.

## 4. Render deployment

Create a Render Web Service using the `server` directory as Root Directory, build command `npm install`, start command `npm start`, and health-check path `/api/health`.

Add the common environment variables above and whichever provider credentials you need. Set both providers to sandbox until end-to-end testing is complete. After changing frontend code, rebuild/redeploy the React frontend too.

## 5. Important payment behavior and security

- Bangladesh booking: server-calculated BDT amount → SSLCOMMERZ.
- International booking: server-calculated USD amount → Verifone.
- A redirect back to the website is not proof of payment. Verifone's signed webhook or SSLCOMMERZ's server-side validation is required before a booking becomes `paid`.
- Payment status is separate from booking status. Payment does not automatically confirm trip availability; staff must still approve the booking.
- Checkout currently starts after a booking request is submitted, before staff confirms availability. Publish a clear refund/cancellation policy and consider moving checkout until after availability is confirmed before going live.
- Test successful, declined, cancelled and delayed webhook/return scenarios in sandbox. Verify that repeated webhook delivery does not duplicate or regress payment state.
- Do not switch to live mode until your merchant account, USD/BDT support, settlement, fees, refunds and chargeback handling are confirmed.

## Official documentation

- SSLCOMMERZ: https://developer.sslcommerz.com/doc/v4/
- Verifone Checkout / payment API: https://verifone.cloud/docs/online-payments/checkout/accepting-payments
- Verifone API authentication: https://verifone.cloud/docs/online-payments/getting-started/api-authentication
- Verifone notifications and signed webhooks: https://verifone.cloud/docs/portal/administration/notifications
