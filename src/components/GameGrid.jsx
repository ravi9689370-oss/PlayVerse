import React from 'react';
import GameCard from './GameCard.jsx';

export default function GameGrid({ games, emptyMessage }) {
  if (!games || games.length === 0) {
    return emptyMessage || null;
  }
  return (
    <div className="grid">
      {games.map((game) => (
        <GameCard key={game.slug} game={game} />
      ))}
    </div>
  );
}
