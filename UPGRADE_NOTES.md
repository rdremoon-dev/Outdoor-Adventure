# Admin dashboard upgrade

## What's improved
- Refreshed operations dashboard with responsive sidebar navigation and summary cards.
- Search by customer name, email, phone, adventure, or booking reference.
- Filter by booking status, adventure type, and trip date (upcoming/today/past).
- Sort by newest request, oldest request, or soonest trip date.
- Reservation details panel with contact details, guest count, request message, and status management.
- Upcoming-trip panel and live Socket.IO booking updates.
- Export the current filtered view as CSV.
- Clear empty states, loading feedback, and session-expiration handling.
- Customer registration and sign-in with bcrypt-hashed passwords and role-scoped JWTs.
- Customer profile editing and a dashboard listing bookings created while signed in.
- Customer dashboard checkout for eligible Bangladesh SSLCOMMERZ bookings.
- Admin CRUD for customer-facing booking tips, with public read-only display in the customer dashboard.
- Editable admin contact profile; admin sign-in credentials remain managed through server environment variables.

## Run locally
1. In the project root: `npm install` then `npm run dev`.
2. In `server/`: `npm install` then `npm run dev`.
3. Configure `server/.env` using `server/.env.example`.

Payment configuration is documented in `PAYMENT_SETUP.md`. SSLCOMMERZ hosted checkout is available for Bangladesh billing when merchant credentials are configured; international bookings remain requests for the team to arrange.
