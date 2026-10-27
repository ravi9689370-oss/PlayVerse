import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { CATEGORIES } from '../data/games.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="logo" aria-label="PlayVerse home">
            <Logo size={24} />
            <span>
              Play<em>Verse</em>
            </span>
          </Link>
          <p>
            A responsive HTML5 gaming platform with original arcade, puzzle and memory games - playable in the
            browser and on Android.
          </p>
        </div>
        <div>
          <h4>Games</h4>
          <ul>
            <li><Link to="/popular">Popular games</Link></li>
            <li><Link to="/new">New releases</Link></li>
            <li><Link to="/categories">All categories</Link></li>
            <li><Link to="/recently-played">Recently played</Link></li>
          </ul>
        </div>
        <div>
          <h4>Categories</h4>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to={`/category/${c.slug}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>PlayVerse</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/help">Help</Link></li>
            <li><Link to="/accessibility">Accessibility</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
            <li><Link to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 PlayVerse. Game on.</span>
        <span>Built with React · Packaged for Android with Capacitor</span>
      </div>
    </footer>
  );
}
