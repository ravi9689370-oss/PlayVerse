import React from 'react';

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="skeleton-grid" style={{ marginTop: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export function GameGridSkeleton({ count = 8 }) {
  return (
    <div className="skeleton-grid" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  );
}
