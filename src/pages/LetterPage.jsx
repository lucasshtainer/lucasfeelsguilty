import { Link, useParams } from 'react-router-dom';
import { letterBySlug, letters } from '../data/letters.js';
import './LetterPage.css';

export default function LetterPage() {
  const { slug } = useParams();
  const letter = letterBySlug(slug);

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

  return (
    <article className="letter-page">
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
