import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import { hotspotStatsSchema } from '../../shared/lib/statsSchema';
import { useData } from '../../shared/lib/useData';
import { useUrlParam } from '../../shared/lib/urlState';
import { Button } from '../../shared/ui/Button';
import { CassPose } from '../../shared/ui/CassPose';
import { Icon } from '../../shared/ui/Icon';
import { ExposureList } from './ExposureList';
import { ForecastSection } from './ForecastSection';
import { HypothesisCard } from './HypothesisCard';
import { KeyFacts } from './KeyFacts';
import { MeasuredList } from './MeasuredList';
import { PanelHeading } from './PanelHeading';
import { PassTimeline } from './PassTimeline';
import { SceneViewer } from './SceneViewer';
import styles from './sections.module.css';
import { isPolarization, selectedPass } from './selection';
import { SourcesList } from './SourcesList';
import { StatusNotes } from './StatusNotes';
import { useForecast } from './useForecast';

// Both dialogs load on demand: most visits never open them.
const TechnicalDialog = lazy(() => import('../tecnico/TechnicalDialog'));
const AlertDialog = lazy(() => import('../alerta/AlertDialog'));

type PanelContentProps = { hotspot: Hotspot; onAskCass: () => void };

/** Everything about one hotspot: images, numbers, Medido × Hipótese, forecast. */
export function PanelContent({ hotspot, onAskCass }: PanelContentProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const id = hotspot.properties.id;
  const { state, retry } = useData(`stats/${id}.json`, hotspotStatsSchema);
  const forecast = useForecast(hotspot);
  const [dateParam, setDateParam] = useUrlParam('date');
  const [polParam, setPolParam] = useUrlParam('pol');
  const [dialog, setDialog] = useState<'technical' | 'alert' | null>(null);

  if (state.status === 'loading') {
    return (
      <div role="status" className={styles.state}>
        <CassPose pose="monitorando" width={120} />
        <p>{t('panel.loading', { name: hotspot.properties.name[language] })}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div role="alert" className={styles.state}>
        <CassPose pose="atento" width={120} />
        <p>
          <strong>{t('panel.errorTitle')}</strong>
        </p>
        <p>{t('panel.errorText')}</p>
        <Button onClick={retry}>{t('hotspots.retry')}</Button>
      </div>
    );
  }

  const stats = state.data;
  const pass = selectedPass(stats, dateParam);
  const pol = isPolarization(polParam) ? polParam : 'hh';
  const sample = Boolean(stats.metadata?.sample);

  return (
    <div className={styles.content}>
      <PanelHeading hotspot={hotspot.properties} stats={stats} sample={sample} />
      <StatusNotes hotspot={hotspot.properties} stats={stats} />

      <SceneViewer
        stats={stats}
        passDate={pass.date}
        pol={pol}
        onPolChange={(next) => setPolParam(next === 'hh' ? null : next)}
        onOpenTechnical={stats.technical ? () => setDialog('technical') : null}
      />
      <PassTimeline
        stats={stats}
        cls={hotspot.properties.dominant_class}
        selectedDate={pass.date}
        onSelect={(date) => {
          const latest = stats.passes[stats.passes.length - 1];
          setDateParam(date === latest?.date ? null : date);
        }}
      />

      <KeyFacts hotspot={hotspot.properties} stats={stats} pass={pass} />
      <ExposureList stats={stats} />
      <MeasuredList stats={stats} cls={hotspot.properties.dominant_class} />
      {stats.hypothesis && <HypothesisCard hypothesis={stats.hypothesis} />}
      <ForecastSection state={forecast} cls={hotspot.properties.dominant_class} />
      <SourcesList stats={stats} />

      <div className={styles.actions}>
        <button type="button" className={styles.alertButton} onClick={() => setDialog('alert')}>
          <Icon name="share" />
          {t('alert.open')}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onAskCass}>
          {t('panel.askAbout', {
            name: (hotspot.properties.short_name ?? hotspot.properties.name)[language],
          })}
        </button>
      </div>

      <Suspense fallback={null}>
        {dialog === 'technical' && stats.technical && (
          <TechnicalDialog
            hotspot={hotspot.properties}
            stats={stats}
            technical={stats.technical}
            initialDate={pass.date}
            initialPol={pol}
            onClose={() => setDialog(null)}
          />
        )}
        {dialog === 'alert' && (
          <AlertDialog
            hotspot={hotspot.properties}
            stats={stats}
            pass={pass}
            forecast={forecast.status === 'ready' ? forecast.forecast : null}
            onClose={() => setDialog(null)}
          />
        )}
      </Suspense>
    </div>
  );
}
