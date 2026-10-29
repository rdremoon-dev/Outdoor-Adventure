# Admin dashboard upgrade

## What's improved
- Refreshed operations dashboard with responsive layout and summary cards.
- Search by customer name, email, phone, adventure, or booking reference.
- Filter by booking status, adventure type, and trip date (upcoming/today/past).
- Sort by newest request, oldest request, or soonest trip date.
- Reservation details drawer with contact links, guest count, request message, and status management.
- Upcoming-trip panel and live Socket.IO booking updates.
- Export the current filtered view as CSV.
- Clear empty states, loading feedback, and session-expiration handling.

## Run locally
1. In the project root: `npm install` then `npm run dev`.
2. In `server/`: `npm install` then `npm run dev`.
3. Configure `server/.env` using `server/.env.example`.

Payment setup decisions are documented in `PAYMENT_SETUP.md`. Payment is intentionally not activated until the displayed USD prices and charge basis/currency are confirmed.
