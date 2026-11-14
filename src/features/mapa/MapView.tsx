import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapLibreMap, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HotspotCollection } from '../../shared/lib/hotspotSchema';
import { prefersReducedMotion } from '../../shared/lib/motion';
import { useTheme } from '../../shared/theme/theme';
import { BASEMAP_STYLES } from './basemap';
import {
  addHotspotLayers,
  fitHotspot,
  hasHotspotLayers,
  highlightHotspot,
  HOTSPOT_LAYER_ID,
  updateHotspotData,
} from './hotspotLayers';
import { MapUnavailable } from './MapUnavailable';
import styles from './MapView.module.css';

// MapLibre 6 looks for its worker next to its own file, which is not where
// Vite puts it after bundling. Point it to the file Vite emits instead.
setWorkerUrl(workerUrl);

/** MapLibre 6 needs WebGL2. Checked once, when this chunk loads. */
const SUPPORTS_WEBGL2 = document.createElement('canvas').getContext('webgl2') !== null;

/** Texts MapLibre puts on its controls, translated. Keys come from MapLibre. */
const CONTROL_LABELS = [
  ['.maplibregl-ctrl-zoom-in', 'map.zoomIn'],
  ['.maplibregl-ctrl-zoom-out', 'map.zoomOut'],
  ['.maplibregl-ctrl-attrib-button', 'map.toggleAttribution'],
] as const;

type MapViewProps = {
  hotspots: HotspotCollection;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/** World map with one marker per hotspot. Loaded on demand (React.lazy). */
export default function MapView({ hotspots, selectedId, onSelect }: MapViewProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const styleUrlRef = useRef<string | null>(null);
  const hasFittedRef = useRef(false);
  const [failed, setFailed] = useState(false);

  // Effect events read the latest props without re-creating the map.
  const selectHotspot = useEffectEvent((id: string) => onSelect(id));
  const initialOptions = useEffectEvent(() => ({
    style: BASEMAP_STYLES[theme],
    locale: {
      'Map.Title': t('map.label'),
      'NavigationControl.ZoomIn': t('map.zoomIn'),
      'NavigationControl.ZoomOut': t('map.zoomOut'),
      'AttributionControl.ToggleAttribution': t('map.toggleAttribution'),
    },
  }));
  const drawHotspots = useEffectEvent((map: MapLibreMap) => {
    addHotspotLayers(map, hotspots);
    highlightHotspot(map, selectedId);
    const selected = hotspots.features.find((f) => f.properties.id === selectedId);
    // Frame a hotspot from a shared link once; later style reloads keep the view.
    if (selected && !hasFittedRef.current) fitHotspot(map, selected, false);
    hasFittedRef.current = true;
  });

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = initialOptions();
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        ...options,
        center: [0, 10],
        zoom: 1,
        attributionControl: { compact: true },
      });
    } catch (error) {
      // E.g. the GPU refused a WebGL2 context. Without this catch the error
      // would unmount the whole app; the hotspot list keeps working.
      console.error('Map could not start:', error);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reports an external failure, at most once per mount.
      setFailed(true);
      return;
    }
    styleUrlRef.current = options.style;
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.on('style.load', () => drawHotspots(map));
    map.on('click', HOTSPOT_LAYER_ID, (event) => {
      const id: unknown = event.features?.[0]?.properties.id;
      if (typeof id === 'string') selectHotspot(id);
    });
    map.on('mouseenter', HOTSPOT_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', HOTSPOT_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('error', (event) => console.error('Map error:', event.error));

    return () => {
      map.remove();
      mapRef.current = null;
      hasFittedRef.current = false;
    };
  }, []);

  // Switch the basemap with the theme. diff: false forces a full reload, so
  // 'style.load' fires and the markers are drawn again with the new colors.
  useEffect(() => {
    const map = mapRef.current;
    const url = BASEMAP_STYLES[theme];
    if (!map || styleUrlRef.current === url) return;
    styleUrlRef.current = url;
    map.setStyle(url, { diff: false });
  }, [theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && hasHotspotLayers(map)) updateHotspotData(map, hotspots);
  }, [hotspots]);

  // Highlight and frame the selected hotspot.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasHotspotLayers(map)) return; // drawHotspots will do it.
    highlightHotspot(map, selectedId);
    const selected = hotspots.features.find((f) => f.properties.id === selectedId);
    if (selected) fitHotspot(map, selected, !prefersReducedMotion());
  }, [selectedId, hotspots]);

  // MapLibre only reads its texts when it creates the controls; update them
  // when the language changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().setAttribute('aria-label', t('map.label'));
    for (const [selector, key] of CONTROL_LABELS) {
      map
        .getContainer()
        .querySelectorAll(selector)
        .forEach((button) => {
          button.setAttribute('title', t(key));
          button.setAttribute('aria-label', t(key));
        });
    }
  }, [t, i18n.resolvedLanguage]);

  if (!SUPPORTS_WEBGL2 || failed) return <MapUnavailable />;
  return <div ref={containerRef} className={styles.map} />;
}
