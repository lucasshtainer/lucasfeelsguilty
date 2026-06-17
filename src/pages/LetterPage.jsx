import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLetters } from '../context/LettersContext.jsx';
import { letterThemeVars } from '../types/letter.js';
import './LetterPage.css';

function unlockKey(slug) {
  return `letter-unlock-${slug}`;
}

function isUnlocked(letter) {
  if (!letter.password) return true;
  return sessionStorage.getItem(unlockKey(letter.slug)) === '1';
}

export default function LetterPage() {
  const { slug } = useParams();
  const { letterBySlug, letters } = useLetters();
  const letter = letterBySlug(slug);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [unlocked, setUnlocked] = useState(() => (letter ? isUnlocked(letter) : false));

  useEffect(() => {
    if (letter) {
      setUnlocked(isUnlocked(letter));
      setPasswordInput('');
      setPasswordError(false);
    }
  }, [slug, letter]);

  useEffect(() => {
    if (!letter?.theme?.backgroundColor) return;
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = letter.theme.backgroundColor;
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, [letter]);

  if (!letter) {
    return (
      <div className="letter-page letter-page--missing">
        <p>This letter is not in the archive.</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  const index = letters.findIndex((l) => l.slug === letter.slug);
  const prev = index > 0 ? letters[index - 1] : null;
  const next = index < letters.length - 1 ? letters[index + 1] : null;
  const themeStyle = letterThemeVars(letter);
  const showBanner = letter.banner?.enabled && (letter.banner.text || letter.banner.image);

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwordInput === letter.password) {
      sessionStorage.setItem(unlockKey(letter.slug), '1');
      setUnlocked(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      setPasswordError(true);
    }
  }

  if (letter.password && !unlocked) {
    return (
      <div className="letter-page letter-page--locked" style={themeStyle}>
        <header className="letter-page__header">
          <p className="letter-page__date">{letter.displayDate}</p>
          <h1 className="letter-page__title">{letter.title}</h1>
          {letter.subtitle ? <p className="letter-page__subtitle">{letter.subtitle}</p> : null}
        </header>
        <div className="letter-page__gate">
          <p className="letter-page__gate-lead">This letter is private. Enter the password to read it.</p>
          <form className="letter-page__gate-form" onSubmit={handlePasswordSubmit}>
            <label className="letter-page__gate-label" htmlFor="letter-password">
              Password
            </label>
            <input
              id="letter-password"
              className={`letter-page__gate-input ${passwordError ? 'letter-page__gate-input--error' : ''}`}
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              autoComplete="off"
              autoFocus
            />
            {passwordError ? (
              <p className="letter-page__gate-error" role="alert">
                That password didn&apos;t work. Try again.
              </p>
            ) : null}
            <button type="submit" className="letter-page__gate-submit">
              Read letter
            </button>
          </form>
          <Link className="letter-page__gate-back" to="/">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="letter-page" style={themeStyle}>
      {showBanner ? (
        <div className="letter-page__banner">
          {letter.banner.image ? (
            <img className="letter-page__banner-image" src={letter.banner.image} alt="" />
          ) : null}
          {letter.banner.text ? <p className="letter-page__banner-text">{letter.banner.text}</p> : null}
        </div>
      ) : null}
      <header className="letter-page__header">
        <p className="letter-page__date">{letter.displayDate}</p>
        <h1 className="letter-page__title">{letter.title}</h1>
        {letter.subtitle ? <p className="letter-page__subtitle">{letter.subtitle}</p> : null}
      </header>
      <div className="letter-page__body">
        {letter.paragraphs.map((block, i) => {
          const lines = block.split('\n');
          return (
            <p key={i} className="letter-page__para">
              {lines.map((line, j) => (
                <span key={j}>
                  {line}
                  {j < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          );
        })}
      </div>
      <nav className="letter-page__nav">
        {prev ? (
          <Link className="letter-page__nav-link" to={`/letter/${prev.slug}`}>
            ← Previous
          </Link>
        ) : (
          <span className="letter-page__nav-spacer" />
        )}
        <Link className="letter-page__nav-link letter-page__nav-link--center" to="/">
          Home
        </Link>
        {next ? (
          <Link className="letter-page__nav-link letter-page__nav-link--next" to={`/letter/${next.slug}`}>
            Next →
          </Link>
        ) : (
          <span className="letter-page__nav-spacer" />
        )}
      </nav>
    </article>
  );
}
