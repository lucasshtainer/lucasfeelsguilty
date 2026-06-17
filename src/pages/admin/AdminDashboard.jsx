import { Link } from 'react-router-dom';
import { setAdminSession, useLetters } from '../../context/LettersContext.jsx';

export default function AdminDashboard() {
  const { letters, loading, error } = useLetters();

  function handleLogout() {
    setAdminSession(false);
    window.location.href = '/admin/login';
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-header__kicker">lucasfeelsguilty</p>
          <h1 className="admin-header__title">Stories</h1>
        </div>
        <div className="admin-header__actions">
          <Link className="admin-btn admin-btn--primary" to="/admin/new">
            + New story
          </Link>
          <Link className="admin-btn" to="/">
            View site
          </Link>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {loading ? <p className="admin-status">Loading stories…</p> : null}
      {error ? <p className="admin-status admin-status--error">{error}</p> : null}

      <ul className="admin-story-list">
        {letters.map((letter) => (
          <li key={letter.slug} className="admin-story-card">
            <div
              className="admin-story-card__swatch"
              style={{ background: letter.theme?.backgroundColor || '#4b0082' }}
              aria-hidden="true"
            />
            <div className="admin-story-card__body">
              <p className="admin-story-card__date">{letter.displayDate}</p>
              <h2 className="admin-story-card__title">{letter.title}</h2>
              <p className="admin-story-card__meta">
                {letter.galleryLabel}
                {letter.password ? ' · 🔒 locked' : ''}
                {letter.banner?.enabled ? ' · banner on' : ''}
              </p>
            </div>
            <div className="admin-story-card__actions">
              <Link className="admin-btn" to={`/letter/${letter.slug}`} target="_blank" rel="noreferrer">
                Preview
              </Link>
              <Link className="admin-btn admin-btn--primary" to={`/admin/edit/${letter.slug}`}>
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
