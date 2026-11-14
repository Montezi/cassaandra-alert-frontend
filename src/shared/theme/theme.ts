import { useSyncExternalStore } from 'react';

/** Values of `data-theme` on <html>, as defined in CLAUDE.md. */
export type Theme = 'claro' | 'escuro';

/** Keep in sync with the inline script in index.html. */
const STORAGE_KEY = 'cassaandra.theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const listeners = new Set<() => void>();

function isTheme(value: unknown): value is Theme {
  return value === 'claro' || value === 'escuro';
}

function readStoredTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isTheme(saved) ? saved : null;
  } catch {
    return null; // Storage blocked (private mode).
  }
}

function systemTheme(): Theme {
  return window.matchMedia(DARK_QUERY).matches ? 'escuro' : 'claro';
}

/** The theme currently on <html>. The inline script in index.html sets it first. */
export function getTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : 'claro';
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  listeners.forEach((notify) => notify());
}

/** Applies the user's choice and remembers it for the next visits. */
export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice lasts until the tab closes.
  }
  applyTheme(theme);
}

// Until the user chooses, follow the operating system (also when it changes).
window.matchMedia(DARK_QUERY).addEventListener('change', () => {
  if (readStoredTheme() === null) applyTheme(systemTheme());
});

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Current theme, re-rendering the component when it changes. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme);
}
