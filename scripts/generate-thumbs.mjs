// Generates original geometric SVG thumbnails for every catalog game.
// Pure SVG primitives (no text/emoji glyphs) so artwork never depends on fonts.
// Run: node scripts/generate-thumbs.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/thumbs');
mkdirSync(outDir, { recursive: true });

// Per-game scene: [from, to, accent, sceneId]
const ART = {
  'cosmo-match':      ['#2a1a5e', '#0d1030', '#a78bfa', 'memory'],
  'neon-breaker':     ['#1a2a5e', '#0c1030', '#22d3ee', 'breaker'],
  'astro-dodge':      ['#3a1440', '#120a2a', '#f472b6', 'dodge'],
  'tile-blitz':       ['#14404a', '#0a2030', '#34d399', 'tiles'],
  'tictac-glow':      ['#403a1a', '#2a2010', '#fbbf24', 'tictac'],
  'tap-rush':         ['#3a1a1a', '#2a1010', '#f87171', 'rush'],
  'neon-snake':       ['#103a2e', '#08160f', '#34d399', 'snake'],
  'rocket-run':       ['#2a1a5e', '#101030', '#c084fc', 'soon'],
  'cube-hopper':      ['#1a3a5e', '#0c1830', '#60a5fa', 'soon'],
  'pixel-snake-3000': ['#14401f', '#0a2412', '#4ade80', 'soon'],
  'star-merge':       ['#4a3a10', '#26200a', '#fde047', 'soon'],
  'luma-lines':       ['#103a44', '#081c24', '#2dd4bf', 'soon'],
  'bubble-nova':      ['#1a2a6a', '#0c1430', '#93c5fd', 'soon'],
  'orbit-jumper':     ['#2a2050', '#120e26', '#d8b4fe', 'soon'],
  'galaxy-golf':      ['#1a4a3a', '#0a2620', '#5eead4', 'soon'],
  'bounce-lab':       ['#4a1a3a', '#260e1e', '#fb7185', 'soon'],
  'mega-match-mania': ['#4a2a1a', '#26140c', '#fdba74', 'soon'],
};

