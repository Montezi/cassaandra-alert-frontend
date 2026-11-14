import { useEffect, useState } from 'react';
import {
  type Forecast,
  forecastResponseSchema,
  forecastSnapshotSchema,
} from '../../shared/lib/forecastSchema';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import { loadData } from '../../shared/lib/useData';

/** Give up on /api/clima after this long and use the saved snapshot. */
const API_TIMEOUT_MS = 8000;

/** A forecast older than this never triggers an alert (CLAUDE.md rule 8). */
export const FORECAST_MAX_AGE_DAYS = 3;

export type ForecastState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; forecast: Forecast; viaSnapshotFile: boolean };

async function fromApi(hotspot: Hotspot, signal: AbortSignal): Promise<Forecast> {
  const [lon, lat] = hotspot.geometry.coordinates;
  const params = new URLSearchParams({
    hotspot: hotspot.properties.id,
    lat: String(lat),
    lon: String(lon),
  });
  const response = await fetch(`/api/clima?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`GET /api/clima failed with HTTP ${response.status}`);
  // While the service is still the placeholder container it answers HTML:
  // response.json() throws and we fall back to the snapshot below.
  const parsed = forecastResponseSchema.parse(await response.json());
  return { ...parsed, sample: false };
}

async function fromSnapshotFile(hotspotId: string): Promise<Forecast> {
  const snapshot = await loadData('forecast-snapshot.json', forecastSnapshotSchema);
  const days = snapshot.forecasts[hotspotId];
  if (!days) throw new Error(`forecast-snapshot.json has no forecast for ${hotspotId}`);
  return {
    source: 'snapshot',
    updated_at: snapshot.updated_at,
    days,
    sample: snapshot.metadata?.sample ?? false,
  };
}

/**
 * Rain forecast for a hotspot. The server already falls back from
 * Meteomatics to Open-Meteo to its saved snapshot (ADR-006). If the server
 * cannot be reached at all, the app reads the snapshot file in /dados.
 */
export function useForecast(hotspot: Hotspot): ForecastState {
  const id = hotspot.properties.id;
  const [result, setResult] = useState<{ id: string; state: ForecastState } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    let current = true;

    fromApi(hotspot, controller.signal)
      .then((forecast) => ({ forecast, viaSnapshotFile: false }))
      .catch(async (error: unknown) => {
        console.warn('Forecast API unavailable, using the saved snapshot:', error);
        return { forecast: await fromSnapshotFile(id), viaSnapshotFile: true };
      })
      .then(({ forecast, viaSnapshotFile }) => {
        if (current) setResult({ id, state: { status: 'ready', forecast, viaSnapshotFile } });
      })
      .catch((error: unknown) => {
        console.error(error);
        if (current) setResult({ id, state: { status: 'error' } });
      })
      .finally(() => window.clearTimeout(timer));

    return () => {
      current = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [hotspot, id]);

  return result?.id === id ? result.state : { status: 'loading' };
}

/** Total rain over the forecast days, in mm. */
export function totalRain(forecast: Forecast): number {
  return forecast.days.reduce((sum, day) => sum + day.precipitation_mm, 0);
}

/** True when the forecast is recent enough to support an alert. */
export function isFresh(forecast: Forecast, now = new Date()): boolean {
  const ageDays = (now.getTime() - new Date(forecast.updated_at).getTime()) / 86_400_000;
  return ageDays <= FORECAST_MAX_AGE_DAYS;
}
