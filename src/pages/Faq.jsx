import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const FAQS = [
  {
    q: 'Is PlayVerse really free?',
    a: 'Yes. All games on PlayVerse are free to play, with no ads, no tracking and no account required.',
  },
  {
    q: 'Do the games work on phones and tablets?',
    a: 'Yes. Every game supports touch controls and responsive layouts, and the PlayVerse Android app packages the entire platform for offline-style native use.',
  },
  {
    q: 'Where are my scores and favorites stored?',
    a: 'In your browser local storage, on your device only. Clearing site data removes them. Nothing is sent to any server.',
  },
  {
    q: 'A game is marked "Coming soon" - what does that mean?',
    a: 'Some catalog entries are announced early while they are still in development. They are clearly labeled and become playable as soon as they pass testing.',
  },
  {
    q: 'Can I play without an internet connection?',
    a: 'In the Android app, yes - once loaded, games run without a network. The web version requires an initial page load.',
  },
  {
    q: 'How do I report a bug or suggest a game?',
    a: 'Open an issue on the PlayVerse GitHub repository, or visit the help center for troubleshooting steps first.',
  },
  {
    q: 'Will you add multiplayer?',
    a: 'Local same-device multiplayer is planned for future titles. Online multiplayer is not on the roadmap right now.',
  },
];

export default function Faq() {
  useDocumentTitle('FAQ - PlayVerse');

  return (
    <div className="content-page">
      <div className="page-head">
        <h1>❓ Frequently Asked Questions</h1>
        <p>Quick answers about games, accounts and data.</p>
      </div>
      {FAQS.map((f) => (
        <details key={f.q} className="faq-item">
          <summary>{f.q}</summary>
          <div className="faq-body">{f.a}</div>
        </details>
      ))}
      <p style={{ color: 'var(--text-muted)', marginTop: 22 }}>
        More help in the <Link to="/help">help center</Link>. Legal questions are covered in the{' '}
        <Link to="/privacy">privacy policy</Link> and <Link to="/terms">terms</Link>.
      </p>
    </div>
  );
}
