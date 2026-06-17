import express from 'express';
import { handleLettersRequest } from './lettersApi.js';

const port = Number(process.env.PORT) || 3001;
const app = express();

const allowedOrigins = new Set([
  'https://lucasfeelsguilty.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.use('/api/letters', (req, res) => {
  handleLettersRequest(req, res);
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`letters API running at http://localhost:${port}`);
});
