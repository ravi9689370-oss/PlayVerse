import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, GAMES } from '../data/games.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Categories() {
  useDocumentTitle('Game Categories - PlayVerse');

  return (
    <>
      <div className="page-head">
        <h1>🗂️ Categories</h1>
        <p>Browse the Verse by genre.</p>
      </div>
      <div className="cat-grid">
        {CATEGORIES.map((c) => {
          const count = GAMES.filter((x) => x.category === c.slug && x.published).length;
          return (
            <Link key={c.slug} to={`/category/${c.slug}`} className="cat-tile">
              <div className="cat-icon" aria-hidden="true">{c.icon}</div>
              <h3>{c.label}</h3>
              <p>{c.blurb}</p>
              <p style={{ color: 'var(--accent-strong)', fontWeight: 700, marginTop: 8 }}>
                {count} game{count === 1 ? '' : 's'} →
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
