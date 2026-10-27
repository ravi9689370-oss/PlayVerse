import React from 'react';

/** Original PlayVerse logo mark: a rounded "play" triangle inside a hex-ish orbit. */
export default function Logo({ size = 28 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="pvLogoGrad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="9" fill="url(#pvLogoGrad)" />
      <path d="M13 10.5v11l9-5.5-9-5.5z" fill="#0a0a18" />
      <circle cx="10" cy="24" r="1.6" fill="#0a0a18" opacity="0.85" />
      <circle cx="24" cy="8.5" r="1.3" fill="#0a0a18" opacity="0.7" />
    </svg>
  );
}
