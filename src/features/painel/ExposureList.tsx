import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import type { ExposureKind, HotspotStats } from '../../shared/lib/statsSchema';
import { Icon } from '../../shared/ui/Icon';
import type { IconName } from '../../shared/ui/icons';
import styles from './sections.module.css';

const EXPOSURE_ICON: Record<ExposureKind, IconName> = {
  people: 'people',
  homes: 'homes',
  health: 'health',
  school: 'school',
  roads: 'roads',
  boat: 'boat',
  power: 'power',
  fire: 'fire',
  drought: 'drought',
};

/** "Quem está na área afetada": people and services inside the measured area. */
export function ExposureList({ stats }: { stats: HotspotStats }) {
  const { t } = useTranslation();
  const language = useLanguage();
  const headingId = useId();
  if (stats.exposure.length === 0) return null;

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {t('exposure.title')}
      </h3>
      <ul className={styles.rows}>
        {stats.exposure.map((item) => (
          <li key={item.label.en} className={styles.row}>
            <span className={styles.rowIcon}>
              <Icon name={EXPOSURE_ICON[item.kind]} />
            </span>
            <span className={styles.rowLabel}>{item.label[language]}</span>
            <strong className={styles.rowValue}>{item.value[language]}</strong>
          </li>
        ))}
      </ul>
      <p className={styles.footnote}>{t('exposure.note')}</p>
    </section>
  );
}
