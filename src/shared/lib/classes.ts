import type { DominantClass } from './hotspotSchema';

/** The three lenses that switch markers on the map (CLAUDE.md: lentes). */
export const LENSES = ['flood', 'drought', 'fire_deforestation'] as const;
export type Lens = (typeof LENSES)[number];

/** Suffix of the --color-class-* tokens for each class. */
export const CLASS_TOKEN: Record<DominantClass, string> = {
  flood: 'flood',
  drought: 'drought',
  fire_deforestation: 'fire',
  deformation: 'deformation',
  stable: 'stable',
};

/** Inline style that exposes the class colors to CSS as --class, --class-ink, --class-soft. */
export function classStyle(cls: DominantClass | null): Record<string, string> {
  const token = CLASS_TOKEN[cls ?? 'stable'];
  return {
    '--class': `var(--color-class-${token})`,
    '--class-ink': `var(--color-class-${token}-ink)`,
    '--class-soft': `var(--color-class-${token}-soft)`,
  };
}

export function isLens(value: string): value is Lens {
  return (LENSES as readonly string[]).includes(value);
}

/**
 * Active lenses from the URL (`?lenses=flood,drought`). Missing means all on;
 * "none" means all off, so a link can also share an empty map.
 */
export function parseLenses(param: string | null): Lens[] {
  if (param === null) return [...LENSES];
  if (param === 'none') return [];
  return param.split(',').filter(isLens);
}

export function serializeLenses(lenses: Lens[]): string | null {
  if (lenses.length === LENSES.length) return null;
  if (lenses.length === 0) return 'none';
  return LENSES.filter((lens) => lenses.includes(lens)).join(',');
}

/** Map lenses filter by dominant class; deformation and stable stay visible. */
export function isVisible(cls: DominantClass | null, lenses: Lens[]): boolean {
  if (cls === null || cls === 'deformation' || cls === 'stable') return true;
  return lenses.includes(cls);
}
