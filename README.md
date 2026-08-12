# Bhardwaj's Orchard

A deployable apple-orchard catalogue and enquiry site with a responsive catalogue, cart, orchard video, farm-visit enquiries, MongoDB persistence, and email notifications. The basket collects items for an enquiry; it is not a payment checkout.

## Live website

https://bhardwaj-orchards-web.onrender.com

## Run locally

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env` and fill in MongoDB and SMTP values.
3. Run `npm install`.
4. Run `npm run build`.
5. Run `npm start` and open `http://localhost:8080`.

## Contact enquiries

`POST /api/contact` validates the visitor's name, email, phone number, and message. It stores the enquiry in MongoDB and emails the details to `CONTACT_TO` through Brevo. On Render Free, configure `BREVO_API_KEY` so email is sent through Brevo's HTTPS API instead of blocked SMTP ports.

This project is configured for Brevo SMTP, which has a free transactional-email plan. Create an SMTP key in Brevo and verify `EMAIL_FROM` as a sender. Put the SMTP key in `SMTP_PASS`; do not use or commit a Brevo account password or API key.

## Deploy

This project works on any Node.js host (Render, Railway, Fly.io, VPS, etc.). Configure these values in the host's secret/environment-variable dashboard. The contact recipient defaults to `ankushworks09@gmail.com`, but set it explicitly as well:

- `MONGODB_URI` and optional `MONGODB_DB`
- `BREVO_API_KEY` (recommended on Render Free; create it in Brevo's **Settings > SMTP & API > API Keys & MCP**)
- Or, on hosts that allow SMTP: `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER` (Brevo SMTP login), and `SMTP_PASS` (Brevo SMTP key)
- `EMAIL_FROM` (a verified Brevo sender)
- `CONTACT_TO=ankushworks09@gmail.com`
- `FRONTEND_ORIGIN` (your final public website URL)

Build command: `npm run build`  
Start command: `npm start`

After deployment, open `/api/health` and submit a real test enquiry to confirm both MongoDB storage and the email notification work. The server refuses to start in production if the MongoDB or SMTP settings are missing. Set `FRONTEND_ORIGIN` only when the frontend is hosted on a different origin; it must be the exact public URL, including `https://` and without a trailing slash.

## Quality and security included

- Input validation and a 15-minute contact-form rate limit
- HTTP security headers, compression, and payload-size limits
- Secrets excluded through `.gitignore`
- Health endpoint at `/api/health`
- Responsive and keyboard-friendly storefront
