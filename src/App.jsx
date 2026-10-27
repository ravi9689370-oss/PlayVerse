import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { PageSkeleton } from './components/Loading.jsx';
import { useDocumentTitle } from './hooks/useDocumentTitle.js';

// Pages are code-split so the initial bundle stays small on mobile.
const Home = lazy(() => import('./pages/Home.jsx'));
const Popular = lazy(() => import('./pages/Popular.jsx'));
const NewReleases = lazy(() => import('./pages/NewReleases.jsx'));
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'));
const Categories = lazy(() => import('./pages/Categories.jsx'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail.jsx'));
const GameDetail = lazy(() => import('./pages/GameDetail.jsx'));
const Favorites = lazy(() => import('./pages/Favorites.jsx'));
const RecentlyPlayed = lazy(() => import('./pages/RecentlyPlayed.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Faq = lazy(() => import('./pages/Faq.jsx'));
const Help = lazy(() => import('./pages/Help.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Accessibility = lazy(() => import('./pages/Accessibility.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  useDocumentTitle('PlayVerse - Free Online Games');
  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">Skip to content</a>
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      <ScrollToTop />
      <main id="main" className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/new" element={<NewReleases />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:slug" element={<CategoryDetail />} />
              <Route path="/game/:slug" element={<GameDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/recently-played" element={<RecentlyPlayed />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/help" element={<Help />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
}
