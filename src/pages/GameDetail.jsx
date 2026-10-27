import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GameGridSkeleton } from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GameGrid from '../components/GameGrid.jsx';
import { GAME_COMPONENTS } from '../games/registry.js';
import { getCategory, getGame, relatedGames, popularGames } from '../data/games.js';
import { useFavorites } from '../hooks/useFavorites.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';

export default function GameDetail() {
  const { slug } = useParams();
  const game = getGame(slug);
  useDocumentTitle(game ? `${game.title} - Play now | PlayVerse` : 'Game not found - PlayVerse');

  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const [remountKey, setRemountKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => sfx.isEnabled());
  const stageRef = useRef(null);
  const playerRef = useRef(null);

  // Track play history + announce title change between games.
  useEffect(() => {
    if (game && game.launchType === 'internal') {
      store.recordPlayed(game.slug);
    }
    setRemountKey((k) => k + 1);
  }, [game?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (!game) {
    return (
      <EmptyState icon="🛸" title="Game not found">
        This game does not exist in the Verse. Try <Link to="/popular">popular games</Link> or{' '}
        <Link to="/categories">categories</Link>.
      </EmptyState>
    );
  }

  const cat = getCategory(game.category);
  const fav = isFavorite(game.slug);
  const playable = game.launchType === 'internal';
  const GameComponent = playable ? GAME_COMPONENTS[game.componentKey] : null;
  const siblings = popularGames();
  const idx = siblings.findIndex((x) => x.slug === game.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const related = relatedGames(game, 4);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (stageRef.current?.requestFullscreen) {
        await stageRef.current.requestFullscreen();
      } else {
        // Fullscreen unsupported in this webview - fall back to expanded layout
        setFullscreen((v) => !v);
      }
    } catch {
      setFullscreen((v) => !v);
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    sfx.setEnabled(next);
    setSoundOn(next);
  };

  return (
    <>
      <nav aria-label="Breadcrumb" style={{ fontSize: '0.85rem', color: 'var(--text-faint)', marginBottom: 14 }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        {' / '}
        <Link to={`/category/${game.category}`} style={{ color: 'var(--text-muted)' }}>{cat?.label}</Link>
        {' / '}
        <span style={{ color: 'var(--text)' }}>{game.title}</span>
      </nav>

      <div className="player-frame">
        <div className="player-toolbar">
          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>🎮 {game.title}</span>
          <span style={{ flex: 1 }} />
          <button className="tool-btn" onClick={() => setRemountKey((k) => k + 1)} disabled={!playable} title="Restart game">
            ↻ Restart
          </button>
          <button className="tool-btn" onClick={toggleSound} aria-pressed={soundOn} title="Toggle sound">
            {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
          </button>
          <button className="tool-btn" onClick={toggleFullscreen} title="Toggle fullscreen">
            {fullscreen ? '⤢ Exit fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
        <div ref={stageRef} className={`player-stage${fullscreen ? ' in-fullscreen' : ''}`}>
          {playable ? (
            <Suspense fallback={<GameGridSkeleton count={1} />}>
              <div key={remountKey}>
                <GameComponent />
              </div>
            </Suspense>
          ) : (
            <div className="game-container">
              <div className="soon-box" style={{ width: '100%', maxWidth: 560, margin: '60px auto' }}>
                <div className="soon-icon" aria-hidden="true">🚧</div>
                <h3>{game.title} is coming soon</h3>
                <p>
                  This catalog entry is still in development and is not playable yet. Meanwhile, the seven
                  launched games are ready to play right now.
                </p>
                <Link to="/popular" className="btn btn-primary">Browse playable games</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="game-hero" style={{ marginTop: 28 }}>
        <img src={game.thumbnail} alt={`${game.title} artwork`} width={400} height={300} />
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3.6vw, 2.2rem)' }}>{game.title}</h1>
          <div className="game-meta-row">
            <Link to={`/category/${game.category}`} className="meta-pill cat">
              {cat?.icon} {cat?.label}
            </Link>
            <span className="meta-pill">
              {playable ? '✅ Playable' : '🚧 Coming soon'}
            </span>
            <span className="meta-pill">Updated {new Date(game.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{game.description}</p>
          <div className="row" style={{ marginTop: 16 }}>
            <button
              className={`btn ${fav ? 'btn-ghost' : 'btn-primary'}`}
              onClick={() => toggle(game.slug)}
              aria-pressed={fav}
            >
              {fav ? '❤ In favorites' : '♡ Add to favorites'}
            </button>
            {playable && (
              <button className="btn btn-ghost" onClick={() => playerRef.current?.scrollIntoView?.({ behavior: 'smooth' })}>
                Jump to player
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="info-panel">
        <h3>ℹ️ About this game</h3>
        <p>
          {game.description} {playable ? 'Runs fully offline in your browser - no loading screens, no accounts.' : 'Watch the New Releases page for its launch.'}
        </p>
      </div>

      {playable && (
        <>
          <div className="info-panel">
            <h3>📖 How to play</h3>
            <p>{game.instructions}</p>
          </div>
          <div className="info-panel">
            <h3>🎛️ Controls</h3>
            <p>{game.controls}</p>
          </div>
        </>
      )}

      <div className="prev-next">
        {prev ? (
          <Link to={`/game/${prev.slug}`} title={prev.title}>← Previous: {prev.title}</Link>
        ) : <span />}
        {next ? (
          <Link to={`/game/${next.slug}`} title={next.title}>Next: {next.title} →</Link>
        ) : <span />}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Games like {game.title}</h2>
          <Link className="see-all" to="/popular">See all →</Link>
        </div>
        <GameGrid games={related} />
      </section>
    </>
  );
}
