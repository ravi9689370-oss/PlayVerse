import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import GameGrid from '../components/GameGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { searchGames, CATEGORIES } from '../data/games.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function SearchPage() {
  useDocumentTitle('Search - PlayVerse');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const results = searchGames(q);

  const setQuery = (value) => {
    const v = (value || '').trim();
    setParams(v ? { q: v } : {});
  };

  return (
    <>
      <div className="page-head">
        <h1>🔍 Search</h1>
        <p>Find games by title, category or description.</p>
      </div>

      <div style={{ maxWidth: 560, marginBottom: 24 }}>
        <SearchBar onSubmit={setQuery} initialQuery={q} />
      </div>

      {!q.trim() ? (
        <EmptyState icon="⌨️" title="What are you playing today?">
          Type a game name above, or explore a category:{' '}
          {CATEGORIES.map((c, i) => (
            <React.Fragment key={c.slug}>
              {i > 0 && ', '}
              <Link to={`/category/${c.slug}`}>{c.label}</Link>
            </React.Fragment>
          ))}
          .
        </EmptyState>
      ) : results.length === 0 ? (
        <EmptyState icon="🕵️" title={`No results for "${q}"`}>
          Try a different name or browse <Link to="/popular">popular games</Link> and{' '}
          <Link to="/categories">categories</Link>.
        </EmptyState>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
            {results.length} result{results.length === 1 ? '' : 's'} for <b>{q}</b>
          </p>
          <GameGrid games={results} />
        </>
      )}
    </>
  );
}
