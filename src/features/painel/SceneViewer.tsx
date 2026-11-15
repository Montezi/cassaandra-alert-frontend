import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { formatDate, formatMonthYear } from '../../shared/lib/format';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import { AiBadge } from '../../shared/ui/AiBadge';
import { CassPose } from '../../shared/ui/CassPose';
import { IconButton } from '../../shared/ui/IconButton';
import { CompareImages } from './CompareImages';
import styles from './sections.module.css';
import { POLARIZATIONS, type Polarization, scenePair, type Sensor, SENSORS } from './selection';

type SceneViewerProps = {
  stats: HotspotStats;
  passDate: string;
  pol: Polarization;
  onPolChange: (pol: Polarization) => void;
  /** Null when this hotspot has no technical layers. */
  onOpenTechnical: (() => void) | null;
};

/** Before/now images with a draggable curtain, per sensor and polarization. */
export function SceneViewer({
  stats,
  passDate,
  pol,
  onPolChange,
  onOpenTechnical,
}: SceneViewerProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const [sensor, setSensor] = useState<Sensor>('nisar');
  const polLabelId = useId();
  const hasScenes = Object.keys(stats.scenes).length > 0;

  if (!hasScenes) {
    return (
      <section className={styles.emptyScenes} aria-label={t('scenes.label')}>
        <CassPose pose="ateamanha" width={96} />
        <p>
          <strong>{t('scenes.noneTitle')}</strong> {t('scenes.noneText')}
        </p>
      </section>
    );
  }

  const pair = scenePair(stats, sensor, pol, passDate);
  const captionKey =
    sensor === 'nisar' ? (`scenes.caption.${pol}` as const) : (`scenes.caption.${sensor}` as const);

  return (
    <section className={styles.scenes} aria-label={t('scenes.label')}>
      <div role="group" aria-label={t('scenes.sensor')} className={styles.segmented}>
        {SENSORS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={sensor === id}
            className={styles.segment}
            disabled={!stats.scenes[id === 'nisar' ? 'nisar_hh' : id]}
            onClick={() => setSensor(id)}
          >
            <span className={styles.segmentName}>{t(`scenes.sensors.${id}.name`)}</span>
            <span className={styles.segmentSub}>{t(`scenes.sensors.${id}.sub`)}</span>
          </button>
        ))}
      </div>

      {pair ? (
        <figure className={styles.figure}>
          <div className={styles.compareFrame}>
            <CompareImages
              before={pair.before}
              after={pair.after}
              beforeLabel={t('scenes.before', {
                date: formatMonthYear(stats.baseline_date, language),
              })}
              afterLabel={t('scenes.now', { date: formatDate(pair.afterDate, language) })}
              beforeAlt={t('scenes.altBefore', {
                date: formatMonthYear(stats.baseline_date, language),
              })}
              afterAlt={t('scenes.altNow', { date: formatDate(pair.afterDate, language) })}
              sliderLabel={t('scenes.slider')}
            />
            <AiBadge />
            {onOpenTechnical && (
              <IconButton
                icon="expand"
                variant="overlay"
                label={t('scenes.expand')}
                className={styles.expand}
                onClick={onOpenTechnical}
              />
            )}
          </div>
          <figcaption className={styles.caption}>
            {t(captionKey)} {t('common.illustrative')}
          </figcaption>
          {onOpenTechnical && (
            <button type="button" className={styles.outlineButton} onClick={onOpenTechnical}>
              {t('scenes.openTechnical')}
            </button>
          )}
        </figure>
      ) : (
        <p className={styles.caption}>{t('scenes.missingSensor')}</p>
      )}

      {sensor === 'nisar' && (
        <div className={styles.inlineGroup}>
          <span id={polLabelId} className={styles.groupLabel}>
            {t('scenes.polarization')}
          </span>
          <div role="group" aria-labelledby={polLabelId} className={styles.pills}>
            {POLARIZATIONS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={pol === id}
                className={styles.pill}
                disabled={!stats.scenes[`nisar_${id}`]}
                onClick={() => onPolChange(id)}
              >
                {t(`scenes.pol.${id}`)}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
