import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategory } from '../data/games.js';
import { useFavorites } from '../hooks/useFavorites.js';

export default function GameCard({ game }) {
  const { isFavorite, toggle } = useFavorites();
  const [loaded, setLoaded] = useState(false);
  const cat = getCategory(game.category);
  const fav = isFavorite(game.slug);
  const unavailable = game.launchType !== 'internal';

  return (
    <Link
      to={`/game/${game.slug}`}
      className="game-card"
      aria-label={unavailable ? `${game.title} (coming soon)` : `Play ${game.title}`}
    >
      <div className="thumb-wrap">
        <img
          src={game.thumbnail}
          alt=""
          loading="lazy"
          className={loaded ? 'loaded' : ''}
          onLoad={() => setLoaded(true)}
          width={400}
          height={300}
        />
        {unavailable && <span className="badge-soon">Soon</span>}
        <button
          type="button"
          className={`badge-fav${fav ? ' is-fav' : ''}`}
          aria-label={fav ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
          aria-pressed={fav}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(game.slug);
          }}
        >
          {fav ? '❤' : '♡'}
        </button>
        {!unavailable && (
          <div className="play-badge" aria-hidden="true">
            <span>▶</span>
          </div>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-title">{game.title}</h3>
        <div className="card-meta">
          <span aria-hidden="true">{cat?.icon}</span>
          <span>{cat?.label || game.category}</span>
          {unavailable && <span>· coming soon</span>}
        </div>
      </div>
    </Link>
  );
}
