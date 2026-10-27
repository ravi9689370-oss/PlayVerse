# 🎮 PlayVerse

A responsive HTML5 gaming platform built with **React + Vite**, featuring original playable games and automated **Android APK** builds through GitHub Actions.

<p align="center">
  <em>Game on - no downloads, no accounts, no ads.</em>
</p>

---

## ✨ Features

- **Seven original playable games** - every game is designed and built in-house:
  | Game | Genre | Highlights |
  |---|---|---|
  | Cosmo Match | Memory | 4×4 pairs, move counter, timer, personal best |
  | Neon Breaker | Arcade | Canvas brick-breaker, 3 lives, speed ramp, pause |
  | Astro Dodge | Action | Canvas meteor dodger, keyboard + touch steering |
  | Tile Blitz | Puzzle | Sliding puzzle (3×3 / 4×4), always-solvable shuffles |
  | Tic-Tac Glow | Casual | Heuristic AI opponent, running score tally |
  | Tap Rush | Action | 30-second reflex round, streak scoring |
  | Neon Snake | Arcade | Grid snake, speed ramp, D-pad + swipe, personal best |
- **Full site experience** - popular & new releases, category browsing, live search, game detail pages with instructions/controls, related games, prev/next navigation
- **Local-first personalization** - favorites, recently played and best scores persist in browser storage (no accounts, no tracking)
- **Game player shell** - restart, sound toggle (WebAudio SFX), fullscreen
- **Honest catalog** - entries still in development are clearly marked *Coming soon*
- **Loading / empty / error states** everywhere, custom 404, error boundaries
- **Responsive** from small phones to wide desktops; `prefers-reduced-motion` respected
- **Android app** via Capacitor (appId `com.playverse.games`, branded icons + splash)

## 🗺️ Routes

`/` · `/popular` · `/new` · `/search` · `/categories` · `/category/[slug]` · `/game/[slug]` · `/favorites` · `/recently-played` · `/about` · `/faq` · `/help` · `/privacy` · `/terms` · `/accessibility` · `*` (404)

## 🚀 Quick start

```bash
npm ci          # install exact dependency versions
npm run dev     # dev server with HMR
npm run build   # production build -> dist/
npm run preview # serve the production build
npm test        # deterministic game-engine unit tests (Node, no browser needed)
```

## 📱 Android (Capacitor)

The committed `android/` project is ready to build. To regenerate web assets and sync:

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

**Automated builds:** the [`Android APK` workflow](.github/workflows/android.yml) runs on every push to `main` that touches app source, and manually from the **Actions → Android APK → Run workflow** tab. Every run publishes a `playverse-debug-apk` artifact (14-day retention).

Installing the APK: transfer `app-debug.apk` to an Android device (5.0+), open it, and allow installation from your browser/file manager when prompted. This is a debug-signed build - for store distribution, create a release signing config.

Branding assets (launcher icons, adaptive foreground, splash) are generated from `scripts/generate-android-icons.mjs`; game thumbnails from `scripts/generate-thumbs.mjs`.

## 🗂️ Project structure

```
├── index.html                  # SPA entry
├── capacitor.config.json       # Capacitor config (appId com.playverse.games)
├── src/
│   ├── components/             # Navbar, Footer, GameCard/Grid, states, error boundary
│   ├── pages/                  # One file per route
│   ├── games/                  # Seven playable games, pure engines + lazy registry
│   ├── data/games.js           # Game catalog (17 entries) + categories + search
│   ├── hooks/                  # useFavorites/useRecent, useDocumentTitle
│   ├── utils/                  # localStorage store, WebAudio sfx
│   └── styles/global.css       # Design system
├── scripts/                    # Asset generators (thumbs, Android icons)
├── android/                    # Capacitor Android project (committed)
└── .github/workflows/android.yml  # APK CI
```

## 🧩 Adding a game

1. Create `src/games/YourGame.jsx` (self-contained, with restart + completion state).
2. Put deterministic rules in `src/games/engines/` and cover them in `scripts/test-engines.mjs`.
3. Register it in `src/games/registry.js`.
4. Add its catalog entry to `src/data/games.js` with `launchType: 'internal'`.
5. Add a thumbnail to `public/thumbs/` (or extend `scripts/generate-thumbs.mjs`).

## 🔒 Privacy

No accounts, no analytics, no trackers. Favorites/history/best scores live only in your browser storage. See `/privacy`.

## 📄 License

The source code is provided for the PlayVerse project. All game designs and artwork are original creations of the PlayVerse project.
