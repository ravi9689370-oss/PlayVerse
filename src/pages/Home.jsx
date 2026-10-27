import React from 'react';
import { Link } from 'react-router-dom';
import GameGrid from '../components/GameGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { popularGames, newGames, CATEGORIES } from '../data/games.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Home() {
  useDocumentTitle('PlayVerse - Free Online Games');
  const popular = popularGames().slice(0, 6);
  const fresh = newGames().slice(0, 6);

  return (
    <>
      <section className="hero">
        <h1>
          Play <span className="grad">free games</span> in the Verse
        </h1>
        <p>
          Original arcade, puzzle and memory games that run right in your browser - no downloads, no install,
          no accounts. Tap a game and play.
        </p>
        <div className="hero-actions">
          <Link to="/popular" className="btn btn-primary">🔥 Popular games</Link>
          <Link to="/new" className="btn btn-ghost">✨ New releases</Link>
        </div>
      </section>

      <div className="chip-row" aria-label="Game categories">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className="chip">
            <span aria-hidden="true">{c.icon}</span> {c.label}
          </Link>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>🔥 Featured popular</h2>
          <Link className="see-all" to="/popular">See all →</Link>
        </div>
        <GameGrid games={popular} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>✨ Fresh in the Verse</h2>
          <Link className="see-all" to="/new">See all →</Link>
        </div>
        <GameGrid games={fresh} />
      </section>

      <section className="section">
        <div className="section-head">
          <h2>What is PlayVerse?</h2>
        </div>
        <div className="info-panel">
          <p>
            PlayVerse is a free online gaming platform. Every featured game is an original creation that runs
            entirely in your browser - on desktop and on Android through the PlayVerse app. Pick a game, play
            instantly, and track your best runs with favorites and recently played. Have questions? Visit the{' '}
            <Link to="/faq">FAQ</Link> or the <Link to="/help">help center</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
