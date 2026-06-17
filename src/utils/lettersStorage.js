const STORAGE_KEY = 'lfg-letters-cache';

/** @typedef {{ letters: import('../types/letter.js').Letter[], updatedAt: number, source: 'local' | 'server' }} LettersCache */

/** @returns {LettersCache | null} */
export function readLocalLetters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.letters)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** @param {import('../types/letter.js').Letter[]} letters @param {'local' | 'server'} source */
export function writeLocalLetters(letters, source = 'local') {
  /** @type {LettersCache} */
  const payload = {
    letters,
    updatedAt: Date.now(),
    source
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearLocalLetters() {
  localStorage.removeItem(STORAGE_KEY);
}

export function apiBase() {
  const configured = import.meta.env.VITE_LETTERS_API?.replace(/\/$/, '');
  if (!configured) return '';
  if (configured.startsWith('http')) return configured;
  return `https://${configured}`;
}

export function lettersApiUrl() {
  return `${apiBase()}/api/letters`;
}

export async function fetchServerLetters() {
  const res = await fetch(lettersApiUrl(), { cache: 'no-store' });
  if (!res.ok) return null;

  const type = res.headers.get('content-type') || '';
  if (!type.includes('application/json')) return null;

  const data = await res.json();
  if (!Array.isArray(data)) return null;
  return data;
}

export async function fetchStaticLetters() {
  const res = await fetch(`${apiBase()}/letters.json`, { cache: 'no-store' });
  if (!res.ok) return null;

  const type = res.headers.get('content-type') || '';
  if (!type.includes('json')) return null;

  const data = await res.json();
  if (!Array.isArray(data)) return null;
  return data;
}

/** @param {import('../types/letter.js').Letter[]} letters */
export async function saveServerLetters(letters) {
  const token = sessionStorage.getItem('lfg-admin-token');
  if (!token) throw new Error('Not logged in');

  const res = await fetch(lettersApiUrl(), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(letters)
  });

  const type = res.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    throw new Error('Server API unavailable — saved on this device only');
  }

  const body = await res.json();
  if (!res.ok || !body.ok) {
    throw new Error(body.error || 'Save failed');
  }

  return body;
}
