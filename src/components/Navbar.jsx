import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import SearchBar from './SearchBar.jsx';
import { useFavorites, useRecent } from '../hooks/useFavorites.js';

const NAV_ITEMS = [
  { to: '/popular', label: 'Popular' },
  { to: '/new', label: 'New' },
  { to: '/categories', label: 'Categories' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { favorites } = useFavorites();
  const recent = useRecent();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Close overlays when the route changes.
  useEffect(() => {
    const onPop = () => {
      setMenuOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.querySelector('input')?.focus();
    }
  }, [searchOpen]);

  const submitSearch = (q) => {
    const query = (q || '').trim();
    setMenuOpen(false);
    setSearchOpen(false);
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" aria-label="PlayVerse home">
          <Logo />
          <span>
            Play<em>Verse</em>
          </span>
        </Link>

        <div className="nav-search">
          <SearchBar onSubmit={submitSearch} />
        </div>

        <button
          className="nav-search-btn"
          aria-expanded={searchOpen}
          aria-label="Open search"
          onClick={() => {
            setSearchOpen((v) => !v);
            setMenuOpen(false);
          }}
        >
          🔍
        </button>

        <nav className="nav-links" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to="/favorites" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Favorites
            {favorites.length > 0 && <span className="nav-badge">{favorites.length}</span>}
          </NavLink>
          <NavLink to="/recently-played" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Recently played
            {recent.length > 0 && <span className="nav-badge">{recent.length}</span>}
          </NavLink>
        </nav>

        <button
          className="nav-burger"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          onClick={() => {
            setMenuOpen((v) => !v);
            setSearchOpen(false);
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`mobile-search-row${searchOpen ? ' open' : ''}`}>
        <SearchBar onSubmit={submitSearch} inputRef={searchInputRef} />
      </div>

      <nav className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-label="Mobile">
        {[...NAV_ITEMS, { to: '/favorites', label: `Favorites${favorites.length ? ` (${favorites.length})` : ''}` }, { to: '/recently-played', label: 'Recently played' }].map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setMenuOpen(false)}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
