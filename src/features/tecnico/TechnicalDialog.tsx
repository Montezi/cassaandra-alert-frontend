import { type CSSProperties, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import {
  formatDate,
  formatMonthYear,
  formatNumber,
  formatShortDate,
} from '../../shared/lib/format';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import type { HotspotStats, Technical } from '../../shared/lib/statsSchema';
import { Dialog } from '../../shared/ui/Dialog';
import { Icon } from '../../shared/ui/Icon';
import { IconButton } from '../../shared/ui/IconButton';
import { CompareImages } from '../painel/CompareImages';
import { POLARIZATIONS, type Polarization } from '../painel/selection';
import { ChangeHistogram } from './ChangeHistogram';
import { ControlGroup } from './ControlGroup';
import { SignalSeries } from './SignalSeries';
import styles from './TechnicalDialog.module.css';
import { ViewLegend } from './ViewLegend';
import { type View, VIEWS } from './views';

const THRESHOLDS = ['2', '3', '4'] as const;
type Threshold = (typeof THRESHOLDS)[number];
const MAX_ZOOM = 3;

type TechnicalDialogProps = {
  hotspot: Hotspot['properties'];
  stats: HotspotStats;
  technical: Technical;
  initialDate: string;
  initialPol: Polarization;
  onClose: () => void;
};

/**
 * Technical mode: the radar layers behind the panel's numbers. Loaded on
 * demand (React.lazy) together with Recharts.
 */
export default function TechnicalDialog({
  hotspot,
  stats,
  technical,
  initialDate,
  initialPol,
  onClose,
}: TechnicalDialogProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const titleId = useId();
  const dates = Object.keys(technical.dates).sort();
  const [view, setView] = useState<View>('change');
  const [date, setDate] = useState(
    technical.dates[initialDate] ? initialDate : (dates[dates.length - 1] ?? initialDate),
  );
  const [threshold, setThreshold] = useState<Threshold>('3');
  const [pol, setPol] = useState<Polarization>(initialPol);
  const [zoom, setZoom] = useState(1);

  const layers = technical.dates[date];
  const hhScene = stats.scenes.nisar_hh;
  const polScene = stats.scenes[`nisar_${pol}`] ?? hhScene;
  if (!layers || !hhScene || !polScene) return null;

  const nowImage = hhScene[date] ?? hhScene.baseline;
  const change = layers.stats[threshold];
  const baselineLabel = formatMonthYear(stats.baseline_date, language);
  const dateLabel = formatDate(date, language);
  const roi = technical.roi;
  const mainImage =
    view === 'change'
      ? layers.change[threshold]
      : view === 'coherence'
        ? layers.coherence
        : view === 'classes'
          ? layers.classes
          : (polScene[date] ?? nowImage);

  const stageStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: `${roi.x_pct}% ${roi.y_pct}%`,
  } as CSSProperties;

  return (
    <Dialog labelledBy={titleId} onClose={onClose} size="xl">
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 id={titleId} className={styles.title}>
            {t('technical.title', { name: hotspot.name[language] })}
          </h2>
          <p className={styles.subtitle}>
            {t('technical.subtitle', {
              before: baselineLabel,
              now: dateLabel,
              px: formatNumber(technical.pixel_m, language, 1),
            })}
          </p>
        </div>
        <a href={mainImage} download className={styles.download}>
          <Icon name="download" size={18} />
          {t('technical.download')}
        </a>
        <IconButton icon="close" variant="filled" label={t('technical.close')} onClick={onClose} />
      </div>

      <div className={styles.body}>
        <div className={styles.main}>
          <div role="group" aria-label={t('technical.viewGroup')} className={styles.views}>
            {VIEWS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                className={styles.chip}
                onClick={() => setView(id)}
              >
                <span className={styles.chipName}>{t(`technical.views.${id}.name`)}</span>
                <span className={styles.chipSub}>{t(`technical.views.${id}.sub`)}</span>
              </button>
            ))}
          </div>

          <div className={styles.stageFrame}>
            {view === 'curtain' ? (
              <div className={styles.stage} style={stageStyle}>
                <CompareImages
                  before={polScene.baseline}
                  after={polScene[date] ?? nowImage}
                  beforeLabel={t('scenes.before', { date: baselineLabel })}
                  afterLabel={`${dateLabel}, ${t(`scenes.pol.${pol}`)}`}
                  beforeAlt={t('technical.alt.before')}
                  afterAlt={t('technical.alt.now')}
                  sliderLabel={t('scenes.slider')}
                />
              </div>
            ) : (
              <>
                <div className={styles.stage} style={stageStyle}>
                  {(view === 'classes' || view === 'exposure') && (
                    <img src={nowImage} alt="" className={styles.layer} />
                  )}
                  <img
                    src={view === 'exposure' ? layers.classes : mainImage}
                    alt={t(`technical.alt.${view}`)}
                    className={styles.layer}
                  />
                  {view === 'exposure' &&
                    technical.exposure_points.map((point, index) => (
                      <span
                        key={index}
                        role="img"
                        aria-label={t(`technical.exposure.${point.kind}`)}
                        className={styles.point}
                        data-kind={point.kind}
                        style={{ left: `${point.x_pct}%`, top: `${point.y_pct}%` }}
                      >
                        {point.kind !== 'population' && (
                          <Icon
                            name={point.kind === 'hospital' ? 'plus' : 'school'}
                            size={12}
                            strokeWidth={3.2}
                          />
                        )}
                      </span>
                    ))}
                  {view !== 'exposure' && (
                    <span
                      aria-hidden="true"
                      className={styles.roi}
                      style={{ left: `${roi.x_pct}%`, top: `${roi.y_pct}%` }}
                    />
                  )}
                </div>
                <span className={`${styles.tag} ${styles.tagLeft}`}>
                  {t(`technical.tag.${view}`)}
                </span>
                <span className={`${styles.tag} ${styles.tagRight}`}>{dateLabel}</span>
              </>
            )}
            <div className={styles.zoom}>
              <IconButton
                icon="plus"
                variant="overlay"
                label={t('technical.zoomIn')}
                disabled={zoom >= MAX_ZOOM}
                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.5))}
              />
              <IconButton
                icon="minus"
                variant="overlay"
                label={t('technical.zoomOut')}
                disabled={zoom <= 1}
                onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
              />
            </div>
            <span className={`${styles.tag} ${styles.zoomTag}`} aria-live="polite">
              {t('technical.zoomLevel', { zoom: formatNumber(zoom, language, zoom % 1 ? 1 : 0) })}
            </span>
          </div>

          <ViewLegend view={view} />

          <div className={styles.controls}>
            <ControlGroup label={t('technical.pass')}>
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={d === date}
                  className={styles.pill}
                  onClick={() => setDate(d)}
                >
                  {formatShortDate(d, language)}
                </button>
              ))}
            </ControlGroup>
            {view === 'curtain' && (
              <ControlGroup label={t('scenes.polarization')}>
                {POLARIZATIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={p === pol}
                    className={styles.pill}
                    disabled={!stats.scenes[`nisar_${p}`]}
                    onClick={() => setPol(p)}
                  >
                    {t(`scenes.pol.${p}`)}
                  </button>
                ))}
              </ControlGroup>
            )}
            {view === 'change' && (
              <ControlGroup label={t('technical.threshold')}>
                {THRESHOLDS.map((thr) => (
                  <button
                    key={thr}
                    type="button"
                    aria-pressed={thr === threshold}
                    className={styles.pill}
                    onClick={() => setThreshold(thr)}
                  >
                    {thr} dB
                  </button>
                ))}
              </ControlGroup>
            )}
          </div>
        </div>

        <aside className={styles.side} aria-label={t('technical.measures')}>
          <section>
            <h3 className={styles.sideTitle}>
              {t('technical.changeTitle', {
                before: baselineLabel,
                now: formatShortDate(date, language),
              })}
            </h3>
            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt>{t('technical.decrease')}</dt>
                <dd className={styles.statNumber} data-tone="decrease">
                  {formatNumber(change.decrease_pct, language, 1)}%
                </dd>
                <dd className={styles.statSub}>{formatNumber(change.area_km2, language)} km²</dd>
              </div>
              <div className={styles.stat}>
                <dt>{t('technical.increase')}</dt>
                <dd className={styles.statNumber} data-tone="increase">
                  {formatNumber(change.increase_pct, language, 1)}%
                </dd>
              </div>
              <div className={styles.stat}>
                <dt>{t('technical.meanDelta')}</dt>
                <dd className={styles.statNumber}>{formatNumber(change.mean_db, language, 1)}</dd>
                <dd className={styles.statSub}>dB</dd>
              </div>
            </dl>
            <p className={styles.sideNote}>{t('technical.thresholdNote', { threshold })}</p>
          </section>

          <section>
            <h3 className={styles.sideTitle}>{t('technical.histogramTitle')}</h3>
            <ChangeHistogram
              histogram={layers.histogram}
              range={technical.histogram_range_db}
              threshold={Number(threshold)}
            />
          </section>

          <section>
            <h3 className={styles.sideTitle}>{t('technical.seriesTitle')}</h3>
            <SignalSeries series={technical.series} selectedDate={date} />
          </section>

          <section className={styles.help}>
            <h3 className={styles.helpTitle}>{t('technical.howToRead')}</h3>
            <p>{t(`technical.views.${view}.help`)}</p>
          </section>
        </aside>
      </div>
    </Dialog>
  );
}
