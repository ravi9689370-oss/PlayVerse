import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';
import SearchBar from '../components/SearchBar.jsx';
import GameGrid from '../components/GameGrid.jsx';
import { popularGames, searchGames } from '../data/games.js';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found - PlayVerse');
  const navigate = useNavigate();
  const suggestions = popularGames().slice(0, 4);

  return (
    <>
      <div className="page-head" style={{ textAlign: 'center', marginTop: 30 }}>
        <div style={{ fontSize: '3.4rem' }} aria-hidden="true">🛸</div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', margin: '10px 0 6px' }}>404</h1>
        <p style={{ fontSize: '1.05rem' }}>
          This page drifted out of the Verse. It may have been moved, renamed or never existed.
        </p>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto 10px' }}>
        <SearchBar onSubmit={(q) => navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search')} />
      </div>

      <div style={{ maxWidth: 780, margin: '26px auto 0' }}>
        <GameGrid games={suggestions} />
        <EmptyState icon="🧭" title="Looking for something specific?">
          Browse <Link to="/popular">popular games</Link>, <Link to="/categories">categories</Link> or read the{' '}
          <Link to="/help">help center</Link>.
        </EmptyState>
      </div>
    </>
  );
}
