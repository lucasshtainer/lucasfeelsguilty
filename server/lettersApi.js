import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ava123';

function resolveLettersPath() {
  const distPath = join(__dirname, '..', 'dist', 'letters.json');
  if (existsSync(distPath)) {
    return distPath;
  }
  return join(__dirname, '..', 'public', 'letters.json');
}

export function getLettersPath() {
  return resolveLettersPath();
}

export function readLetters() {
  const path = resolveLettersPath();
  if (!existsSync(path)) {
    return [];
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function writeLetters(letters) {
  const payload = JSON.stringify(letters, null, 2) + '\n';
  const publicPath = join(__dirname, '..', 'public', 'letters.json');
  const distPath = join(__dirname, '..', 'dist', 'letters.json');

  writeFileSync(publicPath, payload, 'utf8');
  if (existsSync(join(__dirname, '..', 'dist'))) {
    writeFileSync(distPath, payload, 'utf8');
  }
}

export function isAuthorized(req) {
  const auth = req.headers.authorization;
  if (auth === `Bearer ${ADMIN_PASSWORD}`) return true;
  if (req.headers['x-admin-password'] === ADMIN_PASSWORD) return true;
  return false;
}

export function handleLettersRequest(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(readLetters()));
    return;
  }

  if (req.method === 'PUT') {
    if (!isAuthorized(req)) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const letters = JSON.parse(body);
        if (!Array.isArray(letters)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Expected an array of letters' }));
          return;
        }
        writeLetters(letters);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true, count: letters.length }));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method not allowed' }));
}
