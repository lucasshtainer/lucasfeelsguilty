import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLetters } from '../context/LettersContext.jsx';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const { letters, loading } = useLetters();

  return (
    <div className="site">
      <header className="site-header">
        <div className="site-header__top">
          <Link to="/" className="site-wordmark">
            lucasfeelsguilty
          </Link>
        </div>
        <nav className="letter-chips" aria-label="Jump to letter">
          {loading ? (
            <span className="letter-chips__loading">Loading…</span>
          ) : (
            letters.map((l) => (
              <Link
                key={l.slug}
                to={`/letter/${l.slug}`}
                className={`letter-chip ${location.pathname === `/letter/${l.slug}` ? 'is-active' : ''}`}
                style={
                  l.theme?.backgroundColor
                    ? { background: `${l.theme.backgroundColor}55`, borderColor: `${l.theme.accentColor || '#cf9fff'}44` }
                    : undefined
                }
              >
                <span className="letter-chip__date">{l.displayDate}</span>
                <span className="letter-chip__label">
                  {l.title}
                  {l.password ? <span className="letter-chip__lock" aria-hidden="true"> 🔒</span> : null}
                </span>
              </Link>
            ))
          )}
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
