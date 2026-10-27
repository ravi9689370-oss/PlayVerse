import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';

const SYMBOLS = ['🚀', '🪐', '⭐', '🛸', '☄️', '🌙', '🔭', '👽'];

function buildDeck() {
  const deck = [...SYMBOLS, ...SYMBOLS].map((sym, i) => ({ key: `${sym}-${i}`, sym, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function CosmoMatch() {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]); // indexes of face-up cards
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [best, setBest] = useState(() => store.getBest('cosmo-match.moves'));
  const lockRef = useRef(false);
  const timerRef = useRef(null);

  const won = deck.length > 0 && deck.every((c) => c.matched);

  useEffect(() => {
    if (won || deck.every((c) => !c.matched && flipped.length === 0)) {
      // start ticking on first flip
    }
  }, [deck, flipped, won]);

  const started = moves > 0;

  useEffect(() => {
    if (!started || won) return undefined;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [started, won]);

  useEffect(() => {
    if (won) {
      sfx.play('win');
      if (best === null || moves < best) {
        store.setBest('cosmo-match.moves', moves);
        setBest(moves);
      }
    }
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (idx) => {
    if (lockRef.current || won) return;
    const card = deck[idx];
    if (!card || card.matched || flipped.includes(idx)) return;
    sfx.play('flip');
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].sym === deck[b].sym) {
        // match - reveal permanently
        lockRef.current = true;
        setTimeout(() => {
          setDeck((d) => d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
          setFlipped([]);
          lockRef.current = false;
          sfx.play('match');
        }, 420);
      } else {
        lockRef.current = true;
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 750);
      }
    }
  };

  const restart = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    lockRef.current = false;
  };

  const matchedCount = useMemo(() => deck.filter((c) => c.matched).length / 2, [deck]);

  return (
    <div className="game-container">
      <div className="game-surface">
        <div className="game-hud">
          <span className="hud-item">Pairs <b>{matchedCount}/8</b></span>
          <span className="hud-item">Moves <b>{moves}</b></span>
          <span className="hud-item">Time <b>{seconds}s</b></span>
          <span className="hud-item">Best <b>{best ?? '–'}</b></span>
          <button className="tool-btn" onClick={restart}>↻ Restart</button>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="game-grid4">
            {deck.map((card, idx) => {
              const faceUp = flipped.includes(idx) || card.matched;
              return (
                <button
                  key={card.key}
                  className={`mem-card${faceUp ? ' flipped' : ''}${card.matched ? ' matched' : ''}`}
                  onClick={() => flip(idx)}
                  disabled={card.matched}
                  aria-label={faceUp ? `Card ${card.sym}` : 'Hidden card'}
                >
                  {faceUp ? card.sym : ''}
                </button>
              );
            })}
          </div>

          {won && (
            <div className="game-overlay" role="status">
              <h3>🏆 All pairs matched!</h3>
              <p className="overlay-stat">
                {moves} moves · {seconds} seconds
                {best !== null && best === moves ? ' — new personal best!' : ''}
              </p>
              <button className="btn btn-primary" onClick={restart}>
                Play again
              </button>
            </div>
          )}
        </div>

        <p className="game-note">Tip: fewer moves means a better score. Your best is saved on this device.</p>
      </div>
    </div>
  );
}
