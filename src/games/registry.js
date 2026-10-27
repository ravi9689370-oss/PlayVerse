import { lazy } from 'react';

/** Maps catalog componentKey -> lazily loaded playable game component. */
export const GAME_COMPONENTS = {
  CosmoMatch: lazy(() => import('./CosmoMatch.jsx')),
  NeonBreaker: lazy(() => import('./NeonBreaker.jsx')),
  AstroDodge: lazy(() => import('./AstroDodge.jsx')),
  TileBlitz: lazy(() => import('./TileBlitz.jsx')),
  TicTacGlow: lazy(() => import('./TicTacGlow.jsx')),
  TapRush: lazy(() => import('./TapRush.jsx')),
};
