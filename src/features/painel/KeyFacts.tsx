import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { formatDate, formatNumber, formatPercent, formatShortDate } from '../../shared/lib/format';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import styles from './sections.module.css';

type KeyFactsProps = {
  hotspot: Hotspot['properties'];
  stats: HotspotStats;
  pass: HotspotStats['passes'][number];
};

/** The four numbers that matter most, measured values first. */
export function KeyFacts({ hotspot, stats, pass }: KeyFactsProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const lastPass = hotspot.last_pass ?? stats.passes[stats.passes.length - 1]?.date;
  const digits = pass.affected_area_km2 < 10 ? 1 : 0;

  return (
    <dl className={styles.facts}>
      <div className={styles.fact}>
        <dt>{t('facts.area', { date: formatShortDate(pass.date, language) })}</dt>
        <dd className={styles.factNumber}>
          {formatNumber(pass.affected_area_km2, language, digits)} km²
        </dd>
      </div>
      <div className={styles.fact}>
        <dt>{t('facts.confidence')}</dt>
        <dd className={styles.factNumber}>
          {stats.confidence === null ? '—' : formatPercent(stats.confidence, language)}
        </dd>
      </div>
      <div className={styles.fact}>
        <dt>{t('facts.lastPass')}</dt>
        <dd className={styles.factText}>{lastPass ? formatDate(lastPass, language) : '—'}</dd>
      </div>
      <div className={styles.fact}>
        <dt>{t('facts.enso')}</dt>
        <dd className={styles.factText}>
          {hotspot.enso_effect ? hotspot.enso_effect[language] : t('facts.ensoUnknown')}
        </dd>
      </div>
    </dl>
  );
}
