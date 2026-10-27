import React from 'react';
import GameGrid from '../components/GameGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { newGames } from '../data/games.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NewReleases() {
  useDocumentTitle('New Games - PlayVerse');
  const games = newGames();

  return (
    <>
      <div className="page-head">
        <h1>✨ New Releases</h1>
        <p>The latest additions to the Verse, freshest first.</p>
      </div>
      <GameGrid
        games={games}
        emptyMessage={
          <EmptyState icon="🌱" title="No new games yet">
            The next release is being prepared. Check back soon!
          </EmptyState>
        }
      />
    </>
  );
}
