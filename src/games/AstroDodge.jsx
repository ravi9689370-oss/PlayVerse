import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';

const W = 480;
const H = 600;
const SHIP_Y = H - 80;
const SHIP_R = 16;

function freshState() {
  return {
    shipX: W / 2,
    targetX: W / 2,
    meteors: [],
    spawnTimer: 0,
    t: 0,
    score: 0,
    paused: false,
    over: false,
  };
}

export default function AstroDodge() {
  const canvasRef = useRef(null);
  const st = useRef(freshState());
  const keys = useRef({ left: false, right: false });
  const [hud, setHud] = useState({ score: 0, paused: false, over: false });
  const [best, setBest] = useState(() => store.getBest('astro-dodge.score'));

  const syncHud = useCallback(() => {
    const s = st.current;
    setHud({ score: s.score, paused: s.paused, over: s.over });
  }, []);

  const restart = useCallback(() => {
    st.current = freshState();
    syncHud();
  }, [syncHud]);

  const togglePause = useCallback(() => {
    const s = st.current;
    if (s.over) return;
    s.paused = !s.paused;
    syncHud();
  }, [syncHud]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keys.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keys.current.right = true;
      if (e.key === 'p' || e.key === 'P') togglePause();
      if (e.key === ' ') e.preventDefault();
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
  }, [togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const toGameX = (clientX) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * W;
    };
    const onMove = (clientX) => {
      const s = st.current;
      s.targetX = Math.max(SHIP_R, Math.min(W - SHIP_R, clientX));
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
    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let last = performance.now();

    const draw = () => {
      const s = st.current;
      ctx.fillStyle = '#0a0a18';
      ctx.fillRect(0, 0, W, H);
      // starfield
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 137 + 13) % W;
        const y = (i * 271 + 29 + ((s.t * 40) % H)) % H;
        ctx.fillRect(x, y, 2, 2);
      }
      // meteors
      for (const m of s.meteors) {
        const g = ctx.createRadialGradient(m.x - m.r * 0.3, m.y - m.r * 0.3, 1, m.x, m.y, m.r);
        g.addColorStop(0, '#a78bfa');
        g.addColorStop(1, '#4c3a8a');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // ship
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(s.shipX, SHIP_Y - SHIP_R - 6);
      ctx.lineTo(s.shipX - SHIP_R, SHIP_Y + SHIP_R);
      ctx.lineTo(s.shipX + SHIP_R, SHIP_Y + SHIP_R);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // engine flame
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(s.shipX - 5, SHIP_Y + SHIP_R);
      ctx.lineTo(s.shipX, SHIP_Y + SHIP_R + 10 + Math.sin(s.t * 30) * 3);
      ctx.lineTo(s.shipX + 5, SHIP_Y + SHIP_R);
      ctx.closePath();
      ctx.fill();
    };

    const update = (dt) => {
      const s = st.current;
      if (s.paused || s.over) return;
      s.t += dt;
      s.score = Math.floor(s.t * 10);

      // ship movement: keys push target, pointer sets target directly
      if (keys.current.left) s.targetX = Math.max(SHIP_R, s.targetX - 460 * dt);
      if (keys.current.right) s.targetX = Math.min(W - SHIP_R, s.targetX + 460 * dt);
      s.shipX += (s.targetX - s.shipX) * Math.min(1, dt * 14);

      // spawn
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        const interval = Math.max(0.22, 0.85 - s.t * 0.022);
        s.spawnTimer = interval * (0.7 + Math.random() * 0.6);
        s.meteors.push({
          x: 20 + Math.random() * (W - 40),
          y: -30,
          r: 10 + Math.random() * 16,
          vy: 150 + s.t * 9 + Math.random() * 90,
          vx: (Math.random() * 2 - 1) * 40,
        });
      }

      // meteors update + collision
      for (let i = s.meteors.length - 1; i >= 0; i--) {
        const m = s.meteors[i];
        m.y += m.vy * dt;
        m.x += m.vx * dt;
        if (m.x < m.r || m.x > W - m.r) m.vx *= -1;
        if (m.y > H + 40) {
          s.meteors.splice(i, 1);
          continue;
        }
        const dx = m.x - s.shipX;
        const dy = m.y - SHIP_Y;
        if (dx * dx + dy * dy < (m.r * 0.85 + SHIP_R * 0.8) ** 2) {
          s.over = true;
          sfx.play('lose');
          if (best === null || s.score > best) {
            store.setBest('astro-dodge.score', s.score);
            setBest(s.score);
          }
          syncHud();
        }
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
          <button className="tool-btn" onClick={togglePause}>{hud.paused ? '▶ Resume' : '⏸ Pause'}</button>
          <button className="tool-btn" onClick={restart}>↻ Restart</button>
        </div>
        <div className="game-canvas-wrap" style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={W} height={H} className="game-canvas" aria-label="Astro Dodge game board" />
          {hud.paused && !hud.over && (
            <div className="game-overlay" role="status">
              <h3>⏸ Paused</h3>
              <button className="btn btn-primary" onClick={togglePause}>Resume</button>
            </div>
          )}
          {hud.over && (
            <div className="game-overlay" role="status">
              <h3>☄️ Ship down!</h3>
              <p className="overlay-stat">You survived for {hud.score} points. Best: {best ?? hud.score}</p>
              <button className="btn btn-primary" onClick={restart}>Fly again</button>
            </div>
          )}
        </div>
        <p className="game-note">Drag / move mouse to steer · Arrow keys or A/D · P pauses</p>
      </div>
    </div>
  );
}
