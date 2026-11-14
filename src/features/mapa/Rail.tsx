import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { classStyle, isVisible, type Lens, LENSES } from '../../shared/lib/classes';
import type { HotspotCollection } from '../../shared/lib/hotspotSchema';
import { Badge } from '../../shared/ui/Badge';
import { Icon } from '../../shared/ui/Icon';
import { CLASS_ICON } from '../../shared/ui/icons';
import styles from './Rail.module.css';

type RailProps = {
  hotspots: HotspotCollection;
  selectedId: string | null;
  onSelect: (id: string) => void;
  lenses: Lens[];
  onToggleLens: (lens: Lens) => void;
  onAskCass: () => void;
};

/**
 * Left column: lenses, the hotspot list and the shortcut to the Cass chat.
 * The list is also the text alternative to the map (CLAUDE.md).
 */
export function Rail({
  hotspots,
  selectedId,
  onSelect,
  lenses,
  onToggleLens,
  onAskCass,
}: RailProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const lensesId = useId();
  const listId = useId();

  return (
    <aside className={styles.rail} aria-label={t('rail.label')}>
      <section aria-labelledby={lensesId}>
        <h2 id={lensesId} className={styles.heading}>
          {t('rail.lenses')}
        </h2>
        <ul className={styles.lenses}>
          {LENSES.map((lens) => {
            const on = lenses.includes(lens);
            return (
              <li key={lens}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  className={styles.lens}
                  style={classStyle(lens)}
                  onClick={() => onToggleLens(lens)}
                >
                  <span className={styles.lensIcon}>
                    <Icon name={CLASS_ICON[lens]} size={18} />
                  </span>
                  <span className={styles.lensName}>{t(`classes.${lens}`)}</span>
                  <span aria-hidden="true" className={styles.track}>
                    <span className={styles.knob} />
                  </span>
                </button>
              </li>
            );
          })}
          {(['deformation', 'moisture'] as const).map((soon) => (
            <li key={soon} className={styles.soon}>
              <span className={styles.soonIcon}>
                <Icon name={soon} size={18} />
              </span>
              <span className={styles.lensName}>{t(`rail.soon.${soon}`)}</span>
              <Badge>{t('rail.comingSoon')}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby={listId}>
        <div className={styles.listHeader}>
          <h2 id={listId} className={styles.heading}>
            {t('hotspots.heading')}
          </h2>
          {hotspots.metadata?.sample && <Badge>{t('common.sampleData')}</Badge>}
        </div>
        <ul className={styles.list}>
          {hotspots.features.map(({ properties: hotspot }) => {
            const cls = hotspot.dominant_class;
            const visible = isVisible(cls, lenses);
            return (
              <li key={hotspot.id}>
                <button
                  type="button"
                  className={styles.item}
                  aria-current={hotspot.id === selectedId ? 'true' : undefined}
                  style={classStyle(cls)}
                  onClick={() => onSelect(hotspot.id)}
                >
                  <span aria-hidden="true" className={styles.dot} />
                  <span className={styles.itemText}>
                    <span className={styles.itemName}>
                      {(hotspot.short_name ?? hotspot.name)[language]}
                    </span>
                    <span className={styles.itemDetail}>
                      {cls ? t(`classes.${cls}`) : t('hotspots.noClass')}
                      {!visible && ` · ${t('rail.hiddenByLens')}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <button type="button" className={styles.ask} onClick={onAskCass}>
        <img src="/img/cass/icone.webp" alt="" width={48} height={56} className={styles.askImage} />
        <span>
          <strong className={styles.askTitle}>{t('rail.askCass')}</strong>
          <span className={styles.askDetail}>{t('rail.askCassDetail')}</span>
        </span>
      </button>
    </aside>
  );
}
