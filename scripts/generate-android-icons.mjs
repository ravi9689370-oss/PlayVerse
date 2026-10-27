// Brands the Capacitor Android project with original PlayVerse artwork:
// launcher icons (legacy + round), adaptive-icon foreground, and splash screens.
// Requires rsvg-convert (or ImageMagick with rsvg delegate). Run after `cap add android`.
// Run: node scripts/generate-android-icons.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const res = resolve(root, 'android/app/src/main/res');
const tmp = resolve(root, 'scripts/.icon-tmp');
mkdirSync(tmp, { recursive: true });

if (!existsSync(res)) {
  console.error('android/app/src/main/res not found - run `npx cap add android` first.');
  process.exit(1);
}

const GLYPH = `<path d="M -8 -30 L 8 -30 L 8 12 L -8 12 Z M 2 -30 L 12 -30 A 16 16 0 1 1 12 2 L 8 2 L 8 -30" fill="#ffffff" fill-rule="evenodd"/>`;

// P glyph drawn on a 100x100 coordinate space, translated to center.
const glyphAt = (cx, cy, scale) =>
  `<g transform="translate(${cx} ${cy}) scale(${scale})">${GLYPH}</g>`;

const accents = (r = 100) => `
  <circle cx="${r * 0.2}" cy="${r * 0.78}" r="${r * 0.05}" fill="#0a0a18" opacity="0.55"/>
  <circle cx="${r * 0.82}" cy="${r * 0.2}" r="${r * 0.04}" fill="#0a0a18" opacity="0.4"/>`;

const defs = `
  <defs>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>`;

// ---- master SVGs (256px canonical, downscaled per density) ----
const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 100 100">${defs}
  <rect x="0" y="0" width="100" height="100" rx="30" fill="url(#badge)"/>
  ${glyphAt(50, 52, 0.72)}${accents()}
</svg>`;

const roundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 100 100">${defs}
  <circle cx="50" cy="50" r="50" fill="url(#badge)"/>
  ${glyphAt(50, 52, 0.66)}${accents()}
</svg>`;

// Adaptive foreground: transparent background, glyph inside the 66/108 safe zone.
const foregroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 108 108">
  ${glyphAt(54, 56, 0.9)}
</svg>`;

function splashSvg(w, h) {
  const cx = w / 2;
  const cy = h / 2 - h * 0.02;
  const gscale = Math.min(w, h) * 0.0042;
  const font = Math.min(w, h) * 0.085;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#241a52"/>
      <stop offset="0.55" stop-color="#12122a"/>
      <stop offset="1" stop-color="#0a0a18"/>
    </linearGradient>
    <linearGradient id="sbadge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sbg)"/>
  <circle cx="${w * 0.85}" cy="${h * 0.12}" r="${Math.min(w, h) * 0.16}" fill="#8b5cf6" opacity="0.10"/>
  <circle cx="${w * 0.12}" cy="${h * 0.85}" r="${Math.min(w, h) * 0.12}" fill="#22d3ee" opacity="0.08"/>
  <rect x="${cx - font * 1.05}" y="${cy - font * 1.05}" width="${font * 2.1}" height="${font * 2.1}" rx="${font * 0.62}" fill="url(#sbadge)"/>
  <g transform="translate(${cx} ${cy - font * 0.06}) scale(${(font * 1.45) / 100})"><path d="M -8 -30 L 8 -30 L 8 12 L -8 12 Z M 2 -30 L 12 -30 A 16 16 0 1 1 12 2 L 8 2 L 8 -30" fill="#0a0a18" fill-rule="evenodd"/></g>
  <text x="${cx}" y="${cy + font * 2.5}" font-family="DejaVu Sans" font-weight="bold" font-size="${font}" fill="#ffffff" text-anchor="middle">Play<tspan fill="#a78bfa">Verse</tspan></text>
</svg>`;
}

writeFileSync(resolve(tmp, 'badge.svg'), badgeSvg);
writeFileSync(resolve(tmp, 'round.svg'), roundSvg);
writeFileSync(resolve(tmp, 'foreground.svg'), foregroundSvg);

function rsvgSize(svgFile, px, out) {
  mkdirSync(dirname(out), { recursive: true });
  try {
    execFileSync('rsvg-convert', ['-w', String(px), '-h', String(px), svgFile, '-o', out]);
  } catch {
    execFileSync('magick', [svgFile, '-resize', `${px}x${px}`, out]);
  }
}

function rsvgSplash(svgFile, w, h, out) {
  mkdirSync(dirname(out), { recursive: true });
  try {
    execFileSync('rsvg-convert', ['-w', String(w), '-h', String(h), svgFile, '-o', out]);
  } catch {
    execFileSync('magick', [svgFile, '-resize', `${w}x${h}!`, out]);
  }
}

const MIPMAP = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const count = { icons: 0, splashes: 0 };

for (const [density, px] of Object.entries(MIPMAP)) {
  const dir = resolve(res, `mipmap-${density}`);
  if (!existsSync(dir)) continue;
  rsvgSize(resolve(tmp, 'badge.svg'), px, resolve(dir, 'ic_launcher.png'));
  rsvgSize(resolve(tmp, 'round.svg'), px, resolve(dir, 'ic_launcher_round.png'));
  rsvgSize(resolve(tmp, 'foreground.svg'), Math.round(px * 2.25), resolve(dir, 'ic_launcher_foreground.png'));
  count.icons += 3;
}

// Adaptive icon background color (referenced by mipmap-anydpi-v26 XML)
const bgXml = resolve(res, 'values/ic_launcher_background.xml');
if (existsSync(bgXml)) {
  writeFileSync(
    bgXml,
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#12122A</color>\n</resources>\n`
  );
}

// Splash screens - overwrite every splash.png in drawable* folders at its native size.
writeFileSync(resolve(tmp, 'splash.svg'), splashSvg(2048, 2048));
const splashTargets = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory() && entry.name.startsWith('drawable')) walk(full);
    else if (entry.isFile() && entry.name === 'splash.png') splashTargets.push(full);
  }
};
walk(res);
for (const target of splashTargets) {
  let size = { w: 480, h: 320 };
  try {
    const out = execFileSync('identify', ['-format', '%w %h', target]).toString().split(/\s+/);
    size = { w: parseInt(out[0], 10), h: parseInt(out[1], 10) };
  } catch {
    /* fall back to default size */
  }
  writeFileSync(resolve(tmp, 'splash-t.svg'), splashSvg(size.w, size.h));
  rsvgSplash(resolve(tmp, 'splash-t.svg'), size.w, size.h, target);
  count.splashes += 1;
}

console.log(`Branded ${count.icons} icon rasters and ${count.splashes} splash screens.`);
