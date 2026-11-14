import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import { Icon } from '../../shared/ui/Icon';
import styles from './sections.module.css';

export function SourcesList({ stats }: { stats: HotspotStats }) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {t('sources.title')}
      </h3>
      <ul className={styles.sourceList}>
        {stats.sources.map((source) => (
          <li key={source} className={styles.source}>
            <Icon name="source" size={14} strokeWidth={2.4} />
            {source}
          </li>
        ))}
      </ul>
    </section>
  );
}
