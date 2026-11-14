import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import type { HotspotCollection } from '../../shared/lib/hotspotSchema';
import { Badge } from '../../shared/ui/Badge';
import styles from './HotspotList.module.css';

type HotspotListProps = {
  hotspots: HotspotCollection;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/**
 * Text alternative to the map (CLAUDE.md: every hotspot is reachable outside
 * the map). Works with keyboard and screen readers, and without WebGL.
 */
export function HotspotList({ hotspots, selectedId, onSelect }: HotspotListProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const headingId = useId();

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {t('hotspots.heading')}
        </h2>
        {hotspots.metadata?.sample && <Badge>{t('hotspots.sampleData')}</Badge>}
      </div>
      <ul className={styles.list}>
        {hotspots.features.map(({ properties: hotspot }) => (
          <li key={hotspot.id}>
            <button
              type="button"
              className={styles.item}
              aria-pressed={hotspot.id === selectedId}
              onClick={() => onSelect(hotspot.id)}
            >
              <span className={styles.name}>{hotspot.name[language]}</span>
              {hotspot.enso_effect && (
                <span className={styles.detail}>
                  {t('hotspots.ensoEffect', { effect: hotspot.enso_effect[language] })}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
