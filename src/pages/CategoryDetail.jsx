import React from 'react';
import { Link, useParams } from 'react-router-dom';
import GameGrid from '../components/GameGrid.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getCategory, gamesInCategory, CATEGORIES } from '../data/games.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function CategoryDetail() {
  const { slug } = useParams();
  const cat = getCategory(slug);
  useDocumentTitle(cat ? `${cat.label} Games - PlayVerse` : 'Category not found - PlayVerse');

  if (!cat) {
    return (
      <EmptyState icon="🤔" title="No such category">
        We could not find the category “{slug}”. Browse all{' '}
        <Link to="/categories">categories</Link> instead.
      </EmptyState>
    );
  }

  const games = gamesInCategory(slug);
  const others = CATEGORIES.filter((c) => c.slug !== slug);

  return (
    <>
      <div className="chip-row" aria-label="Other categories">
        {others.map((c) => (
          <Link key={c.slug} to={`/category/${c.slug}`} className="chip">
            <span aria-hidden="true">{c.icon}</span> {c.label}
          </Link>
        ))}
      </div>
      <div className="page-head">
        <h1>
          {cat.icon} {cat.label} Games
        </h1>
        <p>{cat.blurb}</p>
      </div>
      <GameGrid
        games={games}
        emptyMessage={
          <EmptyState icon="🚧" title="Nothing here yet">
            No published games in this category yet - check <Link to="/new">new releases</Link>.
          </EmptyState>
        }
      />
    </>
  );
}
