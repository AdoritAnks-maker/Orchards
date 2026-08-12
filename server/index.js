import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();
const port = Number(process.env.PORT || 8080);
const contactRecipient = process.env.CONTACT_TO || 'ankushworks09@gmail.com';
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const requiredProductionConfig = ['MONGODB_URI', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
const missingProductionConfig = requiredProductionConfig.filter((name) => !process.env[name]);

if (process.env.NODE_ENV === 'production' && missingProductionConfig.length) {
  throw new Error(`Missing required production environment variables: ${missingProductionConfig.join(', ')}`);
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      frameAncestors: ["'self'"],
      frameSrc: ['https://www.youtube-nocookie.com'],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://img.imageboss.me', 'https://hpgeneralstudies.com', 'https://images.tribuneindia.com', 'https://media.fortuneindia.com'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      upgradeInsecureRequests: []
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(cors({
  // Same-origin browser requests need no CORS header. External frontends must be listed explicitly.
  origin: allowedOrigins.length ? allowedOrigins : false,
  methods: ['GET', 'POST']
}));
app.use(express.json({ limit: '20kb' }));

let client;
async function enquiries() {
  if (!process.env.MONGODB_URI) return null;
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  }
  return client.db(process.env.MONGODB_DB || 'bhardwaj_orchards').collection('enquiries');
}

function clean(value, max = 500, { preserveNewlines = false } = {}) {
  if (typeof value !== 'string') return '';
  const safe = value.trim().replace(/[<>\u0000]/g, '');
  return (preserveNewlines
    ? safe.replace(/\r\n?/g, '\n').replace(/[^\S\r\n]{2,}/g, ' ')
    : safe.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ')
  ).slice(0, max);
}
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validPhone(phone) {
  return /^[+\d][\d\s()-]{6,20}$/.test(phone);
}

const contactLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many messages. Please try again in a few minutes.' } });

app.get('/api/health', async (_req, res) => res.json({ status: 'ok', service: "Bhardwaj's Orchard" }));
app.get('/api/payment-config', (_req, res) => res.json({
  upiId: process.env.UPI_ID || null,
  razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}));
app.post('/api/contact', contactLimit, async (req, res, next) => {
  try {
    const data = {
      name: clean(req.body.name, 100),
      email: clean(req.body.email, 160).toLowerCase(),
      phone: clean(req.body.phone, 30),
      message: clean(req.body.message, 2000, { preserveNewlines: true }),
      interest: clean(req.body.interest, 60),
      createdAt: new Date(),
      source: 'website'
    };
    if (data.name.length < 2 || !validEmail(data.email) || !validPhone(data.phone) || data.message.length < 10) {
      return res.status(400).json({ error: 'Please provide a valid name, email, phone number, and message.' });
    }
    const collection = await enquiries();
    if (collection) await collection.insertOne(data);

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        requireTLS: process.env.SMTP_REQUIRE_TLS !== 'false',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: `Bhardwaj's Orchard Website <${process.env.EMAIL_FROM}>`,
        to: contactRecipient,
        replyTo: data.email,
        subject: `New orchard enquiry from ${data.name}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nInterest: ${data.interest || 'General enquiry'}\n\nMessage:\n${data.message}`
      });
    }
    res.status(201).json({ message: 'Thank you. Your message has been sent to Ankush.' });
  } catch (error) { next(error); }
});

app.use(express.static(path.join(root, 'dist'), { maxAge: '1d', index: 'index.html' }));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unable to send your message right now. Please call us instead.' });
});

app.listen(port, () => console.log(`Bhardwaj's Orchard running on port ${port}`));
