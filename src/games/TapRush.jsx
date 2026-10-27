import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../utils/sfx.js';
import { store } from '../utils/storage.js';

const ROUND_SECONDS = 30;

export default function TapRush() {
  const [phase, setPhase] = useState('idle'); // idle | playing | over
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [target, setTarget] = useState(null); // { x, y } in %
  const [best, setBest] = useState(() => store.getBest('tap-rush.score'));
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const timeoutsRef = useRef([]);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const spawn = useCallback(() => {
    const lifespan = Math.max(900, 2000 - streakRef.current * 60);
    setTarget({
      x: 8 + Math.random() * 78,
      y: 10 + Math.random() * 74,
      id: Date.now(),
    });
    const t = setTimeout(() => {
      // missed the target
      streakRef.current = 0;
      setStreak(0);
      setTarget(null);
      const t2 = setTimeout(spawn, 250);
      timeoutsRef.current.push(t2);
    }, lifespan);
    timeoutsRef.current.push(t);
  }, []);

  const start = useCallback(() => {
    clearTimers();
    scoreRef.current = 0;
    streakRef.current = 0;
    setScore(0);
    setStreak(0);
    setTimeLeft(ROUND_SECONDS);
    setPhase('playing');
    spawn();
  }, [clearTimers, spawn]);

  // round countdown
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(iv);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [phase]);

  // round end
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      clearTimers();
      setTarget(null);
      setPhase('over');
      sfx.play('win');
      const final = scoreRef.current;
      if (best === null || final > best) {
        store.setBest('tap-rush.score', final);
        setBest(final);
      }
    }
  }, [timeLeft, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimers(), [clearTimers]);

  const hit = () => {
    if (phase !== 'playing') return;
    sfx.play('hit');
    streakRef.current += 1;
    setStreak(streakRef.current);
    const gained = 10 + streakRef.current * 2;
    scoreRef.current += gained;
    setScore(scoreRef.current);
    setTarget(null);
    const t = setTimeout(spawn, 220);
    timeoutsRef.current.push(t);
  };

  return (
    <div className="game-container">
      <div className="game-surface wide">
        <div className="game-hud">
          <span className="hud-item">Score <b>{score}</b></span>
          <span className="hud-item">Streak <b>{streak}</b></span>
          <span className="hud-item">Time <b>{timeLeft}s</b></span>
          <span className="hud-item">Best <b>{best ?? '–'}</b></span>
          {phase === 'playing' && (
            <button className="tool-btn" onClick={() => { clearTimers(); setPhase('idle'); setTarget(null); }}>
              ✕ Quit
            </button>
          )}
        </div>

        <div className="rush-stage" aria-label="Tap Rush arena">
          {target && phase === 'playing' && (
            <button
              key={target.id}
              className="rush-target"
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              onClick={hit}
              aria-label="Hit the orb"
            />
          )}

          {phase === 'idle' && (
            <div className="game-overlay" role="status">
              <h3>⚡ Tap Rush</h3>
              <p className="overlay-stat">Hit as many orbs as you can in {ROUND_SECONDS} seconds.<br />Streaks boost your score. Ready?</p>
              <button className="btn btn-primary" onClick={start}>Start round</button>
            </div>
          )}

          {phase === 'over' && (
            <div className="game-overlay" role="status">
              <h3>⏱ Time!</h3>
              <p className="overlay-stat">Score: {score}{best !== null && score >= best ? ' — new best!' : ''} · Best: {best ?? score}</p>
              <button className="btn btn-primary" onClick={start}>Play again</button>
            </div>
          )}
        </div>

        <p className="game-note">Tap / click orbs before they vanish · missed orbs reset your streak</p>
      </div>
    </div>
  );
}
