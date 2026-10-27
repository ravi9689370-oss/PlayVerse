import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '🕹️', title, children, ctaTo, ctaLabel }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <h2>{title}</h2>
      <p>{children}</p>
      {ctaTo && ctaLabel && (
        <Link to={ctaTo} className="btn btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
