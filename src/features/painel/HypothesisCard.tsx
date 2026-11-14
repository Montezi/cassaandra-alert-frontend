import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { HYPOTHESIS_STRENGTHS, type HotspotStats } from '../../shared/lib/statsSchema';
import { CassPose } from '../../shared/ui/CassPose';
import styles from './sections.module.css';

type HypothesisCardProps = { hypothesis: NonNullable<HotspotStats['hypothesis']> };

/**
 * "Hipótese": dashed border, orange and a thinking Cass, so it never looks
 * like a measurement (CLAUDE.md rule 5). Strength shown in bars and words.
 */
export function HypothesisCard({ hypothesis }: HypothesisCardProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const headingId = useId();
  const level = HYPOTHESIS_STRENGTHS.indexOf(hypothesis.strength) + 1;

  return (
    <section aria-labelledby={headingId} className={styles.hypothesis}>
      <div className={styles.hypothesisHeader}>
        <h3 id={headingId} className={styles.sectionTitle}>
          {t('hypothesis.title')}
        </h3>
        <CassPose pose="pensativo" width={48} />
      </div>
      <p className={styles.hypothesisText}>{hypothesis.text[language]}</p>
      <p className={styles.sectionLead}>
        <strong className={styles.strongText}>{t('hypothesis.evidence')}</strong>{' '}
        {hypothesis.evidence[language]}
      </p>
      <div className={styles.strength}>
        <span>{t('hypothesis.strength')}</span>
        <span aria-hidden="true" className={styles.bars}>
          {HYPOTHESIS_STRENGTHS.map((s, i) => (
            <span key={s} className={styles.bar} data-on={i < level} />
          ))}
        </span>
        <strong className={styles.strongText}>
          {t(`hypothesis.level.${hypothesis.strength}`)}
        </strong>
      </div>
      <p className={styles.footnote}>{t('hypothesis.disclaimer')}</p>
    </section>
  );
}
