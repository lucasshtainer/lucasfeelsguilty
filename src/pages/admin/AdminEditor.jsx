import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLetters } from '../../context/LettersContext.jsx';
import { createEmptyLetter, DEFAULT_THEME } from '../../types/letter.js';

function paragraphsToText(paragraphs) {
  return (paragraphs || []).join('\n\n');
}

function textToParagraphs(text) {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function AdminEditor({ isNew = false }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { letters, saveLetters } = useLetters();
  const [form, setForm] = useState(() => createEmptyLetter());
  const [bodyText, setBodyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNew) {
      const empty = createEmptyLetter();
      setForm(empty);
      setBodyText(paragraphsToText(empty.paragraphs));
      return;
    }
    const existing = letters.find((l) => l.slug === slug);
    if (existing) {
      setForm({
        ...existing,
        theme: { ...DEFAULT_THEME, ...existing.theme },
        banner: { enabled: false, text: '', image: '', ...existing.banner }
      });
      setBodyText(paragraphsToText(existing.paragraphs));
    }
  }, [isNew, slug, letters]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateTheme(field, value) {
    setForm((prev) => ({
      ...prev,
      theme: { ...DEFAULT_THEME, ...prev.theme, [field]: value }
    }));
  }

  function updateBanner(field, value) {
    setForm((prev) => ({
      ...prev,
      banner: { enabled: false, text: '', image: '', ...prev.banner, [field]: value }
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const next = {
      ...form,
      paragraphs: textToParagraphs(bodyText),
      subtitle: form.subtitle?.trim() || undefined,
      password: form.password?.trim() || undefined,
      theme: form.theme,
      banner: form.banner?.enabled
        ? {
            enabled: true,
            text: form.banner.text?.trim() || '',
            image: form.banner.image?.trim() || ''
          }
        : { enabled: false, text: '', image: '' }
    };

    const withoutCurrent = isNew ? letters : letters.filter((l) => l.slug !== slug);
    const slugTaken = withoutCurrent.some((l) => l.slug === next.slug);
    if (slugTaken && (isNew || next.slug !== slug)) {
      setError('That slug is already used. Pick a unique one.');
      setSaving(false);
      return;
    }

    try {
      await saveLetters([...withoutCurrent, next]);
      setMessage('Saved! Changes are written to disk and stay after you reload.');
      if (isNew) {
        navigate(`/admin/edit/${next.slug}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isNew) return;
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return;

    setSaving(true);
    setError(null);
    try {
      await saveLetters(letters.filter((l) => l.slug !== slug));
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
      setSaving(false);
    }
  }

  const previewStyle = {
    background: form.theme?.backgroundColor || DEFAULT_THEME.backgroundColor,
    color: form.theme?.textColor || DEFAULT_THEME.textColor,
    borderColor: form.theme?.accentColor || DEFAULT_THEME.accentColor
  };

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-header__kicker">Editing</p>
          <h1 className="admin-header__title">{isNew ? 'New story' : form.title}</h1>
        </div>
        <div className="admin-header__actions">
          <Link className="admin-btn" to="/admin">
            ← All stories
          </Link>
          {!isNew ? (
            <Link className="admin-btn" to={`/letter/${form.slug}`} target="_blank" rel="noreferrer">
              Preview
            </Link>
          ) : null}
        </div>
      </header>

      <form className="admin-form" onSubmit={handleSave}>
        <section className="admin-form__section">
          <h2 className="admin-form__heading">Basics</h2>
          <div className="admin-form__grid">
            <label className="admin-field">
              <span>Title</span>
              <input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                required
              />
            </label>
            <label className="admin-field">
              <span>Subtitle</span>
              <input
                value={form.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Slug (URL)</span>
              <input
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                required
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
              />
            </label>
            <label className="admin-field">
              <span>ISO date</span>
              <input
                type="date"
                value={form.isoDate}
                onChange={(e) => updateField('isoDate', e.target.value)}
                required
              />
            </label>
            <label className="admin-field">
              <span>Display date</span>
              <input
                value={form.displayDate}
                onChange={(e) => updateField('displayDate', e.target.value)}
                required
              />
            </label>
            <label className="admin-field">
              <span>Nav label</span>
              <input
                value={form.galleryLabel}
                onChange={(e) => updateField('galleryLabel', e.target.value)}
                required
              />
            </label>
            <label className="admin-field">
              <span>Same-day order</span>
              <input
                type="number"
                min="0"
                value={form.sameDayOrder ?? 0}
                onChange={(e) => updateField('sameDayOrder', Number(e.target.value))}
              />
            </label>
            <label className="admin-field">
              <span>Cover image URL</span>
              <input
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Letter password (optional)</span>
              <input
                type="text"
                value={form.password || ''}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Leave blank for public"
                autoComplete="off"
              />
            </label>
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__heading">Story body</h2>
          <p className="admin-form__hint">Separate paragraphs with a blank line. Use a single line break inside a paragraph for sign-offs like &quot;Love,\nLucas&quot;.</p>
          <textarea
            className="admin-form__body"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={18}
            required
          />
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__heading">Colors</h2>
          <div className="admin-form__grid admin-form__grid--colors">
            <label className="admin-field admin-field--color">
              <span>Background</span>
              <input
                type="color"
                value={form.theme?.backgroundColor || DEFAULT_THEME.backgroundColor}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
              />
              <input
                value={form.theme?.backgroundColor || DEFAULT_THEME.backgroundColor}
                onChange={(e) => updateTheme('backgroundColor', e.target.value)}
              />
            </label>
            <label className="admin-field admin-field--color">
              <span>Accent</span>
              <input
                type="color"
                value={form.theme?.accentColor || DEFAULT_THEME.accentColor}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
              />
              <input
                value={form.theme?.accentColor || DEFAULT_THEME.accentColor}
                onChange={(e) => updateTheme('accentColor', e.target.value)}
              />
            </label>
            <label className="admin-field admin-field--color">
              <span>Text</span>
              <input
                type="color"
                value={form.theme?.textColor || DEFAULT_THEME.textColor}
                onChange={(e) => updateTheme('textColor', e.target.value)}
              />
              <input
                value={form.theme?.textColor || DEFAULT_THEME.textColor}
                onChange={(e) => updateTheme('textColor', e.target.value)}
              />
            </label>
          </div>
          <div className="admin-preview-swatch" style={previewStyle}>
            <p className="admin-preview-swatch__label">Preview</p>
            <h3>{form.title}</h3>
            <p>{form.subtitle || 'Subtitle appears here'}</p>
          </div>
        </section>

        <section className="admin-form__section">
          <h2 className="admin-form__heading">Banner</h2>
          <label className="admin-field admin-field--checkbox">
            <input
              type="checkbox"
              checked={!!form.banner?.enabled}
              onChange={(e) => updateBanner('enabled', e.target.checked)}
            />
            <span>Show banner at top of story</span>
          </label>
          <div className="admin-form__grid">
            <label className="admin-field">
              <span>Banner text</span>
              <input
                value={form.banner?.text || ''}
                onChange={(e) => updateBanner('text', e.target.value)}
                disabled={!form.banner?.enabled}
              />
            </label>
            <label className="admin-field">
              <span>Banner image URL</span>
              <input
                value={form.banner?.image || ''}
                onChange={(e) => updateBanner('image', e.target.value)}
                disabled={!form.banner?.enabled}
                placeholder="Optional — shows above text"
              />
            </label>
          </div>
        </section>

        {message ? <p className="admin-status admin-status--success">{message}</p> : null}
        {error ? <p className="admin-status admin-status--error">{error}</p> : null}

        <div className="admin-form__actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save story'}
          </button>
          {!isNew ? (
            <button type="button" className="admin-btn admin-btn--danger" onClick={handleDelete} disabled={saving}>
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
