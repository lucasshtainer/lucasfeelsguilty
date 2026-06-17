import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sortLetters } from '../utils/sortLetters.js';

const ADMIN_TOKEN_KEY = 'lfg-admin-token';
const ADMIN_PASSWORD = 'ava123';

const LettersContext = createContext(null);

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminSession(active) {
  if (active) {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, ADMIN_PASSWORD);
  } else {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function isAdminLoggedIn() {
  return getAdminToken() === ADMIN_PASSWORD;
}

export function LettersProvider({ children }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLetters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/letters.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not load stories');
      const data = await res.json();
      setLetters(sortLetters(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  const saveLetters = useCallback(async (nextLetters) => {
    const sorted = sortLetters(nextLetters);
    const token = getAdminToken();
    if (!token) {
      throw new Error('Not logged in');
    }

    const res = await fetch('/api/letters', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(sorted)
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Save failed — is the server running?');
    }

    setLetters(sorted);
    return sorted;
  }, []);

  const letterBySlug = useCallback(
    (slug) => letters.find((l) => l.slug === slug),
    [letters]
  );

  const value = useMemo(
    () => ({
      letters,
      loading,
      error,
      loadLetters,
      saveLetters,
      letterBySlug
    }),
    [letters, loading, error, loadLetters, saveLetters, letterBySlug]
  );

  return <LettersContext.Provider value={value}>{children}</LettersContext.Provider>;
}

export function useLetters() {
  const ctx = useContext(LettersContext);
  if (!ctx) throw new Error('useLetters must be used within LettersProvider');
  return ctx;
}
