import React, { useCallback, useEffect, useState } from 'react';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';

function solvedBoard(size) {
  const n = size * size;
  return Array.from({ length: n }, (_, i) => (i + 1) % n); // 0 = blank, placed last
}

function neighborsOf(idx, size) {
  const r = Math.floor(idx / size);
  const c = idx % size;
  const out = [];
  if (r > 0) out.push(idx - size);
  if (r < size - 1) out.push(idx + size);
  if (c > 0) out.push(idx - 1);
  if (c < size - 1) out.push(idx + 1);
  return out;
}

/** Shuffle by applying random legal moves from the solved state (always solvable). */
function shuffledBoard(size) {
  const n = size * size;
  const board = solvedBoard(size);
  let blank = n - 1;
  let prevBlank = -1;
  const steps = size === 3 ? 90 : 220;
  for (let i = 0; i < steps; i++) {
    const opts = neighborsOf(blank, size).filter((x) => x !== prevBlank);
    const pick = opts[Math.floor(Math.random() * opts.length)];
    [board[blank], board[pick]] = [board[pick], board[blank]];
    prevBlank = blank;
    blank = pick;
  }
  if (board.every((v, i) => v === (i + 1) % n)) return shuffledBoard(size); // vanishingly unlikely; retry
  return board;
}

export default function TileBlitz() {
  const [size, setSize] = useState(3);
  const [board, setBoard] = useState(() => shuffledBoard(3));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [best, setBest] = useState(() => store.getBest('tile-blitz.3.moves'));
  const won = board.every((v, i) => v === (i + 1) % (size * size));
  const started = moves > 0;

  useEffect(() => {
    if (!started || won) return undefined;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, won]);

  useEffect(() => {
    if (won && moves > 0) {
      sfx.play('win');
      const key = `tile-blitz.${size}.moves`;
      const current = store.getBest(key);
      if (current === null || moves < current) {
        store.setBest(key, moves);
        setBest(moves);
      }
    }
  }, [won]); // eslint-disable-line react-hooks/exhaustive-deps

  const slide = useCallback(
    (idx) => {
      if (won) return;
      setBoard((prev) => {
        const blank = prev.indexOf(0);
        if (!neighborsOf(idx, size).includes(blank)) return prev;
        const next = [...prev];
        [next[blank], next[idx]] = [next[idx], next[blank]];
        sfx.play('slide');
        return next;
      });
      setMoves((m) => m + 1);
    },
    [size, won]
  );

  // Arrow keys slide a tile into the gap.
  useEffect(() => {
    const onKey = (e) => {
      if (won) return;
      const n = size * size;
      const blank = board.indexOf(0);
      let target = -1;
      if (e.key === 'ArrowLeft' && blank % size < size - 1) target = blank + 1;
      if (e.key === 'ArrowRight' && blank % size > 0) target = blank - 1;
      if (e.key === 'ArrowUp' && Math.floor(blank / size) < size - 1) target = blank + size;
      if (e.key === 'ArrowDown' && blank >= size) target = blank - size;
      if (target >= 0 && target < n) {
        e.preventDefault();
        slide(target);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [board, size, slide, won]);

  const restart = useCallback(
    (newSize = size) => {
      setSize(newSize);
      setBoard(shuffledBoard(newSize));
      setMoves(0);
      setSeconds(0);
    },
    [size]
  );

  const bestKey = `tile-blitz.${size}.moves`;
  const sizeBest = size === 3 ? best : store.getBest(bestKey);

  return (
    <div className="game-container">
      <div className="game-surface">
        <div className="game-hud">
          <span className="hud-item">Moves <b>{moves}</b></span>
          <span className="hud-item">Time <b>{seconds}s</b></span>
          <span className="hud-item">Best ({size}x{size}) <b>{sizeBest ?? '–'}</b></span>
          <button className="tool-btn" onClick={() => restart(3)} disabled={size === 3}>3×3</button>
          <button className="tool-btn" onClick={() => restart(4)} disabled={size === 4}>4×4</button>
          <button className="tool-btn" onClick={() => restart()}>↻ Shuffle</button>
        </div>

        <div style={{ position: 'relative' }}>
          <div className={size === 3 ? 'game-grid3' : 'game-grid4'}>
            {board.map((v, idx) => (
              <button
                key={idx}
                className={`tile${v === 0 ? ' blank' : ''}`}
                onClick={() => v !== 0 && slide(idx)}
                disabled={v === 0}
                aria-label={v === 0 ? 'Empty slot' : `Tile ${v}`}
              >
                {v !== 0 ? v : ''}
              </button>
            ))}
          </div>

          {won && moves > 0 && (
            <div className="game-overlay" role="status">
              <h3>🏁 Solved!</h3>
              <p className="overlay-stat">
                {moves} moves · {seconds} seconds
                {sizeBest === moves ? ' — new best!' : ''}
              </p>
              <button className="btn btn-primary" onClick={() => restart()}>
                Play again
              </button>
            </div>
          )}
        </div>

        <p className="game-note">Tap a tile beside the gap to slide it · Arrow keys work on desktop</p>
      </div>
    </div>
  );
}
