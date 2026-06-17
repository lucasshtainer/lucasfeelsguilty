import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isAdminLoggedIn, setAdminSession } from '../../context/LettersContext.jsx';

const ADMIN_PASSWORD = 'ava123';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminSession(true);
      setError(false);
      navigate('/admin', { replace: true });
    } else {
      setError(true);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <p className="admin-login__kicker">lucasfeelsguilty</p>
        <h1 className="admin-login__title">Admin</h1>
        <p className="admin-login__lead">Sign in to edit stories.</p>
        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-login__label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className={`admin-login__input ${error ? 'admin-login__input--error' : ''}`}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            autoFocus
            autoComplete="current-password"
          />
          {error ? (
            <p className="admin-login__error" role="alert">
              Wrong password.
            </p>
          ) : null}
          <button type="submit" className="admin-login__submit">
            Sign in
          </button>
        </form>
        <Link className="admin-login__back" to="/">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
