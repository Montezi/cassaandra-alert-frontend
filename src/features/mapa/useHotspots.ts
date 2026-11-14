import { useCallback, useEffect, useState } from 'react';
import { fetchData } from '../../shared/lib/data';
import { type HotspotCollection, hotspotCollectionSchema } from '../../shared/lib/hotspotSchema';

export type HotspotsState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: HotspotCollection };

/** Loads and validates /dados/hotspots.geojson. `retry` tries again after an error. */
export function useHotspots(): { state: HotspotsState; retry: () => void } {
  const [state, setState] = useState<HotspotsState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchData('hotspots.geojson', hotspotCollectionSchema, controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error); // Lists the fields that broke the data contract.
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
