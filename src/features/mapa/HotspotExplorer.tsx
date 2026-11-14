import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useUrlParam } from '../../shared/lib/urlState';
import { Button } from '../../shared/ui/Button';
import styles from './HotspotExplorer.module.css';
import { HotspotList } from './HotspotList';
import { MapUnavailable } from './MapUnavailable';
import { useHotspots } from './useHotspots';

// MapLibre is ~1 MB, so it loads in its own chunk: on slow 4G the header and
// the hotspot list show up first. If the chunk fails to download, the list
// keeps working and the map area explains what happened.
const MapView = lazy(() =>
  import('./MapView').catch((error: unknown) => {
    console.error('Map code failed to load:', error);
    return { default: MapUnavailable };
  }),
);

/** Map + hotspot list. The selected hotspot lives in the URL (?hotspot=id). */
export function HotspotExplorer() {
  const { t } = useTranslation();
  const { state, retry } = useHotspots();
  const [hotspotParam, setHotspotParam] = useUrlParam('hotspot');

  if (state.status === 'loading') {
    return (
      <p role="status" className={styles.message}>
        {t('hotspots.loading')}
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className={styles.message}>
        <p>{t('hotspots.error')}</p>
        <Button onClick={retry}>{t('hotspots.retry')}</Button>
      </div>
    );
  }

  const hotspots = state.data;
  // Ignore ids in the URL that do not exist (old or mistyped links).
  const selectedId = hotspots.features.some((f) => f.properties.id === hotspotParam)
    ? hotspotParam
    : null;

  return (
    <div className={styles.explorer}>
      <div className={styles.mapArea}>
        <Suspense
          fallback={
            <p role="status" className={styles.message}>
              {t('map.loading')}
            </p>
          }
        >
          <MapView hotspots={hotspots} selectedId={selectedId} onSelect={setHotspotParam} />
        </Suspense>
      </div>
      <HotspotList hotspots={hotspots} selectedId={selectedId} onSelect={setHotspotParam} />
    </div>
  );
}
