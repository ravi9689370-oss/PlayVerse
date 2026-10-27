// Deterministic engine tests for Neon Breaker and Neon Snake.
// Run: npm test
import assert from 'node:assert/strict';
import {
  BOARD,
  createGame as createBreaker,
  makeBricks,
  launchBall,
  stepGame,
  clampPaddle,
} from '../src/games/engines/neonBreakerEngine.js';
import {
  GRID,
  createGame as createSnake,
  startGame,
  placeFood,
  turn,
  stepSnake,
  isOccupied,
  START_TICK_MS,
  MIN_TICK_MS,
} from '../src/games/engines/snakeEngine.js';

let passed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (err) {
    failures.push({ name, err });
    console.error(`FAIL  ${name}`);
    console.error(`      ${err.message}`);
  }
}

// ============================================================
// Neon Breaker
// ============================================================
console.log('\nNeon Breaker engine');

test('new game starts ready with 40 bricks, 3 lives and a stuck ball', () => {
  const g = createBreaker();
  assert.equal(g.bricks.length, 40);
  assert.ok(g.bricks.every((b) => b.alive));
  assert.equal(g.lives, 3);
  assert.equal(g.score, 0);
  assert.equal(g.stuck, true);
  assert.equal(g.over, false);
  assert.equal(g.won, false);
});

test('launch releases the ball upward only once', () => {
  const g = createBreaker();
  assert.equal(launchBall(g), true);
  assert.equal(g.stuck, false);
  assert.ok(g.ball.vy < 0);
  const vy = g.ball.vy;
  assert.equal(launchBall(g), false);
  assert.equal(g.ball.vy, vy);
});

test('paddle is clamped to the board', () => {
  const g = createBreaker();
  clampPaddle(g, -100);
  assert.equal(g.paddleX, BOARD.PADDLE_W / 2);
  clampPaddle(g, 9999);
  assert.equal(g.paddleX, BOARD.W - BOARD.PADDLE_W / 2);
});

test('ball bounces off the side and top walls', () => {
  const g = createBreaker();
  g.stuck = false;
  g.ball = { x: 10, y: 250, vx: -300, vy: 0 };
  stepGame(g, 1 / 60);
  assert.ok(g.ball.vx > 0, 'left wall should reverse vx');

  g.ball = { x: 200, y: 10, vx: 0, vy: -300 };
  stepGame(g, 1 / 60);
  assert.ok(g.ball.vy > 0, 'top wall should reverse vy');
});

test('paddle reflects the ball upward without losing a life', () => {
  const g = createBreaker();
  g.stuck = false;
  g.ball = { x: g.paddleX, y: BOARD.PADDLE_Y - 40, vx: 0, vy: 300 };
  let bounced = false;
  for (let i = 0; i < 60 && !bounced; i++) {
    stepGame(g, 1 / 60);
    if (g.ball.vy < 0) bounced = true;
  }
  assert.equal(bounced, true);
  assert.equal(g.lives, 3);
  assert.equal(g.stuck, false);
});

test('brick hit removes the brick, scores 10 and reverses the ball', () => {
  const g = createBreaker();
  g.stuck = false;
  const brick = g.bricks[0];
  g.ball = { x: brick.x + brick.w / 2, y: brick.y + brick.h + BOARD.BALL_R + 3, vx: 0, vy: -260 };
  let hit = false;
  for (let i = 0; i < 20 && !hit; i++) {
    stepGame(g, 1 / 60);
    if (!g.bricks[0].alive) hit = true;
  }
  assert.equal(hit, true);
  assert.equal(g.score, 10);
  assert.ok(g.ball.vy > 0, 'ball should bounce back down');
  assert.ok(g.speed > BOARD.BASE_SPEED);
});

test('destroyed bricks are ignored by the ball', () => {
  const g = createBreaker();
  g.stuck = false;
  const brick = g.bricks[0];
  brick.alive = false;
  g.ball = { x: brick.x + brick.w / 2, y: brick.y + brick.h / 2, vx: 0, vy: -260 };
  stepGame(g, 1 / 60);
  assert.equal(g.score, 0);
  assert.equal(brick.alive, false);
  assert.ok(g.ball.vy < 0, 'dead brick must not deflect the ball');
});

