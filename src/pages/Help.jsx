import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Help() {
  useDocumentTitle('Help Center - PlayVerse');

  return (
    <div className="content-page">
      <div className="page-head">
        <h1>🛟 Help Center</h1>
        <p>Getting started, saving data and fixing common problems.</p>
      </div>
      <div className="prose">
        <h2>Getting started</h2>
        <ul>
          <li>Pick any game from <Link to="/popular">Popular</Link>, <Link to="/new">New</Link> or <Link to="/categories">Categories</Link>.</li>
          <li>Each game shows its own instructions and controls below the player on its page.</li>
          <li>Use the player toolbar to restart, mute sound or switch to fullscreen.</li>
        </ul>

        <h2>Favorites &amp; history</h2>
        <p>
          Tap the ♡ on a game card (or the button on a game page) to favorite it. Favorites and recently played
          lists appear in the top navigation and are stored locally on your device - see the{' '}
          <Link to="/privacy">privacy policy</Link> for details.
        </p>

        <h2>Common problems</h2>
        <h3>The game does not respond to my keyboard</h3>
        <p>
          First click or tap inside the game area so the browser focuses it. On some laptops, function/media keys
          intercept arrows - try WASD in games that support it (Astro Dodge).
        </p>
        <h3>The game canvas looks too small</h3>
        <p>Use the ⛶ Fullscreen button in the player toolbar. On Android, fullscreen hides system bars where supported.</p>
        <h3>Sound is not playing</h3>
        <p>
          Check the 🔊 toggle in the player toolbar. Browsers only allow audio after your first interaction with
          a page - tap once anywhere and sound will start working.
        </p>
        <h3>My favorites disappeared</h3>
        <p>
          Favorites live in browser storage. Private/incognito windows, or clearing site data, remove them. Keep
          using the same browser profile to keep your lists.
        </p>
        <h3>The app shows a network error</h3>
        <p>
          The Android app needs a network connection for the very first launch; after that games run offline.
          If the web version fails to load, check your connection and reload.
        </p>

        <h2>Still stuck?</h2>
        <p>
          Check the <Link to="/faq">FAQ</Link>, or open an issue in the PlayVerse GitHub repository with the page
          you were on and what you expected to happen.
        </p>
      </div>
    </div>
  );
}
