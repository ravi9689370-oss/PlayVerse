// ============================================================
// Neon Snake - pure game engine (no React, no DOM)
// Grid movement, growth, food placement and collision rules are
// deterministic so they can be unit-tested in Node.
// ============================================================

export const GRID = 20;
export const CELL = 24;
export const BOARD_PX = GRID * CELL; // 480
export const SCORE_PER_FOOD = 10;
export const START_TICK_MS = 150;
export const MIN_TICK_MS = 80;
export const SPEEDUP_MS = 4;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createGame(rng = Math.random) {
  const game = {
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    dir: { ...DIRECTIONS.right },
    queue: [],
    food: null,
    score: 0,
    tickMs: START_TICK_MS,
    phase: 'idle', // idle | running | paused | over | won
    bestSaved: false,
  };
  game.food = placeFood(game, rng);
  return game;
}

export function startGame(game) {
  if (game.phase === 'idle' || game.phase === 'over' || game.phase === 'won') {
    game.phase = 'running';
  }
  return game;
}

export function isOccupied(game, x, y) {
  return game.snake.some((s) => s.x === x && s.y === y);
}

/**
 * Pick a uniformly random free cell. Never returns a cell occupied by the
 * snake (unless the board is full, in which case it returns null).
 */
export function placeFood(game, rng = Math.random) {
  const free = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!isOccupied(game, x, y)) free.push({ x, y });
    }
  }
  if (free.length === 0) return null;
  const idx = Math.min(free.length - 1, Math.floor(rng() * free.length));
  return free[idx];
}

/**
 * Queue a direction change. Rejects 180-degree reversals (checked against the
 * last queued direction, so buffered double turns stay legal) and limits the
 * buffer to two turns. Returns true when the turn was accepted.
 */
export function turn(game, name) {
  const dir = DIRECTIONS[name];
  if (!dir || game.phase !== 'running') return false;
  const last = game.queue.length ? game.queue[game.queue.length - 1] : game.dir;
  if (dir.x === last.x && dir.y === last.y) return false; // same direction
  if (dir.x === -last.x && dir.y === -last.y) return false; // 180 degrees
  if (game.queue.length >= 2) return false;
  game.queue.push({ ...dir });
  return true;
}

/**
 * Advance exactly one movement tick.
 * Returns events: 'eat' when food is eaten, 'over' on death, 'win' when the
 * snake fills the whole board.
 */
export function stepSnake(game, rng = Math.random) {
  const events = [];
  if (game.phase !== 'running') return events;

  if (game.queue.length) game.dir = game.queue.shift();

  const head = game.snake[0];
  const next = { x: head.x + game.dir.x, y: head.y + game.dir.y };

  // Walls
  if (next.x < 0 || next.x >= GRID || next.y < 0 || next.y >= GRID) {
    game.phase = 'over';
    events.push('over');
    return events;
  }

  const willEat = !!game.food && next.x === game.food.x && next.y === game.food.y;

  // The tail cell frees up this tick unless the snake is growing, so moving
  // into the old tail position is legal.
  const body = willEat ? game.snake : game.snake.slice(0, -1);
  if (body.some((s) => s.x === next.x && s.y === next.y)) {
    game.phase = 'over';
    events.push('over');
    return events;
  }

  game.snake.unshift(next);

  if (willEat) {
    game.score += SCORE_PER_FOOD;
    game.tickMs = Math.max(MIN_TICK_MS, game.tickMs - SPEEDUP_MS);
    events.push('eat');
    if (game.snake.length >= GRID * GRID) {
      game.food = null;
      game.phase = 'won';
      events.push('win');
    } else {
      game.food = placeFood(game, rng);
    }
  } else {
    game.snake.pop();
  }

  return events;
}
