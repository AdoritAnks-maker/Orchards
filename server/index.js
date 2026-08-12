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

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(',').map((item) => item.trim()) || true, methods: ['GET', 'POST'] }));
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

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, max) : '';
}
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validPhone(phone) {
  return /^[+\d][\d\s()-]{6,20}$/.test(phone);
}

const contactLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many messages. Please try again in a few minutes.' } });

app.get('/api/health', async (_req, res) => res.json({ status: 'ok', service: 'Bhardwaj Orchards' }));
app.post('/api/contact', contactLimit, async (req, res, next) => {
  try {
    const data = {
      name: clean(req.body.name, 100),
      email: clean(req.body.email, 160).toLowerCase(),
      phone: clean(req.body.phone, 30),
      message: clean(req.body.message, 2000),
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
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 465), secure: process.env.SMTP_SECURE !== 'false', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transporter.sendMail({
        from: `Bhardwaj Orchards Website <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_TO || 'srinivasnankushbahrdwaj@gmail.com',
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

app.listen(port, () => console.log(`Bhardwaj Orchards running on port ${port}`));
