import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function About() {
  useDocumentTitle('About - PlayVerse');

  return (
    <div className="content-page">
      <div className="page-head">
        <h1>🎮 About PlayVerse</h1>
        <p>Game on - a small platform with a big arcade heart.</p>
      </div>
      <div className="prose">
        <h2>Our mission</h2>
        <p>
          PlayVerse exists to make playing games on the web instant and effortless: no downloads, no accounts,
          no paywalls. Open a page, tap a game, and you are playing within a second - on a laptop, a tablet or
          an Android phone.
        </p>

        <h2>What you will find here</h2>
        <ul>
          <li><b>Original games.</b> Every launched game is an original PlayVerse creation, designed and built in-house. Nothing is scraped or copied from other platforms.</li>
          <li><b>Six genres in progress.</b> Arcade, puzzle, memory, casual and action games, with more added regularly.</li>
          <li><b>Local-first features.</b> Favorites, recently played and best scores live in your browser storage. We do not run user accounts and we do not collect play data.</li>
          <li><b>One codebase, two platforms.</b> The same React application runs in the browser and inside the PlayVerse Android app, packaged with Capacitor.</li>
        </ul>

        <h2>Technology</h2>
        <p>
          PlayVerse is built with React and Vite, styled with hand-written CSS, and packaged for Android with
          Capacitor. Continuous integration builds a fresh Android APK on every release through GitHub Actions.
          The full source is open in the project's GitHub repository.
        </p>

        <h2>Contact</h2>
        <p>
          Questions, bug reports or game ideas? Open an issue in the GitHub repository or check the{' '}
          <Link to="/help">help center</Link> for troubleshooting first.
        </p>
      </div>
    </div>
  );
}
