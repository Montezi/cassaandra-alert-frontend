import type { DominantClass } from '../lib/hotspotSchema';

/** Stroke icons (24×24 grid). Paths come from the design prototype. */
export const ICON_PATHS = {
  flood:
    'M3 9c2 0 2-2 4.5-2S10 9 12 9s2-2 4.5-2S19 9 21 9M3 15c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2',
  drought: 'M3 20h18M7 20l3-5-2-3 3-4M14 20l2-4-2-2 2-3M12 3v1M5 6l1 1M19 6l-1 1',
  fire: 'M12 21c-4 0-6-2.7-6-6 0-4 4-6 4-10 2 1.5 3 3 3 5 1-1 1.5-2 1.5-3 2 1.5 3.5 4.5 3.5 8 0 3.3-2 6-6 6z',
  deformation: 'M12 3 3 7.5 12 12l9-4.5L12 3zM3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5',
  stable: 'M6 12h12',
  moisture: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  people:
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2.4.6 4 2.6 4 6',
  health: 'M4 21V7l8-4 8 4v14M9 21v-5h6v5M12 8v5M9.5 10.5h5',
  school: 'M4 6h7a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H4zM20 6h-7a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h7z',
  roads: 'M8 3 4 21M16 3l4 18M12 4v3M12 10v3M12 16v3',
  boat: 'M3 17l2 4h14l2-4H3zM12 3v14M12 4l6 9H12',
  homes: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5',
  power: 'M13 2 4 14h7l-1 8 9-12h-7l1-8z',
  shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  warning: 'M12 3 2 20h20L12 3zM12 10v4M12 17v.01',
  close: 'M6 6l12 12M18 6 6 18',
  expand: 'M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  source: 'M4 5h16v14H4zM8 9h8M8 13h5',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
  download: 'M12 3v12M7 10l5 5 5-5M4 20h16',
  send: 'M4 12 20 4l-6 16-3-7-7-1z',
  tool: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  wave: 'M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 3.5-4 5-2',
  tree: 'M12 3 6 12h4l-4 6h12l-4-6h4L12 3zM12 18v3',
  layers: 'M12 3 2 8l10 5 10-5-10-5zM2 13l10 5 10-5',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
} as const;

export type IconName = keyof typeof ICON_PATHS;

export const CLASS_ICON: Record<DominantClass, IconName> = {
  flood: 'flood',
  drought: 'drought',
  fire_deforestation: 'fire',
  deformation: 'deformation',
  stable: 'stable',
};
