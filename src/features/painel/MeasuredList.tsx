import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import type { DominantClass } from '../../shared/lib/hotspotSchema';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import { Icon } from '../../shared/ui/Icon';
import styles from './sections.module.css';

type MeasuredListProps = { stats: HotspotStats; cls: DominantClass | null };

/** "Medido": the decision-tree rules with the radar values (solid border). */
export function MeasuredList({ stats, cls }: MeasuredListProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const headingId = useId();
  if (stats.measured.length === 0) return null;

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {cls
          ? t('measured.titleClass', { cls: t(`classes.${cls}`).toLowerCase() })
          : t('measured.title')}
      </h3>
      <p className={styles.sectionLead}>{t('measured.lead')}</p>
      <ul className={`${styles.rows} ${styles.measured}`}>
        {stats.measured.map((rule) => (
          <li key={rule.measure.en} className={styles.rule}>
            <Icon name="check" strokeWidth={2.6} className={styles.ruleIcon} />
            <span>
              <strong className={styles.ruleValue}>
                {rule.measure[language]}: {rule.value[language]}
              </strong>
              <span className={styles.ruleNote}>{rule.note[language]}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