test('losing the ball costs a life and re-sticks the ball', () => {
  const g = createBreaker();
  g.stuck = false;
  g.ball = { x: 200, y: BOARD.H + 60, vx: 0, vy: 100 };
  stepGame(g, 1 / 60);
  assert.equal(g.lives, 2);
  assert.equal(g.stuck, true);
  assert.equal(g.over, false);
  assert.equal(g.ball.y, BOARD.PADDLE_Y - BOARD.BALL_R - 2);
});

test('game over after all three lives are lost; further steps are inert', () => {
  const g = createBreaker();
  for (let life = 0; life < 3; life++) {
    g.stuck = false;
    g.ball = { x: 200, y: BOARD.H + 60, vx: 0, vy: 100 };
    stepGame(g, 1 / 60);
  }
  assert.equal(g.lives, 0);
  assert.equal(g.over, true);
  const snapshot = { x: g.ball.x, y: g.ball.y, score: g.score };
  stepGame(g, 1);
  assert.deepEqual({ x: g.ball.x, y: g.ball.y, score: g.score }, snapshot);
});

test('pause freezes the simulation', () => {
  const g = createBreaker();
  launchBall(g);
  g.paused = true;
  const before = { ...g.ball };
  stepGame(g, 1);
  assert.deepEqual(g.ball, before);
  g.paused = false;
  stepGame(g, 1 / 60);
  assert.notDeepEqual(g.ball, before);
});

test('ball never tunnels through the paddle at maximum speed', () => {
  const g = createBreaker();
  g.stuck = false;
  g.ball = { x: g.paddleX, y: BOARD.PADDLE_Y - 30, vx: 0, vy: BOARD.MAX_SPEED };
  for (let i = 0; i < 40; i++) {
    stepGame(g, 1 / 30); // deliberately coarse frame time
    if (g.ball.vy < 0) break;
  }
  assert.ok(g.ball.vy < 0);
  assert.equal(g.lives, 3);
});

test('all 40 bricks can be cleared -> victory at 400 points', () => {
  const g = createBreaker();
  launchBall(g);
  let frames = 0;
  let t = 0;
  const maxFrames = 60 * 900; // up to 15 simulated minutes
  while (!g.won && !g.over && frames < maxFrames) {
    // Simple autoplayer: track the ball with a small oscillation so the
    // bounce angle keeps varying instead of looping in one column.
    t += 1 / 60;
    clampPaddle(g, g.ball.x + Math.sin(t * 2.1) * 26);
    stepGame(g, 1 / 60);
    if (g.stuck && !g.over && !g.won) launchBall(g);
    frames += 1;
  }
  assert.equal(g.over, false, 'autoplayer should not run out of lives');
  assert.equal(g.won, true, `wall not cleared within ${maxFrames} frames`);
  assert.equal(g.score, 400);
  assert.ok(g.bricks.every((b) => !b.alive));
  assert.deepEqual(makeBricks().filter((b) => b.alive).length, 40);
  console.log(`      cleared in ${(frames / 60).toFixed(1)}s simulated time`);
});

// ============================================================
// Neon Snake
// ============================================================
console.log('\nNeon Snake engine');

test('new game: length 3, idle, food on a free in-bounds cell', () => {
  const g = createSnake();
  assert.equal(g.snake.length, 3);
  assert.equal(g.phase, 'idle');
  assert.equal(g.score, 0);
  assert.equal(g.tickMs, START_TICK_MS);
  assert.ok(g.food);
  assert.ok(g.food.x >= 0 && g.food.x < GRID && g.food.y >= 0 && g.food.y < GRID);
  assert.equal(isOccupied(g, g.food.x, g.food.y), false);
});

test('food placement never overlaps the snake', () => {
  const g = createSnake();
  g.snake = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (y < 19) g.snake.push({ x, y });
    }
  }
  // 20 free cells in the bottom row
  const seen = new Set();
  for (let i = 0; i < 200; i++) {
    const f = placeFood(g);
    assert.equal(f.y, 19);
    assert.equal(isOccupied(g, f.x, f.y), false);
    seen.add(f.x);
  }
  assert.equal(seen.size, 20);
});

test('food placement returns null on a full board', () => {
  const g = createSnake();
  g.snake = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) g.snake.push({ x, y });
  assert.equal(placeFood(g), null);
});

test('startGame moves idle -> running', () => {
  const g = createSnake();
  startGame(g);
  assert.equal(g.phase, 'running');
});

