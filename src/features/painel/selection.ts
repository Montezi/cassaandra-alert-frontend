import type { HotspotStats, SceneKey } from '../../shared/lib/statsSchema';

export const SENSORS = ['nisar', 'sentinel1', 'sentinel2'] as const;
export type Sensor = (typeof SENSORS)[number];

export const POLARIZATIONS = ['hh', 'hv', 'rgb'] as const;
export type Polarization = (typeof POLARIZATIONS)[number];

export function isPolarization(value: string | null): value is Polarization {
  return value === 'hh' || value === 'hv' || value === 'rgb';
}

/** The pass shown in the panel: the one in the URL (?date=) or the latest. */
export function selectedPass(stats: HotspotStats, dateParam: string | null) {
  const latest = stats.passes[stats.passes.length - 1];
  return stats.passes.find((p) => p.date === dateParam) ?? latest;
}

export function sceneKey(sensor: Sensor, pol: Polarization): SceneKey {
  return sensor === 'nisar' ? `nisar_${pol}` : sensor;
}

export type ScenePair = { before: string; after: string; afterDate: string };

/**
 * Before/after images for a sensor. NISAR uses the selected pass; the other
 * sensors have fewer dates, so they use their latest image.
 */
export function scenePair(
  stats: HotspotStats,
  sensor: Sensor,
  pol: Polarization,
  date: string,
): ScenePair | null {
  const scene = stats.scenes[sceneKey(sensor, pol)];
  if (!scene) return null;
  const dates = Object.keys(scene)
    .filter((key) => key !== 'baseline')
    .sort();
  const afterDate = sensor === 'nisar' && scene[date] ? date : dates[dates.length - 1];
  const after = afterDate ? scene[afterDate] : undefined;
  if (!afterDate || !after) return null;
  return { before: scene.baseline, after, afterDate };
}

/** Confidence level shown next to the percentage. */
export function confidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  return confidence >= 0.75 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';
}