const BG = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{FROM}"/>
      <stop offset="1" stop-color="{TO}"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <circle cx="330" cy="52" r="70" fill="{ACCENT}" opacity="0.12"/>
  <circle cx="52" cy="250" r="52" fill="{ACCENT}" opacity="0.10"/>
  <circle cx="352" cy="248" r="24" fill="{ACCENT}" opacity="0.22"/>
  <circle cx="40" cy="48" r="10" fill="#ffffff" opacity="0.18"/>
  <circle cx="120" cy="90" r="5" fill="#ffffff" opacity="0.25"/>
  <circle cx="300" cy="150" r="7" fill="#ffffff" opacity="0.2"/>`;

// Scene artwork, centered around (200,150)
const SCENES = {
  memory: `
    <g filter="url(#glow)">
      <rect x="118" y="88" width="76" height="94" rx="12" fill="#232345" stroke="{ACCENT}" stroke-width="3" transform="rotate(-8 156 135)"/>
      <rect x="206" y="88" width="76" height="94" rx="12" fill="#3b2a75" stroke="{ACCENT}" stroke-width="3" transform="rotate(7 244 135)"/>
      <path d="M244 116 l9 20 22 3 -16 15 4 22 -19 -11 -19 11 4 -22 -16 -15 22 -3 z" fill="#fde047" transform="rotate(7 244 135) translate(0 -4)"/>
      <text x="156" y="150" font-size="42" text-anchor="middle" dominant-baseline="middle" fill="{ACCENT}" font-family="sans-serif" font-weight="700" transform="rotate(-8 156 135)">?</text>
    </g>`,
  breaker: `
    <g filter="url(#glow)">
      ${['#f472b6', '#a78bfa', '#818cf8'].map((c, r) =>
        Array.from({ length: 6 }, (_, i) =>
          `<rect x="${104 + i * 34}" y="${86 + r * 22}" width="28" height="16" rx="4" fill="${c}"${(r === 2 && i === 2) || (r === 1 && i === 4) ? ' opacity="0.15"' : ''}/>`
        ).join('')
      ).join('')}
      <rect x="170" y="232" width="72" height="12" rx="6" fill="#a78bfa"/>
      <circle cx="212" cy="208" r="8" fill="#22d3ee"/>
    </g>`,
  dodge: `
    <g filter="url(#glow)">
      <circle cx="150" cy="96" r="16" fill="#6d28d9"/><circle cx="140" cy="88" r="5" fill="#a78bfa" opacity="0.8"/>
      <circle cx="262" cy="128" r="22" fill="#4c1d95"/><circle cx="254" cy="120" r="7" fill="#a78bfa" opacity="0.8"/>
      <circle cx="196" cy="70" r="9" fill="#7c3aed"/>
      <path d="M200 178 l-24 44 h48 z" fill="#22d3ee"/>
      <path d="M192 222 l8 16 8 -16 z" fill="#f472b6"/>
    </g>`,
  tiles: `
    <g filter="url(#glow)">
      ${[['1', 0, 0], ['4', 1, 0], ['7', 0, 1], ['', 1, 1]].map(([n, cx, cy]) =>
        `<rect x="${150 + cx * 56}" y="${96 + cy * 56}" width="50" height="50" rx="9" fill="${n ? 'url(#tileg)' : 'transparent'}" stroke="${n ? 'transparent' : '#3a3a5c'}" stroke-width="2" stroke-dasharray="5 4"/>` +
        (n ? `<text x="${175 + cx * 56}" y="${121 + cy * 56}" font-size="26" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="700" fill="#f1f1fb">${n}</text>` : '')
      ).join('')}
      <defs><linearGradient id="tileg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34346a"/><stop offset="1" stop-color="#23234a"/></linearGradient></defs>
    </g>`,
  tictac: `
    <g filter="url(#glow)" stroke-linecap="round">
      <path d="M132 96 l48 48 M180 96 l-48 48" stroke="#22d3ee" stroke-width="9"/>
      <circle cx="238" cy="182" r="27" fill="none" stroke="#f472b6" stroke-width="9"/>
      <path d="M252 100 l32 32 M284 100 l-32 32" stroke="#22d3ee" stroke-width="9" opacity="0.35"/>
    </g>`,
  rush: `
    <g filter="url(#glow)">
      <circle cx="200" cy="142" r="58" fill="none" stroke="{ACCENT}" stroke-width="3" opacity="0.35"/>
      <circle cx="200" cy="142" r="40" fill="none" stroke="{ACCENT}" stroke-width="3" opacity="0.55"/>
      <circle cx="200" cy="142" r="24" fill="{ACCENT}"/>
      <circle cx="192" cy="134" r="8" fill="#ffffff" opacity="0.75"/>
      <path d="M288 82 l-14 22 h11 l-9 20 24 -26 h-12 l10 -16 z" fill="#fbbf24"/>
    </g>`,
  snake: `
    <g filter="url(#glow)">
      <rect x="108" y="76" width="184" height="148" rx="12" fill="#07130d" stroke="{ACCENT}" stroke-width="2" opacity="0.92"/>
      <rect x="172" y="144" width="22" height="18" rx="5" fill="{ACCENT}" opacity="0.45"/>
      <rect x="172" y="126" width="22" height="18" rx="5" fill="{ACCENT}" opacity="0.6"/>
      <rect x="172" y="108" width="22" height="18" rx="5" fill="{ACCENT}" opacity="0.75"/>
      <rect x="150" y="108" width="22" height="18" rx="5" fill="{ACCENT}" opacity="0.9"/>
      <rect x="128" y="108" width="22" height="18" rx="5" fill="#6ee7b7"/>
      <circle cx="133" cy="113" r="2.4" fill="#062f22"/>
      <circle cx="133" cy="121" r="2.4" fill="#062f22"/>
      <circle cx="240" cy="103" r="10" fill="#f472b6"/>
      <circle cx="237" cy="100" r="3.2" fill="#ffffff" opacity="0.75"/>
    </g>`,
  soon: `
    <g filter="url(#glow)" opacity="0.9">
      <rect x="152" y="102" width="96" height="96" rx="16" fill="none" stroke="{ACCENT}" stroke-width="4"/>
      <rect x="170" y="120" width="60" height="60" rx="10" fill="{ACCENT}" opacity="0.4"/>
      <circle cx="200" cy="150" r="14" fill="#0a0a18" opacity="0.55"/>
    </g>`,
};

for (const [slug, [from, to, accent, scene]] of Object.entries(ART)) {
  const bg = BG.replace(/{FROM}/g, from).replace(/{TO}/g, to).replace(/{ACCENT}/g, accent);
  const art = SCENES[scene].replace(/{ACCENT}/g, accent);
  const file = resolve(outDir, `${slug}.svg`);
  writeFileSync(
    file,
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">${bg}${art}</svg>\n`,
    'utf8'
  );
}
console.log(`Done: ${Object.keys(ART).length} thumbnails`);
