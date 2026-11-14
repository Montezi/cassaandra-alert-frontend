import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { classStyle } from '../../shared/lib/classes';
import { formatNumber, formatShortDate } from '../../shared/lib/format';
import type { DominantClass } from '../../shared/lib/hotspotSchema';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import styles from './PassTimeline.module.css';

type PassTimelineProps = {
  stats: HotspotStats;
  cls: DominantClass | null;
  selectedDate: string;
  onSelect: (date: string) => void;
};

/** NISAR passes (every 12 days) with the affected area measured in each. */
export function PassTimeline({ stats, cls, selectedDate, onSelect }: PassTimelineProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const labelId = useId();
  const digits = stats.passes.some((p) => p.affected_area_km2 < 10) ? 1 : 0;

  return (
    <div>
      <p id={labelId} className={styles.label}>
        {t('timeline.label')}
      </p>
      <ol aria-labelledby={labelId} className={styles.timeline} style={classStyle(cls)}>
        {stats.passes.map((pass) => {
          const selected = pass.date === selectedDate;
          return (
            <li key={pass.date} className={styles.item}>
              <button
                type="button"
                aria-pressed={selected}
                className={styles.button}
                onClick={() => onSelect(pass.date)}
              >
                <span aria-hidden="true" className={styles.dot}>
                  <span className={styles.dotInner} />
                </span>
                <span className={styles.date}>{formatShortDate(pass.date, language)}</span>
                <span className={styles.area}>
                  {formatNumber(pass.affected_area_km2, language, digits)} km²
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
