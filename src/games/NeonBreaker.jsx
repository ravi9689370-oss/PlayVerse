import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';

const W = 480;
const H = 600;
const PADDLE_W = 88;
const PADDLE_H = 14;
const BALL_R = 8;
const ROWS = 5;
const COLS = 8;
const BRICK_W = 52;
const BRICK_H = 22;
const BRICK_GAP = 6;
const BRICK_TOP = 72;
const ROW_COLORS = ['#f472b6', '#a78bfa', '#818cf8', '#22d3ee', '#34d399'];

function makeBricks() {
  const bricks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: 11 + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        w: BRICK_W,
        h: BRICK_H,
        color: ROW_COLORS[r],
        alive: true,
      });
    }
  }
  return bricks;
}

function freshState() {
  return {
    paddleX: W / 2,
    ball: { x: W / 2, y: H - 60, vx: 0, vy: 0 },
    speed: 300,
    stuck: true, // ball waits on the paddle until launched
    bricks: makeBricks(),
    lives: 3,
    score: 0,
    paused: false,
    over: false,
    won: false,
  };
}

export default function NeonBreaker() {
  const canvasRef = useRef(null);
  const st = useRef(freshState());
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState({ score: 0, lives: 3, paused: false, over: false, won: false, stuck: true });
  const [best, setBest] = useState(() => store.getBest('neon-breaker.score'));

  const syncHud = useCallback(() => {
    const s = st.current;
    setHud({ score: s.score, lives: s.lives, paused: s.paused, over: s.over, won: s.won, stuck: s.stuck });
  }, []);

  const restart = useCallback(() => {
    st.current = freshState();
    syncHud();
  }, [syncHud]);

  const togglePause = useCallback(() => {
    const s = st.current;
    if (s.over || s.won) return;
    s.paused = !s.paused;
    syncHud();
  }, [syncHud]);

  const launch = useCallback(() => {
    const s = st.current;
    if (s.over || s.won || s.paused) return;
    if (s.stuck) {
      s.stuck = false;
      s.speed = 300;
      s.ball.vx = (Math.random() * 2 - 1) * 130;
      s.ball.vy = -s.speed * 0.95;
      sfx.play('bounce');
    }
    syncHud();
  }, [syncHud]);

  // ----- input -----
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
      if (e.key === 'p' || e.key === 'P') togglePause();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        launch();
      }
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [togglePause, launch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const toGameX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    };
    const onMove = (clientX) => {
      const s = st.current;
      s.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, clientX));
    };
    const onMouse = (e) => onMove(toGameX(e.clientX));
    const onTouch = (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        onMove(toGameX(e.touches[0].clientX));
      }
    };
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: false });
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('click', launch);
    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('click', launch);
    };
  }, [launch]);

  // ----- game loop -----
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = performance.now();

    const draw = () => {
      const s = st.current;
      ctx.clearRect(0, 0, W, H);
      // background stars
      ctx.fillStyle = '#0a0a18';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 24; i++) {
        const x = (i * 97) % W;
        const y = (i * 211) % (H - 80);
        ctx.fillRect(x, y, 2, 2);
      }
      // bricks
      for (const b of s.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // paddle
      ctx.fillStyle = '#a78bfa';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.roundRect(s.paddleX - PADDLE_W / 2, H - 42, PADDLE_W, PADDLE_H, 7);
      ctx.fill();
      // ball
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (s.stuck && !s.over && !s.won) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = '600 14px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click / tap / Space to launch', W / 2, H - 90);
      }
    };

    const update = (dt) => {
      const s = st.current;
      if (s.paused || s.over || s.won) return;

      // paddle keys
      if (keys.current.left) s.paddleX = Math.max(PADDLE_W / 2, s.paddleX - 420 * dt);
      if (keys.current.right) s.paddleX = Math.min(W - PADDLE_W / 2, s.paddleX + 420 * dt);

      const ball = s.ball;
      if (s.stuck) {
        ball.x = s.paddleX;
        ball.y = H - 42 - BALL_R - 2;
        return;
      }

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // walls
      if (ball.x < BALL_R) {
        ball.x = BALL_R;
        ball.vx = Math.abs(ball.vx);
        sfx.play('bounce');
      }
      if (ball.x > W - BALL_R) {
        ball.x = W - BALL_R;
        ball.vx = -Math.abs(ball.vx);
        sfx.play('bounce');
      }
      if (ball.y < BALL_R) {
        ball.y = BALL_R;
        ball.vy = Math.abs(ball.vy);
        sfx.play('bounce');
      }

      // paddle bounce
      const paddleY = H - 42;
      if (
        ball.vy > 0 &&
        ball.y + BALL_R >= paddleY &&
        ball.y + BALL_R <= paddleY + PADDLE_H + 8 &&
        ball.x >= s.paddleX - PADDLE_W / 2 - 4 &&
        ball.x <= s.paddleX + PADDLE_W / 2 + 4
      ) {
        const hit = (ball.x - s.paddleX) / (PADDLE_W / 2); // -1..1
        const angle = hit * (Math.PI / 3); // max 60deg
        const mag = Math.min(560, Math.hypot(ball.vx, ball.vy) + 6);
        ball.vx = mag * Math.sin(angle);
        ball.vy = -Math.abs(mag * Math.cos(angle));
        ball.y = paddleY - BALL_R;
        sfx.play('bounce');
      }

      // bricks
      for (const b of s.bricks) {
        if (!b.alive) continue;
        if (
          ball.x + BALL_R >= b.x &&
          ball.x - BALL_R <= b.x + b.w &&
          ball.y + BALL_R >= b.y &&
          ball.y - BALL_R <= b.y + b.h
        ) {
          b.alive = false;
          s.score += 10;
          // bounce direction by penetration axis
          const overlapX = Math.min(ball.x + BALL_R - b.x, b.x + b.w - (ball.x - BALL_R));
          const overlapY = Math.min(ball.y + BALL_R - b.y, b.y + b.h - (ball.y - BALL_R));
          if (overlapX < overlapY) ball.vx = -ball.vx;
          else ball.vy = -ball.vy;
          s.speed = Math.min(520, s.speed + 7);
          sfx.play('brick');
          break;
        }
      }

      // lose ball
      if (ball.y > H + 20) {
        s.lives -= 1;
        sfx.play('lose');
        if (s.lives <= 0) {
          s.over = true;
          if (best === null || s.score > best) {
            store.setBest('neon-breaker.score', s.score);
            setBest(s.score);
          }
        } else {
          s.stuck = true;
          s.speed = 300;
          s.ball = { x: s.paddleX, y: H - 60, vx: 0, vy: 0 };
        }
        syncHud();
      }

      // win
      if (s.bricks.every((b) => !b.alive) && !s.over) {
        s.won = true;
        sfx.play('win');
        if (best === null || s.score > best) {
          store.setBest('neon-breaker.score', s.score);
          setBest(s.score);
        }
        syncHud();
      }
    };

    const loop = (now) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [syncHud, best]);

  return (
    <div className="game-container">
      <div className="game-surface wide">
        <div className="game-hud">
          <span className="hud-item">Score <b>{hud.score}</b></span>
          <span className="hud-item">Best <b>{best ?? '–'}</b></span>
          <span className="hud-item">Lives <b>{'❤'.repeat(Math.max(0, hud.lives)) || '–'}</b></span>
          <button className="tool-btn" onClick={togglePause}>{hud.paused ? '▶ Resume' : '⏸ Pause'}</button>
          <button className="tool-btn" onClick={restart}>↻ Restart</button>
        </div>
        <div className="game-canvas-wrap" style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={W} height={H} className="game-canvas" aria-label="Neon Breaker game board" />
          {hud.paused && !hud.over && !hud.won && (
            <div className="game-overlay" role="status">
              <h3>⏸ Paused</h3>
              <button className="btn btn-primary" onClick={togglePause}>Resume</button>
            </div>
          )}
          {hud.over && (
            <div className="game-overlay" role="status">
              <h3>💥 Game over</h3>
              <p className="overlay-stat">Score: {hud.score} · Best: {best ?? hud.score}</p>
              <button className="btn btn-primary" onClick={restart}>Play again</button>
            </div>
          )}
          {hud.won && (
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
