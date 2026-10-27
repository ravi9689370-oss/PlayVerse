import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from './SearchIcon.jsx';

/** Shared search input used in the navbar, mobile row and the search page. */
export default function SearchBar({ onSubmit, initialQuery = '', inputRef }) {
  const [value, setValue] = useState(initialQuery);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    onSubmit ? onSubmit(value) : navigate(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search');
  };

  return (
    <form className="searchbar" role="search" onSubmit={submit} ref={inputRef}>
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What are you playing today?"
        aria-label="Search games"
        enterKeyHint="search"
      />
      {value && (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={() => setValue('')}>
          ✕
        </button>
      )}
    </form>
  );
}
