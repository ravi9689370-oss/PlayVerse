import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';
import { roundRectPath } from './engines/canvasUtils.js';
import {
  GRID,
  CELL,
  BOARD_PX,
  createGame,
  startGame,
  stepSnake,
  turn,
} from './engines/snakeEngine.js';

const BEST_KEY = 'neon-snake.score';

function dirLabel(dir) {
  if (dir.y < 0) return 'up';
  if (dir.y > 0) return 'down';
  if (dir.x < 0) return 'left';
  return 'right';
}

function draw(ctx, game, time) {
  ctx.clearRect(0, 0, BOARD_PX, BOARD_PX);

  const bg = ctx.createLinearGradient(0, 0, BOARD_PX, BOARD_PX);
  bg.addColorStop(0, '#0b0b1c');
  bg.addColorStop(1, '#070712');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

  // Subtle grid
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.09)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 1; i < GRID; i++) {
    const p = i * CELL + 0.5;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, BOARD_PX);
    ctx.moveTo(0, p);
    ctx.lineTo(BOARD_PX, p);
  }
  ctx.stroke();

  // Food orb with a soft pulsing glow
  if (game.food) {
    const fx = game.food.x * CELL + CELL / 2;
    const fy = game.food.y * CELL + CELL / 2;
    const pulse = 0.8 + 0.2 * Math.sin(time / 220);
    ctx.fillStyle = 'rgba(244, 114, 182, 0.16)';
    ctx.beginPath();
    ctx.arc(fx, fy, 15 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(fx, fy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(fx - 2.2, fy - 2.2, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snake body: tail darker, head brightest, rounded neon segments
  const len = game.snake.length;
  for (let i = len - 1; i >= 0; i--) {
    const seg = game.snake[i];
    const isHead = i === 0;
    const lightness = Math.max(28, 52 - (i / Math.max(1, len)) * 20);
    ctx.fillStyle = isHead ? '#6ee7b7' : `hsl(158 72% ${lightness}%)`;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = isHead ? 16 : 7;
    roundRectPath(ctx, seg.x * CELL + 3, seg.y * CELL + 3, CELL - 6, CELL - 6, isHead ? 9 : 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (isHead) {
      const cx = seg.x * CELL + CELL / 2;
      const cy = seg.y * CELL + CELL / 2;
      const dx = game.dir.x;
      const dy = game.dir.y;
      const px = -dy; // perpendicular
      const py = dx;
      ctx.fillStyle = '#062f22';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(cx + dx * 3 + px * side * 4, cy + dy * 3 + py * side * 4, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export default function NeonSnake() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const rootRef = useRef(null);
  if (!gameRef.current) gameRef.current = createGame();
  const dragRef = useRef(null);
  const metaRef = useRef({ head: '', food: '' });
  const [hud, setHud] = useState(() => ({
    score: 0,
    length: gameRef.current.snake.length,
    phase: 'idle',
    dir: 'right',
  }));
  const [best, setBest] = useState(() => store.getBest(BEST_KEY));

  const syncHud = useCallback(() => {
    const g = gameRef.current;
    const next = {
      score: g.score,
      length: g.snake.length,
      phase: g.phase,
      dir: dirLabel(g.dir),
    };
    setHud((prev) =>
      prev.score === next.score &&
      prev.length === next.length &&
      prev.phase === next.phase &&
      prev.dir === next.dir
        ? prev
        : next
    );

    // Data attributes mirror state that is already visible on the board.
    const el = rootRef.current;
    if (el) {
      const head = g.snake[0];
      const headKey = `${head.x},${head.y}`;
      const foodKey = g.food ? `${g.food.x},${g.food.y}` : '';
      if (metaRef.current.head !== headKey || metaRef.current.food !== foodKey) {
        metaRef.current = { head: headKey, food: foodKey };
        el.dataset.head = headKey;
        el.dataset.food = foodKey;
      }
    }

    if ((g.phase === 'over' || g.phase === 'won') && !g.bestSaved) {
      g.bestSaved = true;
      const stored = store.getBest(BEST_KEY);
      if (stored === null || g.score > stored) {
        store.setBest(BEST_KEY, g.score);
        setBest(g.score);
      } else {
        setBest(stored);
      }
    }
  }, []);

  const start = useCallback(() => {
    const g = createGame();
    startGame(g);
    gameRef.current = g;
    metaRef.current = { head: '', food: '' };
    syncHud();
  }, [syncHud]);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.phase === 'running') g.phase = 'paused';
    else if (g.phase === 'paused') g.phase = 'running';
    else start();
    syncHud();
  }, [start, syncHud]);

  const handleTurn = useCallback(
    (name) => {
      if (gameRef.current.phase === 'idle') start();
      turn(gameRef.current, name);
      syncHud();
    },
    [start, syncHud]
  );

  // Keyboard: arrows + WASD turn, P pauses, Space starts/pauses/restarts.
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key;
      const map = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        W: 'up',
        s: 'down',
        S: 'down',
        a: 'left',
        A: 'left',
        d: 'right',
        D: 'right',
      };
      if (map[key]) {
        e.preventDefault();
        handleTurn(map[key]);
      } else if (key === 'p' || key === 'P') {
        e.preventDefault();
        togglePause();
      } else if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        const phase = gameRef.current.phase;
        if (phase === 'idle' || phase === 'over' || phase === 'won') start();
        else togglePause();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTurn, start, togglePause]);

  // One rAF loop drives both the fixed-tick simulation and rendering.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const g = gameRef.current;
      if (g.phase === 'running') {
        acc += dt * 1000;
        let guard = 0;
        while (acc >= g.tickMs && guard < 4) {
          acc -= g.tickMs;
          const events = stepSnake(g);
          for (const ev of events) {
            if (ev === 'eat') sfx.play('match');
            if (ev === 'over') sfx.play('lose');
            if (ev === 'win') sfx.play('win');
          }
          guard += 1;
        }
      } else {
        acc = 0;
      }
      syncHud();
      draw(ctx, g, now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      const g = gameRef.current;
      if (document.hidden && g.phase === 'running') {
        g.phase = 'paused';
        syncHud();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [syncHud]);

  // Touch/mouse swipe on the board.
  const onPointerDown = (e) => {
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY };
    if (canvasRef.current && canvasRef.current.setPointerCapture) {
      try {
        canvasRef.current.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
  };
  const onPointerUp = (e) => {
    const startPoint = dragRef.current;
    dragRef.current = null;
    if (!startPoint) return;
    const dx = e.clientX - startPoint.x;
    const dy = e.clientY - startPoint.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) handleTurn(dx > 0 ? 'right' : 'left');
    else handleTurn(dy > 0 ? 'down' : 'up');
  };
  const onPointerCancel = () => {
    dragRef.current = null;
  };

  const dpad = (name) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      handleTurn(name);
    },
    onClick: (e) => {
      // Keyboard activation of the button (Enter/Space) synthesizes a click
      // with detail 0; pointer taps already fired above.
      if (e.detail === 0) handleTurn(name);
    },
  });

  const phase = hud.phase;

  return (
    <div
      ref={rootRef}
      className="game-container snake-game"
      data-phase={phase}
      data-score={hud.score}
      data-length={hud.length}
      data-dir={hud.dir}
    >
      <div className="game-surface wide snake-surface">
        <div className="game-hud">
          <span className="hud-item">Score <b>{hud.score}</b></span>
          <span className="hud-item">Best <b>{best ?? '–'}</b></span>
          <span className="hud-item">Length <b>{hud.length}</b></span>
          <button className="tool-btn" onClick={togglePause}>
            {phase === 'paused' ? '▶ Resume' : phase === 'running' ? '⏸ Pause' : '▶ Start'}
          </button>
          <button className="tool-btn" onClick={start}>↻ Restart</button>
        </div>

        <div className="snake-stage">
          <canvas
            ref={canvasRef}
            width={BOARD_PX}
            height={BOARD_PX}
            className="game-canvas snake-canvas"
            aria-label="Neon Snake game board"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          />
          {phase === 'idle' && (
            <div className="game-overlay" role="status">
              <h3>Neon Snake</h3>
              <p className="overlay-stat">Eat plasma orbs to grow. Walls and your own tail end the run.</p>
              <button className="btn btn-primary" onClick={start}>Start game</button>
              <p className="snake-hint">Arrow keys / WASD · swipe or use the D-pad on touch screens</p>
            </div>
          )}
          {phase === 'paused' && (
            <div className="game-overlay" role="status">
              <h3>⏸ Paused</h3>
              <button className="btn btn-primary" onClick={togglePause}>Resume</button>
            </div>
          )}
          {phase === 'over' && (
            <div className="game-overlay" role="status">
              <h3>💥 Game over</h3>
              <p className="overlay-stat">Score: {hud.score} · Best: {best ?? hud.score}</p>
              <button className="btn btn-primary" onClick={start}>Play again</button>
            </div>
          )}
          {phase === 'won' && (
            <div className="game-overlay" role="status">
              <h3>🏆 Board cleared!</h3>
              <p className="overlay-stat">Perfect run · Score: {hud.score}</p>
              <button className="btn btn-primary" onClick={start}>Play again</button>
            </div>
          )}
        </div>

        <div className="snake-dpad" role="group" aria-label="Direction controls">
          <button type="button" className="snake-dpad-btn dpad-up" aria-label="Move up" {...dpad('up')}>↑</button>
          <button type="button" className="snake-dpad-btn dpad-left" aria-label="Move left" {...dpad('left')}>←</button>
          <button type="button" className="snake-dpad-btn dpad-down" aria-label="Move down" {...dpad('down')}>↓</button>
          <button type="button" className="snake-dpad-btn dpad-right" aria-label="Move right" {...dpad('right')}>→</button>
        </div>

        <p className="game-note">Arrows / WASD to steer · P pauses · swipe or D-pad on touch · Space starts</p>
      </div>
    </div>
  );
}
