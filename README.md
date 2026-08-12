# Bhardwaj Orchards

A production-ready apple orchard storefront with a responsive catalogue, cart, orchard video, farm-visit enquiries, MongoDB persistence, and email notifications.

## Run locally

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env` and fill in MongoDB and SMTP values.
3. Run `npm install`.
4. Run `npm run build`.
5. Run `npm start` and open `http://localhost:8080`.

## Contact enquiries

`POST /api/contact` validates the visitor's name, email, phone number, and message. It stores the enquiry in MongoDB and emails the details to `CONTACT_TO` when SMTP is configured.

For Gmail, enable two-step verification and create a Google App Password. Put that app password in `SMTP_PASS`; do not use or commit your normal password.

## Deploy

This project works on any Node.js host (Render, Railway, Fly.io, VPS, etc.). Configure these values in the host's secret/environment-variable dashboard:

- `MONGODB_URI`
- `MONGODB_DB`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `CONTACT_TO`
- `FRONTEND_ORIGIN` (your final public website URL)

Build command: `npm run build`  
Start command: `npm start`

## Quality and security included

- Input validation and a 15-minute contact-form rate limit
- HTTP security headers, compression, and payload-size limits
- Secrets excluded through `.gitignore`
- Health endpoint at `/api/health`
- Responsive and keyboard-friendly storefront
