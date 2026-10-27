import { useEffect } from 'react';

/** Sets the browser tab title and restores a default on unmount. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
    return () => {
      document.title = 'PlayVerse - Free Online Games';
    };
  }, [title]);
}
