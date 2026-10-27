import React from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Terms() {
  useDocumentTitle('Terms of Use - PlayVerse');

  return (
    <div className="content-page">
      <div className="page-head">
        <h1>📜 Terms of Use</h1>
        <p>Last updated: October 24, 2026</p>
      </div>
      <div className="prose">
        <h2>1. Acceptance</h2>
        <p>
          By using the PlayVerse website or Android application you agree to these terms. If you do not agree,
          please do not use the platform.
        </p>

        <h2>2. License to play</h2>
        <p>
          PlayVerse grants you a personal, non-exclusive, revocable license to play the games for personal,
          non-commercial entertainment. You may not resell, sublicense or commercially redistribute the games.
        </p>

        <h2>3. Intellectual property</h2>
        <p>
          The PlayVerse name, logo, game code, artwork and site design are original works. Source code is
          available under its repository license; all other rights are reserved by their creators.
        </p>

        <h2>4. Acceptable use</h2>
        <ul>
          <li>Do not attempt to disrupt, overload or reverse the platform's availability.</li>
          <li>Do not use automated tools to abuse the service.</li>
          <li>Do not misrepresent the origin of PlayVerse games or content.</li>
        </ul>

        <h2>5. Availability</h2>
        <p>
          The platform is provided "as is" and "as available". Games may be added, changed or retired at any
          time. Entries marked "Coming soon" are not yet playable and no availability date is guaranteed.
        </p>

        <h2>6. Disclaimer &amp; liability</h2>
        <p>
          To the maximum extent permitted by law, PlayVerse is provided without warranties of any kind, and its
          operators are not liable for any indirect or consequential damages arising from its use.
        </p>

        <h2>7. Third-party platforms</h2>
        <p>
          PlayVerse links only to its own pages and repository. Any future third-party game integrations will be
          authorized and disclosed here before launch.
        </p>

        <h2>8. Contact</h2>
        <p>Questions about these terms? See the <Link to="/help">help center</Link> or the GitHub repository.</p>
      </div>
    </div>
  );
}
