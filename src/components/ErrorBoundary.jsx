import React from 'react';

/** Catches render errors anywhere below it and shows a friendly recovery screen. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Could be wired to a reporting endpoint; kept local on purpose.
    console.error('PlayVerse render error:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-box" role="alert">
          <h2>Something glitched in the Verse</h2>
          <p>The page hit an unexpected error. Reloading usually fixes it.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload PlayVerse
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
