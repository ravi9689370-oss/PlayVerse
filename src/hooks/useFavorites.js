import { useCallback, useEffect, useState } from 'react';
import { store } from '../utils/storage.js';

/** Subscribes to the favorites list so badges stay in sync across pages. */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => store.getFavorites());

  useEffect(() => {
    const onChange = () => setFavorites(store.getFavorites());
    window.addEventListener('playverse:favorites-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('playverse:favorites-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const toggle = useCallback((slug) => store.toggleFavorite(slug), []);
  return { favorites, toggle, isFavorite: (slug) => favorites.includes(slug) };
}

export function useRecent() {
  const [recent, setRecent] = useState(() => store.getRecent());

  useEffect(() => {
    const onChange = () => setRecent(store.getRecent());
    window.addEventListener('playverse:recent-changed', onChange);
    return () => window.removeEventListener('playverse:recent-changed', onChange);
  }, []);

  return recent;
}
