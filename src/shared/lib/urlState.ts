import { useCallback, useSyncExternalStore } from 'react';

/**
 * State that must survive a shared link (hotspot, date, lens, polarization,
 * language) lives in the URL query string: `/?hotspot=guaiba-rs&lang=en`.
 */

const URL_CHANGE_EVENT = 'cassaandra:urlchange';

export function getUrlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

/** Updates one query parameter without reloading or adding a history entry. */
export function setUrlParam(name: string, value: string | null): void {
  const url = new URL(window.location.href);
  if (value === null) {
    url.searchParams.delete(name);
  } else {
    url.searchParams.set(name, value);
  }
  window.history.replaceState(window.history.state, '', url);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(URL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(URL_CHANGE_EVENT, onChange);
  };
}

/** Like useState, but the value is a URL query parameter. */
export function useUrlParam(name: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(subscribe, () => getUrlParam(name));
  const setValue = useCallback((next: string | null) => setUrlParam(name, next), [name]);
  return [value, setValue];
}

/** Current path ("/" or "/app"); re-renders when it changes. */
export function usePathname(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/**
 * Goes to another page of the app without reloading. `to` may carry a query
 * string ("/app?hotspot=guaiba-rs"). Adds a history entry, so Back works.
 */
export function navigate(to: string): void {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
  window.scrollTo(0, 0);
}
