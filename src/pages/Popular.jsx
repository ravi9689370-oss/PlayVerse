import React from 'react';
import GameGrid from '../components/GameGrid.jsx';
import { popularGames } from '../data/games.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const FAQS = [
  {
    q: 'What makes these games so popular?',
    a: 'This list is a hand-picked editorial selection of PlayVerse favorites - quick to start, fun in short sessions, and playable on both desktop and mobile.',
  },
  {
    q: 'Do I need to download anything?',
    a: 'No. Every game runs directly in your browser. If you want a native experience, the PlayVerse Android app packages the same games.',
  },
  {
    q: 'Are my scores saved?',
    a: 'Your best results, favorites and play history are stored locally on your device. Nothing is uploaded to a server.',
  },
  {
    q: 'Is PlayVerse free?',
    a: 'Yes - completely free, with no ads and no accounts.',
  },
];

export default function Popular() {
  useDocumentTitle('Popular Games - PlayVerse');
  const games = popularGames();

  return (
    <>
      <div className="page-head">
        <h1>🔥 Popular Games</h1>
        <p>The community favorites of the Verse - a curated editorial ranking, updated with each release.</p>
      </div>
      <GameGrid games={games} />

      <section className="section" style={{ maxWidth: 780 }}>
        <h2 style={{ margin: '30px 0 6px' }}>FAQ</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          What makes these so popular? Find out below.
        </p>
        {FAQS.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <div className="faq-body">{f.a}</div>
          </details>
        ))}
      </section>
    </>
  );
}
