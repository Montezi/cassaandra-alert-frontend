import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { formatDateTime, formatNumber, formatWeekday } from '../../shared/lib/format';
import type { DominantClass } from '../../shared/lib/hotspotSchema';
import { Badge } from '../../shared/ui/Badge';
import { Icon } from '../../shared/ui/Icon';
import styles from './sections.module.css';
import { type ForecastState, isFresh, totalRain } from './useForecast';

/** Rain that, added to measured flooding, is worth a warning (mm in the forecast window). */
const ALERT_RAIN_MM = 40;

type ForecastSectionProps = { state: ForecastState; cls: DominantClass | null };

/** "Próximos dias": rain forecast, always with its source and update time. */
export function ForecastSection({ state, cls }: ForecastSectionProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        {t('forecast.title')}
      </h3>
      {state.status === 'loading' && (
        <p role="status" className={styles.sectionLead}>
          {t('forecast.loading')}
        </p>
      )}
      {state.status === 'error' && (
        <p role="status" className={styles.sectionLead}>
          {t('forecast.error')}
        </p>
      )}
      {state.status === 'ready' &&
        (() => {
          const { forecast, viaSnapshotFile } = state;
          const max = Math.max(40, ...forecast.days.map((d) => d.precipitation_mm));
          const total = totalRain(forecast);
          const fresh = isFresh(forecast);
          const description = forecast.days
            .map(
              (d) =>
                `${formatWeekday(d.date, language)}: ${formatNumber(d.precipitation_mm, language)} mm`,
            )
            .join(', ');
          return (
            <>
              <div
                role="img"
                aria-label={t('forecast.chartLabel', { days: description })}
                className={styles.rainChart}
              >
                {forecast.days.map((day) => (
                  <div key={day.date} className={styles.rainDay}>
                    <span className={styles.rainValue}>
                      {formatNumber(day.precipitation_mm, language)}
                    </span>
                    <span
                      className={styles.rainBar}
                      style={{ height: `${Math.max(4, (day.precipitation_mm / max) * 72)}px` }}
                    />
                    <span className={styles.rainLabel}>{formatWeekday(day.date, language)}</span>
                  </div>
                ))}
              </div>
              <p className={styles.sectionLead}>
                {t('forecast.caption', {
                  source: t(`forecast.source.${forecast.source}`),
                  date: formatDateTime(forecast.updated_at, language),
                })}{' '}
                {forecast.sample && <Badge>{t('common.sampleData')}</Badge>}
              </p>
              {(viaSnapshotFile || forecast.source !== 'meteomatics') && (
                <p className={styles.footnote}>
                  {t(viaSnapshotFile ? 'forecast.fallbackFile' : 'forecast.fallbackServer')}
                </p>
              )}
              {!fresh && (
                <div role="note" className={styles.note}>
                  <Icon name="info" size={22} className={styles.noteIcon} />
                  <p>{t('forecast.stale')}</p>
                </div>
              )}
              {fresh && cls === 'flood' && total >= ALERT_RAIN_MM && (
                <div role="note" className={styles.note}>
                  <Icon name="warning" size={22} className={styles.noteIcon} />
                  <p>
                    <strong>
                      {t('forecast.alertTitle', {
                        total: formatNumber(total, language),
                        days: forecast.days.length,
                      })}
                    </strong>{' '}
                    {t('forecast.alertText')}
                  </p>
                </div>
              )}
            </>
          );
        })()}
    </section>
  );
}
