import React, { useEffect, useState } from 'react';
import { sfx } from '../utils/sfx.js';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function winnerOf(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line: [a, b, c] };
    }
  }
  return board.every(Boolean) ? { player: 'draw', line: [] } : null;
}

/** Simple heuristic AI: win → block → center → corner → any. */
function aiMove(board) {
  const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  const tryLine = (player) => {
    for (const [a, b, c] of LINES) {
      const trio = [a, b, c];
      const vals = trio.map((i) => board[i]);
      if (vals.filter((v) => v === player).length === 2 && vals.includes(null)) {
        return trio[vals.indexOf(null)];
      }
    }
    return null;
  };
  return (
    tryLine('O') ??
    tryLine('X') ??
    (board[4] ? null : 4) ??
    [0, 2, 6, 8].find((i) => board[i] === null) ??
    empty[Math.floor(Math.random() * empty.length)]
  );
}

export default function TicTacGlow() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X'); // X = you, O = AI
  const [scores, setScores] = useState({ you: 0, ai: 0, draws: 0 });
  const result = winnerOf(board);
  const gameOver = !!result;

  useEffect(() => {
    if (gameOver || turn !== 'O') return undefined;
    const t = setTimeout(() => {
      setBoard((prev) => {
        if (winnerOf(prev)) return prev;
        const idx = aiMove(prev);
        if (idx === undefined || idx === null) return prev;
        const next = [...prev];
        next[idx] = 'O';
        sfx.play('bounce');
        return next;
      });
      setTurn('X');
    }, 420);
    return () => clearTimeout(t);
  }, [turn, gameOver]);

  useEffect(() => {
    if (!result) return;
    if (result.player === 'X') {
      sfx.play('win');
      setScores((s) => ({ ...s, you: s.you + 1 }));
    } else if (result.player === 'O') {
      sfx.play('lose');
      setScores((s) => ({ ...s, ai: s.ai + 1 }));
    } else {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    }
  }, [result?.player]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = (idx) => {
    if (board[idx] || gameOver || turn !== 'X') return;
    const next = [...board];
    next[idx] = 'X';
    sfx.play('hit');
    setBoard(next);
    setTurn('O');
  };

  const newRound = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
  };

  const statusText = gameOver
    ? result.player === 'draw'
      ? "It's a draw!"
      : result.player === 'X'
        ? '🏆 You win the round!'
        : '🤖 AI takes the round'
    : turn === 'X'
      ? 'Your turn (X)'
      : 'AI is thinking…';

  return (
    <div className="game-container">
      <div className="game-surface">
        <div className="game-hud">
          <span className="hud-item">You <b>{scores.you}</b></span>
          <span className="hud-item">Draws <b>{scores.draws}</b></span>
          <span className="hud-item">AI <b>{scores.ai}</b></span>
          <button className="tool-btn" onClick={newRound}>{gameOver ? '▶ New round' : '↻ New round'}</button>
          <button className="tool-btn" onClick={() => setScores({ you: 0, ai: 0, draws: 0 })}>Reset scores</button>
        </div>

        <div style={{ position: 'relative' }}>
          <div className="game-grid3">
            {board.map((v, idx) => {
              const highlight = result?.line?.includes(idx);
              return (
                <button
                  key={idx}
                  className={`ttt-cell${v ? ` ${v.toLowerCase()}` : ''}`}
                  style={highlight ? { borderColor: 'var(--success)' } : undefined}
                  onClick={() => play(idx)}
                  disabled={!!v || gameOver || turn !== 'X'}
                  aria-label={`Cell ${idx + 1}${v ? `, ${v === 'X' ? 'your mark' : 'AI mark'}` : ', empty'}`}
                >
                  {v}
                </button>
              );
            })}
          </div>

          {gameOver && (
            <div className="game-overlay" role="status">
              <h3>{statusText}</h3>
              <button className="btn btn-primary" onClick={newRound}>
                New round
              </button>
            </div>
          )}
        </div>

        {!gameOver && (
          <p className="game-note" aria-live="polite">{statusText}</p>
        )}
      </div>
    </div>
  );
}