test('180-degree turns are rejected', () => {
  const g = createSnake();
  startGame(g);
  assert.equal(turn(g, 'left'), false); // moving right -> left is illegal
  assert.equal(turn(g, 'up'), true);
  assert.equal(g.queue.length, 1);
});

test('buffered turns are limited and validated against the last queued direction', () => {
  const g = createSnake();
  startGame(g);
  assert.equal(turn(g, 'up'), true);
  assert.equal(turn(g, 'left'), true); // legal relative to 'up'
  assert.equal(turn(g, 'down'), false); // opposite of 'left'
  assert.equal(turn(g, 'up'), false); // queue is full
});

test('queued turn is applied on the next tick', () => {
  const g = createSnake();
  startGame(g);
  const head = { ...g.snake[0] };
  turn(g, 'up');
  stepSnake(g);
  assert.deepEqual(g.snake[0], { x: head.x, y: head.y - 1 });
  assert.deepEqual(g.dir, { x: 0, y: -1 });
});

test('eating food grows the snake, scores 10 and respawns food off-body', () => {
  const g = createSnake();
  startGame(g);
  const food = { x: g.snake[0].x + 1, y: g.snake[0].y };
  g.food = food;
  const events = stepSnake(g);
  assert.deepEqual(events, ['eat']);
  assert.equal(g.snake.length, 4);
  assert.equal(g.score, 10);
  assert.deepEqual(g.snake[0], food);
  assert.ok(g.food);
  assert.equal(isOccupied(g, g.food.x, g.food.y), false);
  assert.equal(g.tickMs, START_TICK_MS - 4);
});

test('speed increases with food but never below the minimum tick', () => {
  const g = createSnake();
  startGame(g);
  g.tickMs = MIN_TICK_MS + 2;
  g.food = { x: g.snake[0].x + 1, y: g.snake[0].y };
  stepSnake(g);
  assert.equal(g.tickMs, MIN_TICK_MS);
});

test('hitting a wall ends the run', () => {
  const g = createSnake();
  startGame(g);
  g.snake = [
    { x: 0, y: 5 },
    { x: 1, y: 5 },
    { x: 2, y: 5 },
  ];
  g.dir = { x: -1, y: 0 };
  g.food = { x: 10, y: 10 };
  const events = stepSnake(g);
  assert.deepEqual(events, ['over']);
  assert.equal(g.phase, 'over');
  assert.equal(g.snake.length, 3);
});

test('running into your own body ends the run', () => {
  const g = createSnake();
  startGame(g);
  g.snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
    { x: 6, y: 6 },
  ];
  g.dir = { x: 0, y: 1 };
  g.food = { x: 10, y: 10 };
  const events = stepSnake(g);
  assert.deepEqual(events, ['over']);
  assert.equal(g.phase, 'over');
});

test('moving into the tail cell is legal because the tail moves away', () => {
  const g = createSnake();
  startGame(g);
  g.snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 4, y: 6 },
    { x: 5, y: 6 },
  ];
  g.dir = { x: 0, y: 1 };
  g.food = { x: 10, y: 10 };
  const events = stepSnake(g);
  assert.deepEqual(events, []);
  assert.equal(g.phase, 'running');
  assert.deepEqual(g.snake[0], { x: 5, y: 6 });
  assert.equal(g.snake.length, 4);
});

test('no movement or state change happens unless running', () => {
  const g = createSnake();
  const before = JSON.stringify(g.snake);
  stepSnake(g); // idle
  assert.equal(JSON.stringify(g.snake), before);
  startGame(g);
  turn(g, 'up');
  g.phase = 'paused';
  stepSnake(g);
  assert.equal(JSON.stringify(g.snake), before);
  assert.equal(g.queue.length, 1);
});

test('filling the board wins the run', () => {
  const g = createSnake();
  startGame(g);
  const all = [];
  for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) all.push({ x, y });
  g.snake = all.filter((c) => !(c.x === 0 && c.y === 0));
  // Put the head next to the single free cell and point into it.
  g.snake.unshift({ x: 1, y: 0 });
  g.snake.pop();
  g.dir = { x: -1, y: 0 };
  g.food = { x: 0, y: 0 };
  g.queue = [];
  const events = stepSnake(g);
  assert.ok(events.includes('win'));
  assert.equal(g.phase, 'won');
  assert.equal(g.snake.length, GRID * GRID);
  assert.equal(g.food, null);
});

// ============================================================
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
