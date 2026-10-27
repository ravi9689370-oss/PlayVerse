// localStorage-backed favorites and play history.
// Wrapped in try/catch so private-mode or blocked storage degrades gracefully.

const FAV_KEY = 'playverse.favorites';
const RECENT_KEY = 'playverse.recent';
const MAX_RECENT = 20;

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function emit(event, detail) {
  try {
    window.dispatchEvent(new CustomEvent(event, { detail }));
  } catch {
    /* ignore */
  }
}

export const store = {
  // ----- favorites -----
  getFavorites() {
    return readList(FAV_KEY); // array of slugs
  },
  isFavorite(slug) {
    return readList(FAV_KEY).includes(slug);
  },
  toggleFavorite(slug) {
    const list = readList(FAV_KEY);
    const idx = list.indexOf(slug);
    const nowFav = idx === -1;
    const next = nowFav ? [...list, slug] : list.filter((s) => s !== slug);
    writeList(FAV_KEY, next);
    emit('playverse:favorites-changed', next);
    return nowFav;
  },

  // ----- recently played -----
  getRecent() {
    return readList(RECENT_KEY); // [{ slug, at }]
  },
  recordPlayed(slug) {
    const at = Date.now();
    const list = readList(RECENT_KEY).filter((r) => r.slug !== slug);
    list.unshift({ slug, at });
    writeList(RECENT_KEY, list.slice(0, MAX_RECENT));
    emit('playverse:recent-changed', list.slice(0, MAX_RECENT));
  },
  clearRecent() {
    writeList(RECENT_KEY, []);
    emit('playverse:recent-changed', []);
  },

  // ----- per-game best scores -----
  getBest(key) {
    const raw = readList('playverse.best');
    const val = raw.find((r) => r && r.key === key);
    return val ? val.value : null;
  },
  setBest(key, value) {
    // value should be a "better" score per the caller's comparison
    const list = readList('playverse.best').filter((r) => r && r.key !== key);
    list.push({ key, value });
    writeList('playverse.best', list);
  },
};
