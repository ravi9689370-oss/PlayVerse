// ============================================================
// Neon Breaker - pure game engine (no React, no DOM)
// Deterministic, unit-testable physics for the brick breaker.
// The React component owns input, rendering, audio and HUD state.
// ============================================================

export const BOARD = {
  W: 480,
  H: 600,
  PADDLE_W: 88,
  PADDLE_H: 14,
  PADDLE_Y: 558, // top edge of the paddle (H - 42)
  BALL_R: 8,
  ROWS: 5,
  COLS: 8,
  BRICK_W: 52,
  BRICK_H: 22,
  BRICK_GAP: 6,
  BRICK_TOP: 72,
  BASE_SPEED: 300,
  MAX_SPEED: 560,
  MAX_BOUNCE_ANGLE: Math.PI / 3, // 60 degrees
  LIVES: 3,
};

export const ROW_COLORS = ['#f472b6', '#a78bfa', '#818cf8', '#22d3ee', '#34d399'];

const { W, H, PADDLE_W, BALL_R, BRICK_W, BRICK_H, BRICK_GAP, BRICK_TOP } = BOARD;

export function makeBricks() {
  const bricks = [];
  for (let r = 0; r < BOARD.ROWS; r++) {
    for (let c = 0; c < BOARD.COLS; c++) {
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

export function createGame() {
  return {
    paddleX: W / 2,
    ball: { x: W / 2, y: BOARD.PADDLE_Y - BALL_R - 2, vx: 0, vy: 0 },
    speed: BOARD.BASE_SPEED,
    stuck: true, // ball rests on the paddle until launched
    bricks: makeBricks(),
    lives: BOARD.LIVES,
    score: 0,
    paused: false,
    over: false,
    won: false,
    bestSaved: false,
  };
}

export function clampPaddle(game, x) {
  game.paddleX = Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x));
}

/** Launch the ball from the paddle. Returns true when a launch happened. */
export function launchBall(game) {
  if (!game.stuck || game.over || game.won || game.paused) return false;
  game.stuck = false;
  game.speed = BOARD.BASE_SPEED;
  const dir = Math.random() < 0.5 ? -1 : 1;
  game.ball.vx = dir * (90 + Math.random() * 70);
  game.ball.vy = -game.speed * 0.95;
  return true;
}

function setBall(game, x, y, vx, vy) {
  game.ball.x = x;
  game.ball.y = y;
  game.ball.vx = vx;
  game.ball.vy = vy;
}

function loseLife(game, events) {
  game.lives -= 1;
  events.push('lose');
  if (game.lives <= 0) {
    game.lives = 0;
    game.over = true;
    game.stuck = true;
    game.ball.vx = 0;
    game.ball.vy = 0;
  } else {
    game.stuck = true;
    game.speed = BOARD.BASE_SPEED;
    setBall(game, game.paddleX, BOARD.PADDLE_Y - BALL_R - 2, 0, 0);
  }
}

/** One physics sub-step (small dt) - keeps collisions accurate at high speed. */
function substep(game, dt, events) {
  const b = game.ball;
  b.x += b.vx * dt;
  b.y += b.vy * dt;

  // Walls
  if (b.x < BALL_R) {
    b.x = BALL_R;
    b.vx = Math.abs(b.vx);
    events.push('bounce');
  } else if (b.x > W - BALL_R) {
    b.x = W - BALL_R;
    b.vx = -Math.abs(b.vx);
    events.push('bounce');
  }
  if (b.y < BALL_R) {
    b.y = BALL_R;
    b.vy = Math.abs(b.vy);
    events.push('bounce');
  }

  // Paddle (only when moving down)
  const paddleTop = BOARD.PADDLE_Y;
  const paddleLeft = game.paddleX - PADDLE_W / 2;
  const paddleRight = game.paddleX + PADDLE_W / 2;
  if (
    b.vy > 0 &&
    b.y + BALL_R >= paddleTop &&
    b.y - BALL_R <= paddleTop + BOARD.PADDLE_H &&
    b.x >= paddleLeft - BALL_R &&
    b.x <= paddleRight + BALL_R
  ) {
    const hit = Math.max(-1, Math.min(1, (b.x - game.paddleX) / (PADDLE_W / 2)));
    const angle = hit * BOARD.MAX_BOUNCE_ANGLE;
    const mag = Math.min(BOARD.MAX_SPEED, Math.hypot(b.vx, b.vy) + 6);
    b.vx = mag * Math.sin(angle);
    b.vy = -Math.abs(mag * Math.cos(angle));
    b.y = paddleTop - BALL_R;
    events.push('bounce');
  }

  // Bricks - resolve one brick per sub-step and nudge the ball out on the
  // axis of least penetration so it can never stick inside a brick.
  for (const brick of game.bricks) {
    if (!brick.alive) continue;
    if (
      b.x + BALL_R > brick.x &&
      b.x - BALL_R < brick.x + brick.w &&
      b.y + BALL_R > brick.y &&
      b.y - BALL_R < brick.y + brick.h
    ) {
      brick.alive = false;
      game.score += 10;
      const overlapX = Math.min(b.x + BALL_R - brick.x, brick.x + brick.w - (b.x - BALL_R));
      const overlapY = Math.min(b.y + BALL_R - brick.y, brick.y + brick.h - (b.y - BALL_R));
      if (overlapX < overlapY) {
        b.vx = -b.vx;
        b.x += b.vx > 0 ? overlapX + 0.5 : -(overlapX + 0.5);
      } else {
        b.vy = -b.vy;
        b.y += b.vy > 0 ? overlapY + 0.5 : -(overlapY + 0.5);
      }
      game.speed = Math.min(BOARD.MAX_SPEED, game.speed + 7);
      events.push('brick');
      break;
    }
  }

  // Lost ball
  if (b.y - BALL_R > H) {
    loseLife(game, events);
    return;
  }

  // Victory
  if (!game.over && game.bricks.every((br) => !br.alive)) {
    game.won = true;
    events.push('win');
  }
}

/**
 * Advance the simulation by dt seconds.
 * input: { left: boolean, right: boolean } for keyboard paddle movement.
 * Returns an array of sound/game events: 'bounce' | 'brick' | 'lose' | 'win'.
 */
export function stepGame(game, dt, input = {}, events = []) {
  if (game.paused || game.over || game.won) return events;

  if (input.left) clampPaddle(game, game.paddleX - 420 * dt);
  if (input.right) clampPaddle(game, game.paddleX + 420 * dt);

  if (game.stuck) {
    game.ball.x = game.paddleX;
    game.ball.y = BOARD.PADDLE_Y - BALL_R - 2;
    game.ball.vx = 0;
    game.ball.vy = 0;
    return events;
  }

  // Sub-step integration: never move the ball more than ~5px per step so
  // fast balls cannot tunnel through bricks or the paddle.
  const speed = Math.max(1, Math.hypot(game.ball.vx, game.ball.vy));
  const steps = Math.max(1, Math.ceil((speed * dt) / 5));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    if (game.over || game.won || game.stuck) break;
    substep(game, h, events);
  }
  return events;
}
