import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Privacy() {
  useDocumentTitle('Privacy Policy - PlayVerse');

  return (
    <div className="content-page">
      <div className="page-head">
        <h1>🔒 Privacy Policy</h1>
        <p>Last updated: October 24, 2026</p>
      </div>
      <div className="prose">
        <p>
          PlayVerse is designed to work without collecting personal data. This policy explains exactly what
          happens on your device.
        </p>

        <h2>Data we collect</h2>
        <p><b>None.</b> PlayVerse has no accounts, no analytics and no third-party trackers. We do not collect, transmit or sell personal information.</p>

        <h2>Data stored on your device</h2>
        <p>
          To make features like favorites and recently played work, the app stores a small amount of data in your
          browser's local storage:
        </p>
        <ul>
          <li>Your list of favorite games</li>
          <li>Your play history (which games you opened and when)</li>
          <li>Your best scores per game</li>
          <li>Your sound on/off preference</li>
        </ul>
        <p>
          This information stays on your device. You can remove it at any time by clearing site data in your
          browser, or by using the "Clear history" button on the Recently Played page.
        </p>

        <h2>Android app</h2>
        <p>
          The PlayVerse Android app packages the same web application. It requests network access only to load
          the app itself and does not request contacts, location, camera or microphone permissions.
        </p>

        <h2>Children</h2>
        <p>PlayVerse contains only general-audience games and does not collect data from anyone, including children.</p>

        <h2>Changes</h2>
        <p>If this policy changes, the updated date above will change. Significant changes will be noted on the About page.</p>

        <h2>Contact</h2>
        <p>Privacy questions? Open an issue in the PlayVerse GitHub repository.</p>
      </div>
    </div>
  );
}
