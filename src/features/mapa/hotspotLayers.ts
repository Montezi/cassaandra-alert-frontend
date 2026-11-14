import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Hotspot, HotspotCollection } from '../../shared/lib/hotspotSchema';
import { readToken } from '../../shared/theme/readToken';

/** MapLibre helpers for the hotspot markers. Colors come from tokens.css. */

const SOURCE_ID = 'hotspots';
export const HOTSPOT_LAYER_ID = 'hotspots';
const SELECTED_LAYER_ID = 'hotspots-selected';

/** Adds the markers. Call on every 'style.load': changing the style removes them. */
export function addHotspotLayers(map: MapLibreMap, hotspots: HotspotCollection): void {
  const stroke = readToken('--color-map-hotspot-stroke');

  map.addSource(SOURCE_ID, { type: 'geojson', data: hotspots });
  map.addLayer({
    id: HOTSPOT_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-radius': 7,
      'circle-color': readToken('--color-map-hotspot'),
      'circle-stroke-width': 2,
      'circle-stroke-color': stroke,
    },
  });
  // The selected marker is bigger and has a thicker ring, not only a new color.
  map.addLayer({
    id: SELECTED_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['==', ['get', 'id'], ''],
    paint: {
      'circle-radius': 11,
      'circle-color': readToken('--color-map-hotspot-selected'),
      'circle-stroke-width': 3,
      'circle-stroke-color': stroke,
    },
  });
}

export function hasHotspotLayers(map: MapLibreMap): boolean {
  return map.getLayer(SELECTED_LAYER_ID) !== undefined;
}

export function updateHotspotData(map: MapLibreMap, hotspots: HotspotCollection): void {
  // setData returns a promise that resolves once the worker has the data; no need to wait.
  void map.getSource<GeoJSONSource>(SOURCE_ID)?.setData(hotspots);
}

export function highlightHotspot(map: MapLibreMap, id: string | null): void {
  map.setFilter(SELECTED_LAYER_ID, ['==', ['get', 'id'], id ?? '']);
}

export function fitHotspot(map: MapLibreMap, hotspot: Hotspot, animate: boolean): void {
  map.fitBounds(hotspot.properties.bbox, { padding: 40, maxZoom: 10, animate });
}
