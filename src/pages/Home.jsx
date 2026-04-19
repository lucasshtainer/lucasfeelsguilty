import TextCursor from '../components/TextCursor.jsx';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <TextCursor text="❤" spacing={88} maxPoints={6} removalInterval={28} />
      <div className="home__content">
        <p className="home__kicker">for Ava</p>
        <h1 className="home__title" aria-label="lucasfeelsguilty dot com">
          <span className="home__title-line">
            <span className="home__title-word">lucas</span>
            <span className="home__title-word home__title-word--accent">feels</span>
            <span className="home__title-word">guilty</span>
          </span>
          <span className="home__title-domain">.com</span>
        </h1>
        <p className="home__tagline">A quiet archive of letters — pick a date above.</p>
      </div>
    </div>
  );
}
