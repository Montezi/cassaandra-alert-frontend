import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Lens, isVisible, parseLenses, serializeLenses } from '../../shared/lib/classes';
import { useUrlParam } from '../../shared/lib/urlState';
import { Button } from '../../shared/ui/Button';
import { HotspotPanel, type PanelTab } from '../painel/HotspotPanel';
import styles from './HotspotExplorer.module.css';
import { Legend } from './Legend';
import { MapUnavailable } from './MapUnavailable';
import { Rail } from './Rail';
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

/** Opened when the link has no ?hotspot=: the team's first hotspot. */
const DEFAULT_HOTSPOT = 'guaiba-rs';

/**
 * The map page: rail (lenses + list), map and the hotspot panel.
 * Shared state lives in the URL: ?hotspot=guaiba-rs&lenses=flood,drought
 */
export function HotspotExplorer() {
  const { t } = useTranslation();
  const { state, retry } = useHotspots();
  const [hotspotParam, setHotspotParam] = useUrlParam('hotspot');
  const [lensesParam, setLensesParam] = useUrlParam('lenses');
  const [panelClosed, setPanelClosed] = useState(false);
  const [tab, setTab] = useState<PanelTab>('panel');
  // Read once: did the page open from a link that names a hotspot?
  const [openedWithHotspot] = useState(() => hotspotParam !== null);

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
  const features = hotspots.features;
  const lenses = parseLenses(lensesParam);
  // Ignore ids in the URL that do not exist (old or mistyped links).
  const fromUrl = features.find((f) => f.properties.id === hotspotParam);
  const fallback = features.find((f) => f.properties.id === DEFAULT_HOTSPOT) ?? features[0];
  const selected = panelClosed ? undefined : (fromUrl ?? fallback);
  const visible = features.filter((f) => isVisible(f.properties.dominant_class, lenses));

  function select(id: string) {
    setPanelClosed(false);
    setHotspotParam(id);
  }

  function toggleLens(lens: Lens) {
    const next = lenses.includes(lens) ? lenses.filter((l) => l !== lens) : [...lenses, lens];
    setLensesParam(serializeLenses(next));
  }

  function openChat() {
    setPanelClosed(false);
    setTab('chat');
  }

  return (
    <div className={styles.explorer} data-panel={selected ? 'open' : 'closed'}>
      <Rail
        hotspots={hotspots}
        selectedId={selected?.properties.id ?? null}
        onSelect={select}
        lenses={lenses}
        onToggleLens={toggleLens}
        onAskCass={openChat}
      />
      <div className={styles.mapArea}>
        <Suspense
          fallback={
            <p role="status" className={styles.message}>
              {t('map.loading')}
            </p>
          }
        >
          <MapView
            hotspots={visible}
            selectedId={selected?.properties.id ?? null}
            onSelect={select}
            fitOnLoad={openedWithHotspot}
            overlay={null}
          />
        </Suspense>
        <Legend />
      </div>
      {selected && (
        <HotspotPanel
          key={selected.properties.id}
          hotspot={selected}
          allHotspots={hotspots}
          tab={tab}
          onTabChange={setTab}
          onClose={() => setPanelClosed(true)}
        />
      )}
    </div>
  );
}
