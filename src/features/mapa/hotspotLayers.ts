import type { ImageSource, Map as MapLibreMap } from 'maplibre-gl';
import type { Hotspot } from '../../shared/lib/hotspotSchema';

/** MapLibre helpers: framing a hotspot and the radar overlay (ADR-003). */

const OVERLAY_SOURCE_ID = 'radar-overlay';
const OVERLAY_LAYER_ID = 'radar-overlay';

export type Overlay = { url: string; bbox: Hotspot['properties']['bbox'] };

export function fitHotspot(map: MapLibreMap, hotspot: Hotspot, animate: boolean): void {
  map.fitBounds(hotspot.properties.bbox, { padding: 48, maxZoom: 9, animate });
}

/** From California to Borneo, with room for the labels: the first view. */
export const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-135, -40],
  [150, 50],
];

/** Whole set of hotspots, as on first load. */
export function fitWorld(map: MapLibreMap, animate: boolean): void {
  map.fitBounds(WORLD_BOUNDS, { padding: 24, animate });
}

/**
 * Shows one PNG from the pipeline over its bounding box, or removes it.
 * Call again on every 'style.load': changing the basemap removes layers.
 */
export function setOverlay(map: MapLibreMap, overlay: Overlay | null): void {
  if (map.getLayer(OVERLAY_LAYER_ID)) map.removeLayer(OVERLAY_LAYER_ID);
  if (!overlay) {
    if (map.getSource(OVERLAY_SOURCE_ID)) map.removeSource(OVERLAY_SOURCE_ID);
    return;
  }
  const [west, south, east, north] = overlay.bbox;
  const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
    [west, north],
    [east, north],
    [east, south],
    [west, south],
  ];
  const source = map.getSource<ImageSource>(OVERLAY_SOURCE_ID);
  if (source) {
    source.updateImage({ url: overlay.url, coordinates });
  } else {
    map.addSource(OVERLAY_SOURCE_ID, { type: 'image', url: overlay.url, coordinates });
  }
  map.addLayer({
    id: OVERLAY_LAYER_ID,
    type: 'raster',
    source: OVERLAY_SOURCE_ID,
    paint: { 'raster-opacity': 0.85 },
  });
}
