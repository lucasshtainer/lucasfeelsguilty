import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sortLetters } from '../utils/sortLetters.js';
import {
  fetchServerLetters,
  fetchStaticLetters,
  readLocalLetters,
  saveServerLetters,
  writeLocalLetters
} from '../utils/lettersStorage.js';

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

function sameLetters(a, b) {
  return JSON.stringify(sortLetters(a)) === JSON.stringify(sortLetters(b));
}

export function LettersProvider({ children }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMode, setSaveMode] = useState(null);

  const loadLetters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const local = readLocalLetters();
      const server = await fetchServerLetters();
      const fallback = server ? null : await fetchStaticLetters();
      const remote = server || fallback;

      let chosen = remote;
      let mode = server ? 'server' : fallback ? 'static' : null;

      if (local && remote) {
        if (!sameLetters(local.letters, remote) && local.source === 'local') {
          chosen = local.letters;
          mode = 'local';
        }
      } else if (local && !remote) {
        chosen = local.letters;
        mode = 'local';
      }

      if (!chosen) {
        throw new Error('Could not load stories');
      }

      const sorted = sortLetters(chosen);
      setLetters(sorted);
      setSaveMode(mode);
      writeLocalLetters(sorted, mode === 'server' ? 'server' : 'local');
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
    if (!getAdminToken()) {
      throw new Error('Not logged in');
    }

    writeLocalLetters(sorted, 'local');
    setLetters(sorted);

    try {
      await saveServerLetters(sorted);
      writeLocalLetters(sorted, 'server');
      setSaveMode('server');
      return { mode: 'server' };
    } catch (err) {
      setSaveMode('local');
      throw err;
    }
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
      saveMode,
      loadLetters,
      saveLetters,
      letterBySlug
    }),
    [letters, loading, error, saveMode, loadLetters, saveLetters, letterBySlug]
  );

  return <LettersContext.Provider value={value}>{children}</LettersContext.Provider>;
}

export function useLetters() {
  const ctx = useContext(LettersContext);
  if (!ctx) throw new Error('useLetters must be used within LettersProvider');
  return ctx;
}
