import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Accessibility() {
  useDocumentTitle('Accessibility - PlayVerse');

  return (
    <div className="content-page">
      <div className="page-head">
        <h1>♿ Accessibility</h1>
        <p>Our goal: everyone can play.</p>
      </div>
      <div className="prose">
        <h2>Built-in features</h2>
        <ul>
          <li><b>Keyboard support.</b> All navigation is reachable by keyboard. Memory cards are focusable buttons; Tile Blitz and Tic-Tac Glow respond to Arrow keys / buttons; every game control has a visible focus ring.</li>
          <li><b>Skip link.</b> Press Tab on any page to jump straight to the main content.</li>
          <li><b>Clear states.</b> Loading, empty and error states are announced with aria-live where relevant.</li>
          <li><b>Reduced motion.</b> The interface respects your OS "reduce motion" preference by disabling animations.</li>
          <li><b>Contrast.</b> Text on PlayVerse is designed for WCAG AA contrast on its dark theme.</li>
          <li><b>Descriptive labels.</b> Icon-only buttons (hearts, search, menu) have aria-labels.</li>
        </ul>

        <h2>Known limitations</h2>
        <ul>
          <li>Canvas-based games (Neon Breaker, Astro Dodge) are primarily pointer/keyboard driven; full canvas accessibility remains future work.</li>
          <li>Some audio cues have no visual alternative yet.</li>
        </ul>

        <h2>Feedback</h2>
        <p>
          Accessibility issues are treated as bugs. Report them via the GitHub repository and include the page,
          assistive technology and what you expected.
        </p>
        <p>Related pages: <Link to="/help">Help</Link> · <Link to="/faq">FAQ</Link></p>
      </div>
    </div>
  );
}
