import React from 'react';
import { Link } from 'react-router-dom';
import GameGrid from '../components/GameGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getGame } from '../data/games.js';
import { useRecent } from '../hooks/useFavorites.js';
import { store } from '../utils/storage.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function RecentlyPlayed() {
  useDocumentTitle('Recently Played - PlayVerse');
  const recent = useRecent();
  const games = recent.map((r) => getGame(r.slug)).filter(Boolean);

  return (
    <>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1>🕰️ Recently Played</h1>
          <p>Your play history on this device, newest first.</p>
        </div>
        {games.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={() => store.clearRecent()}>
            Clear history
          </button>
        )}
      </div>
      <GameGrid
        games={games}
        emptyMessage={
          <EmptyState icon="🎬" title="Nothing played yet">
            Games you open appear here automatically. Start with the{' '}
            <Link to="/popular">popular picks</Link>.
          </EmptyState>
        }
      />
    </>
  );
}
