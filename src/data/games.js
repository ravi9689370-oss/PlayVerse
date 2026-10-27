// ============================================================
// PlayVerse game catalog
// launchType:
//   'internal'    - playable game shipped with the app (component in src/games)
//   'unavailable' - catalog entry under development; clearly indicated as not playable yet
// popularityRank is a fixed editorial curation value, NOT a live statistic.
// ============================================================

export const CATEGORIES = [
  { slug: 'arcade', label: 'Arcade', icon: '👾', color: '#8b5cf6', blurb: 'Fast, score-chasing action.' },
  { slug: 'puzzle', label: 'Puzzle', icon: '🧩', color: '#22d3ee', blurb: 'Logic, tiles and thinking.' },
  { slug: 'memory', label: 'Memory', icon: '🧠', color: '#f472b6', blurb: 'Train your recall.' },
  { slug: 'casual', label: 'Casual', icon: '🎲', color: '#fbbf24', blurb: 'Easy to pick up, hard to put down.' },
  { slug: 'action', label: 'Action', icon: '⚡', color: '#34d399', blurb: 'Quick reflexes required.' },
];

const g = (fields) => ({ instructions: null, controls: null, ...fields });

export const GAMES = [
  // ---------------- Playable original games ----------------
  g({
    id: 'pv-001',
    slug: 'cosmo-match',
    title: 'Cosmo Match',
    description: 'Flip cards and pair up cosmic symbols in this relaxing memory game. Fewer moves, better score.',
    category: 'memory',
    thumbnail: '/thumbs/cosmo-match.svg',
    launchType: 'internal',
    componentKey: 'CosmoMatch',
    launchUrl: null,
    instructions: 'Flip two cards per turn. If the symbols match, they stay revealed. Clear the whole board by matching all 8 pairs.',
    controls: 'Mouse click or tap a card to flip it. Keyboard: cards are focusable, press Enter or Space to flip.',
    published: true,
    createdAt: '2026-10-05T10:00:00Z',
    updatedAt: '2026-10-20T09:30:00Z',
    popularityRank: 1,
  }),
  g({
    id: 'pv-002',
    slug: 'neon-breaker',
    title: 'Neon Breaker',
    description: 'Bounce a plasma ball, smash every neon brick and clear the wall. A classic arcade brick-breaker with 3 lives.',
    category: 'arcade',
    thumbnail: '/thumbs/neon-breaker.svg',
    launchType: 'internal',
    componentKey: 'NeonBreaker',
    launchUrl: null,
    instructions: 'Keep the ball in play and destroy all bricks. You have 3 lives. The ball speeds up as you clear bricks.',
    controls: 'Move the paddle with the mouse, touch drag, or Arrow keys. Press P to pause. Click or press Space to launch.',
    published: true,
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-21T14:00:00Z',
    popularityRank: 2,
  }),
  g({
    id: 'pv-003',
    slug: 'astro-dodge',
    title: 'Astro Dodge',
    description: 'Pilot your ship through a meteor storm. Survive as long as you can while the field gets faster.',
    category: 'action',
    thumbnail: '/thumbs/astro-dodge.svg',
    launchType: 'internal',
    componentKey: 'AstroDodge',
    launchUrl: null,
    instructions: 'Dodge falling meteors for as long as possible. Every second survived scores a point and meteors keep getting faster.',
    controls: 'Move with Arrow keys or A/D, or drag your finger / mouse horizontally. P pauses the run.',
    published: true,
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-22T08:00:00Z',
    popularityRank: 3,
  }),
  g({
    id: 'pv-004',
    slug: 'tile-blitz',
    title: 'Tile Blitz',
    description: 'The classic sliding puzzle. Slide tiles into order on 3x3 or 4x4 boards against the clock.',
    category: 'puzzle',
    thumbnail: '/thumbs/tile-blitz.svg',
    launchType: 'internal',
    componentKey: 'TileBlitz',
    launchUrl: null,
    instructions: 'Tap a tile next to the empty slot to slide it. Order all tiles 1..N (left-to-right, top-to-bottom) to win. Choose a 3x3 or 4x4 board.',
    controls: 'Click or tap tiles adjacent to the gap. Arrow keys slide tiles into the gap on desktop.',
    published: true,
    createdAt: '2026-10-14T10:00:00Z',
    updatedAt: '2026-10-18T11:00:00Z',
    popularityRank: 5,
  }),
  g({
    id: 'pv-005',
    slug: 'tictac-glow',
    title: 'Tic-Tac Glow',
    description: 'Neon tic-tac-toe against a smart opponent. It blocks, it attacks - can you outsmart it?',
    category: 'casual',
    thumbnail: '/thumbs/tictac-glow.svg',
    launchType: 'internal',
    componentKey: 'TicTacGlow',
    launchUrl: null,
    instructions: 'Take turns marking cells. Line up three in a row (horizontal, vertical or diagonal) to win the round. The running score is tracked per session.',
    controls: 'Click or tap an empty cell to place your mark. New Round resets the board; Reset Scores clears the tally.',
    published: true,
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-16T10:00:00Z',
    popularityRank: 4,
  }),
  g({
    id: 'pv-006',
    slug: 'tap-rush',
    title: 'Tap Rush',
    description: 'Thirty seconds of pure reflex. Hit as many glowing orbs as you can before the timer runs out.',
    category: 'action',
    thumbnail: '/thumbs/tap-rush.svg',
    launchType: 'internal',
    componentKey: 'TapRush',
    launchUrl: null,
    instructions: 'Targets pop up one at a time for 30 seconds. Tap or click each one before it shrinks away. Chain hits for streak bonuses.',
    controls: 'Tap targets on touch screens or click with the mouse. Speed matters - the streak multiplies your score.',
    published: true,
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-10-23T12:00:00Z',
    popularityRank: 6,
  }),

  // ---------------- Catalog entries in development (clearly marked) ----------------
  g({
    id: 'pv-101',
    slug: 'rocket-run',
    title: 'Rocket Run',
    description: 'An endless runner through asteroid belts with a jetpack fuel meter.',
    category: 'action',
    thumbnail: '/thumbs/rocket-run.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-102',
    slug: 'cube-hopper',
    title: 'Cube Hopper',
    description: 'Hop from platform to platform in a neon skyline. One wrong jump and it is over.',
    category: 'arcade',
    thumbnail: '/thumbs/cube-hopper.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-23T10:00:00Z',
    updatedAt: '2026-10-23T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-103',
    slug: 'pixel-snake-3000',
    title: 'Pixel Snake 3000',
    description: 'The worm game, reborn with portals, speed fruit and a wrap-around arena.',
    category: 'arcade',
    thumbnail: '/thumbs/pixel-snake-3000.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-22T10:00:00Z',
    updatedAt: '2026-10-22T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-104',
    slug: 'star-merge',
    title: 'Star Merge',
    description: 'Merge matching stars to forge bigger celestial bodies in a tiny grid.',
    category: 'puzzle',
    thumbnail: '/thumbs/star-merge.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-21T10:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-105',
    slug: 'luma-lines',
    title: 'Luma Lines',
    description: 'Draw lines of light to route energy between nodes without crossing beams.',
    category: 'puzzle',
    thumbnail: '/thumbs/luma-lines.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-106',
    slug: 'bubble-nova',
    title: 'Bubble Nova',
    description: 'Match three bubbles to trigger chain-reaction novas across the board.',
    category: 'casual',
    thumbnail: '/thumbs/bubble-nova.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-19T10:00:00Z',
    updatedAt: '2026-10-19T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-107',
    slug: 'orbit-jumper',
    title: 'Orbit Jumper',
    description: 'Time your hops between spinning orbits and climb the tower of rings.',
    category: 'arcade',
    thumbnail: '/thumbs/orbit-jumper.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-17T10:00:00Z',
    updatedAt: '2026-10-17T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-108',
    slug: 'galaxy-golf',
    title: 'Galaxy Golf',
    description: 'Sink plasma balls across mini planets with wind and gravity quirks.',
    category: 'casual',
    thumbnail: '/thumbs/galaxy-golf.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-109',
    slug: 'bounce-lab',
    title: 'Bounce Lab',
    description: 'A physics sandbox of bumpers, ramps and one very bouncy ball.',
    category: 'casual',
    thumbnail: '/thumbs/bounce-lab.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-11T10:00:00Z',
    updatedAt: '2026-10-11T10:00:00Z',
    popularityRank: 99,
  }),
  g({
    id: 'pv-110',
    slug: 'mega-match-mania',
    title: 'Mega Match Mania',
    description: 'A bigger, faster memory challenge with timers, wildcards and combo scoring.',
    category: 'memory',
    thumbnail: '/thumbs/mega-match-mania.svg',
    launchType: 'unavailable',
    published: false,
    createdAt: '2026-10-09T10:00:00Z',
    updatedAt: '2026-10-09T10:00:00Z',
    popularityRank: 99,
  }),
];

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getGame(slug) {
  return GAMES.find((x) => x.slug === slug) || null;
}

export function playableGames() {
  return GAMES.filter((x) => x.launchType === 'internal' && x.published);
}

/** Curated "popular" list - editorial ranking, not live usage data. */
export function popularGames() {
  return [...GAMES]
    .filter((x) => x.published)
    .sort((a, b) => a.popularityRank - b.popularityRank);
}

export function newGames() {
  return [...GAMES]
    .filter((x) => x.published)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function gamesInCategory(slug) {
  return GAMES.filter((x) => x.category === slug && x.published).sort(
    (a, b) => a.popularityRank - b.popularityRank
  );
}

/** Related games: same category first, then the rest. */
export function relatedGames(game, count = 4) {
  const same = GAMES.filter((x) => x.published && x.category === game.category && x.slug !== game.slug);
  const others = GAMES.filter((x) => x.published && x.category !== game.category);
  return [...same, ...others].slice(0, count);
}

export function searchGames(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return GAMES.filter((x) => {
    const hay = `${x.title} ${x.category} ${x.description}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}
