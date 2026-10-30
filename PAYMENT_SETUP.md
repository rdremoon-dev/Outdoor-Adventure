# Outdoor Adventure payments: SSLCOMMERZ

The project supports SSLCOMMERZ hosted checkout for Bangladesh billing in BDT. International customers can submit booking requests, but must arrange payment with the team.

The backend calculates prices from its own price table and guest count; it does not trust an amount submitted by the browser:

- Backpacking Trips: USD 1,250 per guest
- Family Hiking Trips: USD 850 per guest
- Water Sports & Kayaking: USD 980 per guest
- Winter Alpine Sports: USD 1,650 per guest

`USD_TO_BDT_RATE` is a business-configured conversion rate, not a live exchange rate. Set it to the rate you intend to use.

## Configuration

In the Render backend service environment, set:

- `MONGODB_URI`
- `JWT_SECRET` (at least 32 characters)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `CLIENT_URL` (the exact deployed frontend origin, without a trailing slash)
- `PAYMENT_CALLBACK_BASE_URL` (the public HTTPS backend origin)
- `USD_TO_BDT_RATE`
- `SSLCOMMERZ_MODE=sandbox`
- `SSLCOMMERZ_STORE_ID`
- `SSLCOMMERZ_STORE_PASSWORD`

Use sandbox merchant credentials for initial testing. Keep credentials in Render Environment or a local `server/.env`; never put them in frontend `VITE_*` variables or commit `.env` files.

Configure the SSLCOMMERZ IPN listener in the merchant panel:

`https://YOUR-BACKEND-DOMAIN/api/payments/ipn`

The backend validates transactions with SSLCOMMERZ before marking a booking paid. Browser return data alone is never trusted.

## Render deployment

Create a Render Web Service with the `server` directory as Root Directory, `npm install` as the build command, `npm start` as the start command, and `/api/health` as the health-check path. After adding or changing environment variables, save and redeploy/restart the service.

Bookings are requests, not automatically confirmed reservations. Payment status is separate from booking status, and staff must still confirm trip availability. Test successful, declined, cancelled, and delayed payment/IPN scenarios in sandbox before going live. Publish a clear refund/cancellation policy and confirm fees, settlement, refunds, and chargeback handling before enabling live payments.

## Official documentation

- SSLCOMMERZ: https://developer.sslcommerz.com/doc/v4/
