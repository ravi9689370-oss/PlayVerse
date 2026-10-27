// Generates original SVG thumbnails for every catalog game.
// Run: node scripts/generate-thumbs.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/thumbs');
mkdirSync(outDir, { recursive: true });

// slug: [glyph, from, to, accent]
const ART = {
  'cosmo-match': ['🚀', '#2a1a5e', '#0d1030', '#a78bfa'],
  'neon-breaker': ['🧱', '#1a2a5e', '#0c1030', '#22d3ee'],
  'astro-dodge': ['☄️', '#3a1440', '#120a2a', '#f472b6'],
  'tile-blitz': ['🧩', '#14404a', '#0a2030', '#34d399'],
  'tictac-glow': ['⭕', '#403a1a', '#2a2010', '#fbbf24'],
  'tap-rush': ['⚡', '#3a1a1a', '#2a1010', '#f87171'],
  'rocket-run': ['🚀', '#2a1a5e', '#101030', '#c084fc'],
  'cube-hopper': ['🟦', '#1a3a5e', '#0c1830', '#60a5fa'],
  'pixel-snake-3000': ['🐍', '#14401f', '#0a2412', '#4ade80'],
  'star-merge': ['⭐', '#4a3a10', '#26200a', '#fde047'],
  'luma-lines': ['📶', '#103a44', '#081c24', '#2dd4bf'],
  'bubble-nova': ['🫧', '#1a2a6a', '#0c1430', '#93c5fd'],
  'orbit-jumper': ['🪐', '#2a2050', '#120e26', '#d8b4fe'],
  'galaxy-golf': ['⛳', '#1a4a3a', '#0a2620', '#5eead4'],
  'bounce-lab': ['🔴', '#4a1a3a', '#260e1e', '#fb7185'],
  'mega-match-mania': ['🃏', '#4a2a1a', '#26140c', '#fdba74'],
};

const svg = ([glyph, from, to, accent], slug) => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <circle cx="330" cy="52" r="70" fill="${accent}" opacity="0.12"/>
  <circle cx="52" cy="250" r="52" fill="${accent}" opacity="0.10"/>
  <circle cx="352" cy="248" r="24" fill="${accent}" opacity="0.22"/>
  <circle cx="40" cy="48" r="10" fill="#ffffff" opacity="0.18"/>
  <circle cx="120" cy="90" r="5" fill="#ffffff" opacity="0.25"/>
  <circle cx="300" cy="150" r="7" fill="#ffffff" opacity="0.2"/>
  <text x="200" y="186" font-size="118" text-anchor="middle" dominant-baseline="middle" style="font-family: 'Segoe UI Emoji','Noto Color Emoji',sans-serif">${glyph}</text>
</svg>
`;

for (const [slug, art] of Object.entries(ART)) {
  const file = resolve(outDir, `${slug}.svg`);
  writeFileSync(file, svg(art, slug), 'utf8');
  console.log('wrote', file);
}
console.log(`Done: ${Object.keys(ART).length} thumbnails`);
