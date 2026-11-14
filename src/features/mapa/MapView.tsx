import 'maplibre-gl/dist/maplibre-gl.css';
import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import { prefersReducedMotion } from '../../shared/lib/motion';
import { useTheme } from '../../shared/theme/theme';
import { BASEMAP_STYLES } from './basemap';
import { HotspotMarker } from './HotspotMarker';
import { fitHotspot, fitWorld, type Overlay, setOverlay, WORLD_BOUNDS } from './hotspotLayers';
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
  /** Hotspots to draw (already filtered by the lenses). */
  hotspots: Hotspot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Frame the selected hotspot on load (it came from a shared link). */
  fitOnLoad: boolean;
  overlay: Overlay | null;
};

/** A neighbor close on the right would cover this label: put it on the left. */
function labelGoesLeft(hotspot: Hotspot, all: Hotspot[]): boolean {
  const [lon, lat] = hotspot.geometry.coordinates;
  return all.some(
    ({
      geometry: {
        coordinates: [otherLon, otherLat],
      },
    }) => {
      const dx = otherLon - lon;
      return dx > 0 && dx < 30 && Math.abs(otherLat - lat) < 12;
    },
  );
}

/** World map with one marker per hotspot. Loaded on demand (React.lazy). */
export default function MapView({
  hotspots,
  selectedId,
  onSelect,
  fitOnLoad,
  overlay,
}: MapViewProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const styleUrlRef = useRef<string | null>(null);
  const lastSelectedRef = useRef(selectedId);
  const [failed, setFailed] = useState(false);

  // One element per hotspot; MapLibre positions it, React renders into it.
  const markerElements = useMemo(
    () => new Map(hotspots.map((h) => [h.properties.id, document.createElement('div')])),
    [hotspots],
  );

  const initialOptions = useEffectEvent(() => ({
    style: BASEMAP_STYLES[theme],
    locale: {
      'Map.Title': t('map.label'),
      'NavigationControl.ZoomIn': t('map.zoomIn'),
      'NavigationControl.ZoomOut': t('map.zoomOut'),
      'AttributionControl.ToggleAttribution': t('map.toggleAttribution'),
    },
  }));
  const onStyleLoad = useEffectEvent((map: MapLibreMap) => setOverlay(map, overlay));
  const onFirstLoad = useEffectEvent((map: MapLibreMap) => {
    const selected = hotspots.find((h) => h.properties.id === selectedId);
    if (fitOnLoad && selected) fitHotspot(map, selected, false);
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
        bounds: WORLD_BOUNDS,
        fitBoundsOptions: { padding: 24 },
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
    map.on('style.load', () => onStyleLoad(map));
    map.once('load', () => onFirstLoad(map));
    map.on('error', (event) => console.error('Map error:', event.error));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Place the markers. They are DOM elements, so a basemap change keeps them.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = hotspots.flatMap((h) => {
      const element = markerElements.get(h.properties.id);
      if (!element) return [];
      return [new Marker({ element }).setLngLat(h.geometry.coordinates).addTo(map)];
    });
    return () => markers.forEach((marker) => marker.remove());
  }, [hotspots, markerElements]);

  // The selected marker stays above its neighbors.
  useEffect(() => {
    markerElements.forEach((element, id) => {
      element.style.zIndex = id === selectedId ? '2' : '1';
    });
  }, [markerElements, selectedId]);

  // Switch the basemap with the theme. diff: false forces a full reload, so
  // 'style.load' fires and the overlay is added again.
  useEffect(() => {
    const map = mapRef.current;
    const url = BASEMAP_STYLES[theme];
    if (!map || styleUrlRef.current === url) return;
    styleUrlRef.current = url;
    map.setStyle(url, { diff: false });
  }, [theme]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) setOverlay(map, overlay);
  }, [overlay]);

  // Frame a hotspot when the user picks one (not on the first render).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lastSelectedRef.current === selectedId) return;
    lastSelectedRef.current = selectedId;
    const selected = hotspots.find((h) => h.properties.id === selectedId);
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
  return (
    <>
      <div ref={containerRef} className={styles.map} />
      <button
        type="button"
        className={styles.worldButton}
        onClick={() => {
          if (mapRef.current) fitWorld(mapRef.current, !prefersReducedMotion());
        }}
      >
        {t('map.worldView')}
      </button>
      {hotspots.map((h) => {
        const element = markerElements.get(h.properties.id);
        return element
          ? createPortal(
              <HotspotMarker
                hotspot={h.properties}
                selected={h.properties.id === selectedId}
                labelLeft={labelGoesLeft(h, hotspots)}
                onSelect={onSelect}
              />,
              element,
              h.properties.id,
            )
          : null;
      })}
    </>
  );
}
