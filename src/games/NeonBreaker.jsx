import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';
import { roundRectPath } from './engines/canvasUtils.js';
import { BOARD, createGame, stepGame, launchBall, clampPaddle } from './engines/neonBreakerEngine.js';

const { W, H, PADDLE_W, PADDLE_H, BALL_R, PADDLE_Y } = BOARD;
const BEST_KEY = 'neon-breaker.score';

function phaseOf(g) {
  if (g.won) return 'won';
  if (g.over) return 'over';
  if (g.paused) return 'paused';
  if (g.stuck) return 'ready';
  return 'playing';
}

function draw(ctx, g) {
  ctx.clearRect(0, 0, W, H);

  // Background + fixed star field (no font/gradient API dependencies).
  ctx.fillStyle = '#0a0a18';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 24; i++) {
    ctx.fillRect((i * 97) % W, (i * 211) % (H - 80), 2, 2);
  }

  // Bricks. roundRectPath avoids ctx.roundRect (missing on older WebViews).
  for (const b of g.bricks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 10;
    roundRectPath(ctx, b.x, b.y, b.w, b.h, 5);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Paddle
  ctx.fillStyle = '#a78bfa';
  ctx.shadowColor = '#8b5cf6';
  ctx.shadowBlur = 14;
  roundRectPath(ctx, g.paddleX - PADDLE_W / 2, PADDLE_Y, PADDLE_W, PADDLE_H, 7);
  ctx.fill();

  // Ball
  ctx.fillStyle = '#22d3ee';
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(g.ball.x, g.ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  if (g.stuck && !g.over && !g.won && !g.paused) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click / tap / Space to launch', W / 2, H - 90);
  }
}

const SOUND = { bounce: 'bounce', brick: 'brick', lose: 'lose', win: 'win' };

