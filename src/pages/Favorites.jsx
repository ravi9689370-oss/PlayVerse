import React from 'react';
import { Link } from 'react-router-dom';
import GameGrid from '../components/GameGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getGame, popularGames } from '../data/games.js';
import { useFavorites } from '../hooks/useFavorites.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Favorites() {
  useDocumentTitle('Favorites - PlayVerse');
  const { favorites } = useFavorites();
  const games = favorites.map(getGame).filter(Boolean);

  return (
    <>
      <div className="page-head">
        <h1>❤️ Favorites</h1>
        <p>Games you marked as favorites, saved on this device only.</p>
      </div>
      <GameGrid
        games={games}
        emptyMessage={
          <EmptyState icon="💜" title="No favorites yet">
            Tap the heart on any game card or game page to save it here for quick access.
          </EmptyState>
        }
      />
      {games.length > 0 && (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem', marginTop: 18 }}>
          Tip: favorites are stored locally in your browser and never leave your device.
        </p>
      )}
    </>
  );
}
