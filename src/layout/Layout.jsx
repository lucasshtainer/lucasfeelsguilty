import { Link, Outlet, useLocation } from 'react-router-dom';
import { letters } from '../data/letters.js';
import './Layout.css';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="site">
      <header className="site-header">
        <div className="site-header__top">
          <Link to="/" className="site-wordmark">
            lucasfeelsguilty
          </Link>
        </div>
        <nav className="letter-chips" aria-label="Jump to letter">
          {letters.map((l) => (
            <Link
              key={l.slug}
              to={`/letter/${l.slug}`}
              className={`letter-chip ${location.pathname === `/letter/${l.slug}` ? 'is-active' : ''}`}
            >
              <span className="letter-chip__date">{l.displayDate}</span>
              <span className="letter-chip__label">{l.title}</span>
            </Link>
          ))}
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