export default function NeonBreaker() {
  const canvasRef = useRef(null);
  const rootRef = useRef(null);
  const gameRef = useRef(null);
  if (!gameRef.current) gameRef.current = createGame();
  const keysRef = useRef({ left: false, right: false });
  const metaRef = useRef({ ball: '', paddle: '' });
  const [hud, setHud] = useState(() => ({
    score: gameRef.current.score,
    lives: gameRef.current.lives,
    phase: phaseOf(gameRef.current),
  }));
  const [best, setBest] = useState(() => store.getBest(BEST_KEY));

  // Keep React HUD state in sync with the engine. Called every frame but only
  // triggers a re-render when a displayed value actually changes.
  const syncHud = useCallback(() => {
    const g = gameRef.current;
    const next = { score: g.score, lives: g.lives, phase: phaseOf(g) };
    setHud((prev) =>
      prev.score === next.score && prev.lives === next.lives && prev.phase === next.phase ? prev : next
    );
    if ((g.over || g.won) && !g.bestSaved) {
      g.bestSaved = true;
      const stored = store.getBest(BEST_KEY);
      if (stored === null || g.score > stored) {
        store.setBest(BEST_KEY, g.score);
        setBest(g.score);
      } else {
        setBest(stored);
      }
    }

    // Expose the on-screen positions for accessibility tooling and tests.
    const el = rootRef.current;
    if (el) {
      const ballKey = `${Math.round(g.ball.x)},${Math.round(g.ball.y)}`;
      const paddleKey = String(Math.round(g.paddleX));
      if (metaRef.current.ball !== ballKey || metaRef.current.paddle !== paddleKey) {
        metaRef.current = { ball: ballKey, paddle: paddleKey };
        el.dataset.ball = ballKey;
        el.dataset.paddle = paddleKey;
      }
    }
  }, []);

  const tryLaunch = useCallback(() => {
    const g = gameRef.current;
    if (g.paused || g.over || g.won) return;
    if (launchBall(g)) {
      sfx.play('bounce');
      syncHud();
    }
  }, [syncHud]);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.over || g.won) return;
    g.paused = !g.paused;
    syncHud();
  }, [syncHud]);

  const restart = useCallback(() => {
    gameRef.current = createGame();
    keysRef.current = { left: false, right: false };
    syncHud();
  }, [syncHud]);

  // Keyboard controls (window-level so no focus required).
  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key;
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        keysRef.current.left = true;
        e.preventDefault();
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        keysRef.current.right = true;
        e.preventDefault();
      } else if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        tryLaunch();
      } else if (key === 'p' || key === 'P') {
        e.preventDefault();
        togglePause();
      }
    };
    const onKeyUp = (e) => {
      const key = e.key;
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') keysRef.current.left = false;
      if (key === 'ArrowRight' || key === 'd' || key === 'D') keysRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [tryLaunch, togglePause]);

  // Single render/physics loop, mounted once. Best-score changes can never
  // tear it down or create a duplicate loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = performance.now();

    const frame = (now) => {
      const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
      last = now;
      const events = stepGame(gameRef.current, dt, keysRef.current);
      for (const ev of events) {
        const sound = SOUND[ev];
        if (sound) sfx.play(sound);
      }
      syncHud();
      draw(ctx, gameRef.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Pause automatically when the tab/app is backgrounded so the ball does
    // not jump after returning with a huge elapsed time.
    const onVisibility = () => {
      const g = gameRef.current;
      if (document.hidden && g.phase !== 'over' && !g.over && !g.won && !g.stuck && !g.paused) {
        g.paused = true;
        syncHud();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [syncHud]);

  const toGameX = (clientX) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return W / 2;
    return ((clientX - rect.left) / rect.width) * W;
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    if (canvasRef.current && canvasRef.current.setPointerCapture) {
      try {
        canvasRef.current.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
    clampPaddle(gameRef.current, toGameX(e.clientX));
    tryLaunch();
  };

  const onPointerMove = (e) => {
    // Pointer events unify mouse hover, mouse drag and touch drag. Pointer
    // capture keeps the paddle tracking even when the finger leaves the board.
    clampPaddle(gameRef.current, toGameX(e.clientX));
  };

  return (
    <div
      ref={rootRef}
      className="game-container"
      data-phase={hud.phase}
      data-score={hud.score}
      data-lives={hud.lives}
    >
      <div className="game-surface wide">
        <div className="game-hud">
          <span className="hud-item">Score <b>{hud.score}</b></span>
          <span className="hud-item">Best <b>{best ?? '–'}</b></span>
          <span className="hud-item">Lives <b>{'❤'.repeat(Math.max(0, hud.lives)) || '–'}</b></span>
          <button className="tool-btn" onClick={togglePause} disabled={hud.phase === 'over' || hud.phase === 'won'}>
            {hud.phase === 'paused' ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button className="tool-btn" onClick={restart}>↻ Restart</button>
        </div>
        <div className="game-canvas-wrap" style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="game-canvas"
            aria-label="Neon Breaker game board"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
          />
          {hud.phase === 'paused' && (
            <div className="game-overlay" role="status">
              <h3>⏸ Paused</h3>
              <button className="btn btn-primary" onClick={togglePause}>Resume</button>
            </div>
          )}
          {hud.phase === 'over' && (
            <div className="game-overlay" role="status">
              <h3>💥 Game over</h3>
              <p className="overlay-stat">Score: {hud.score} · Best: {best ?? hud.score}</p>
              <button className="btn btn-primary" onClick={restart}>Play again</button>
            </div>
          )}
          {hud.phase === 'won' && (
            <div className="game-overlay" role="status">
              <h3>🏆 Wall cleared!</h3>
              <p className="overlay-stat">Final score: {hud.score}</p>
              <button className="btn btn-primary" onClick={restart}>Play again</button>
            </div>
          )}
        </div>
        <p className="game-note">Mouse / touch to move · Arrow keys work too · P pauses · Space launches</p>
      </div>
    </div>
  );
}
