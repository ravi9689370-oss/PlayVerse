# PlayVerse - Deployment & Build Guide

## Architecture summary

PlayVerse is a **single-page React application (Vite)** with no server-side runtime requirements:

- All pages are client-rendered; the catalog is bundled (`src/data/games.js`).
- Personalization (favorites, history, best scores) uses browser `localStorage`.
- There is **no backend, database, or API key** - any static file host works.

Client-side routing uses `BrowserRouter`. Hosting must therefore rewrite
unknown paths to `/index.html` (standard SPA fallback).

---

## 1. Static web hosting

Build and deploy `dist/`:

```bash
npm ci
npm run build
# deploy the dist/ folder
```

Host-specific SPA rewrites:

| Host | Configuration |
|---|---|
| Netlify | `_redirects` file: `/* /index.html 200` |
| Vercel | automatic for SPAs (`vercel.json` rewrite if needed) |
| GitHub Pages | 404 fallback: copy `dist/index.html` to `dist/404.html` |
| Nginx | `try_files $uri $uri/ /index.html;` |
| Firebase Hosting | `"rewrites": [{ "source": "**", "destination": "/index.html" }]` |

> Note: the built app assumes it is served from the site root (`base: '/'` in
> `vite.config.js`). Serve from a subfolder only after changing `base`.

## 2. Android APK (Capacitor)

Prerequisites: Node 18+, JDK 17, Android SDK (compile/target SDK 34).

```bash
npm ci
npm run build            # web assets -> dist/
npx cap sync android     # copy web assets + update plugins
cd android
./gradlew assembleDebug  # debug APK
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`
(works on Android 5.0+ / API 22+).

### Release builds (store distribution)

1. Generate a keystore (keep it **private**; never commit it):

   ```bash
   keytool -genkey -v -keystore playverse-release.keystore \
           -alias playverse -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure signing via environment variables or a local (uncommitted)
   `android/keystore.properties`, and switch `build.gradle` to a signed
   `assembleRelease`.
3. Build `./gradlew assembleRelease`.

### CI

`.github/workflows/android.yml` builds the debug APK on GitHub-hosted
Ubuntu runners and uploads the artifact `playverse-debug-apk` (14-day
retention). Triggers: `workflow_dispatch` and pushes to `main` touching
app source or Android config.

## 3. Regenerating assets

```bash
npm run generate:thumbs   # public/thumbs/*.svg (game artwork)
npm run generate:icons    # android launcher icons + splash (needs rsvg-convert)
```

Both are idempotent and safe to re-run.
