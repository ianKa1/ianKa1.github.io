import { useCallback, useSyncExternalStore } from 'react';
import { formatHash, parseHash, type RouteState } from './route';

/**
 * Subscribe React to the browser `hashchange` event. `useSyncExternalStore`
 * keeps the returned route in lockstep with `window.location.hash`, so
 * back/forward and manual URL edits both trigger re-renders.
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

function getSnapshot(): string {
  return window.location.hash;
}

// SSR safety net — the app renders in the browser only, but Vite may still
// evaluate this during pre-bundling. Returning an empty hash keeps the
// initial parse deterministic (`entry`).
function getServerSnapshot(): string {
  return '';
}

/**
 * Read-and-write hook for the current URL hash route.
 *
 * - `route`     — parsed `RouteState`, kept in sync with the URL.
 * - `navigate`  — replace the hash with a new state. Uses `history.pushState`
 *                 so back/forward step through navigation history.
 * - `replace`   — like `navigate` but replaces the current history entry
 *                 (used on first mount to normalize `""` → `#/`).
 */
export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const route = parseHash(hash);

  const navigate = useCallback((next: RouteState) => {
    const nextHash = formatHash(next);
    if (nextHash === window.location.hash) return;
    // Using `history.pushState` + manual dispatch keeps the same behavior as
    // setting `location.hash` (which also updates history) but avoids the
    // browser scrolling to a `#id` element that happens to match.
    window.history.pushState(null, '', nextHash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  const replace = useCallback((next: RouteState) => {
    const nextHash = formatHash(next);
    if (nextHash === window.location.hash) return;
    window.history.replaceState(null, '', nextHash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }, []);

  return { route, navigate, replace };
}
