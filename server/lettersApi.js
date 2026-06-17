import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { syncLettersToGitHub } from './githubSync.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ava123';
const DATA_DIR = process.env.DATA_DIR || join(ROOT, 'data');
const SEED_PATH = join(ROOT, 'public', 'letters.json');
const STORAGE_PATH = join(DATA_DIR, 'letters.json');

function ensureStorage() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(STORAGE_PATH) && existsSync(SEED_PATH)) {
    copyFileSync(SEED_PATH, STORAGE_PATH);
  }
}

export function getLettersPath() {
  ensureStorage();
  return STORAGE_PATH;
}

export function readLetters() {
  ensureStorage();
  if (!existsSync(STORAGE_PATH)) {
    return [];
  }
  return JSON.parse(readFileSync(STORAGE_PATH, 'utf8'));
}

export async function writeLetters(letters) {
  ensureStorage();
  const payload = JSON.stringify(letters, null, 2) + '\n';

  writeFileSync(STORAGE_PATH, payload, 'utf8');

  const publicPath = join(ROOT, 'public', 'letters.json');
  writeFileSync(publicPath, payload, 'utf8');

  const distPath = join(ROOT, 'dist', 'letters.json');
  if (existsSync(join(ROOT, 'dist'))) {
    writeFileSync(distPath, payload, 'utf8');
  }

  await syncLettersToGitHub(payload);
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
    res.setHeader('Cache-Control', 'no-store');
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
      void (async () => {
        try {
          const letters = JSON.parse(body);
          if (!Array.isArray(letters)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Expected an array of letters' }));
            return;
          }
          await writeLetters(letters);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, count: letters.length, persisted: true }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Save failed' }));
        }
      })();
    });
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method not allowed' }));
}

export function serveLettersJson(_req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(readLetters()));
}
