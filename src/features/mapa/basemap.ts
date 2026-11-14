import type { Theme } from '../../shared/theme/theme';

/**
 * Basemap styles from OpenFreeMap: free, no API key, OpenStreetMap data.
 *
 * These are the only full URLs in the app. Third-party tiles cannot be served
 * from our domain (ADR-003); our own data and APIs always use relative paths
 * (/dados, /api).
 */
export const BASEMAP_STYLES: Record<Theme, string> = {
  claro: 'https://tiles.openfreemap.org/styles/positron',
  escuro: 'https://tiles.openfreemap.org/styles/dark',
};
