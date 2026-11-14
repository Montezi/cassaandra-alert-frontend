import { useTranslation } from 'react-i18next';
import styles from './TechnicalDialog.module.css';
import type { View } from './views';

/** Color scale or swatches for the current technical view. */
export function ViewLegend({ view }: { view: View }) {
  const { t } = useTranslation();
  return (
    <div className={styles.legend}>
      {view === 'change' && (
        <>
          <span className={styles.scale}>
            −10 dB
            <span aria-hidden="true" className={styles.gradient} data-scale="change" />
            +10 dB
          </span>
          <span>{t('technical.legend.change')}</span>
        </>
      )}
      {view === 'curtain' && (
        <>
          <span className={styles.scale}>
            −32 dB
            <span aria-hidden="true" className={styles.gradient} data-scale="gray" />0 dB
          </span>
          <span>{t('technical.legend.curtain')}</span>
        </>
      )}
      {view === 'classes' && (
        <>
          <span className={styles.swatchItem}>
            <span aria-hidden="true" className={styles.swatch} data-swatch="new" />
            {t('technical.legend.newWater')}
          </span>
          <span className={styles.swatchItem}>
            <span aria-hidden="true" className={styles.swatch} data-swatch="permanent" />
            {t('technical.legend.permanentWater')}
          </span>
          <span>{t('technical.legend.classes')}</span>
        </>
      )}
      {view === 'coherence' && (
        <>
          <span className={styles.scale}>
            {t('technical.legend.changed')}
            <span aria-hidden="true" className={styles.gradient} data-scale="coherence" />
            {t('technical.legend.same')}
          </span>
          <span>{t('technical.legend.coherence')}</span>
        </>
      )}
      {view === 'exposure' && (
        <>
          {(['hospital', 'school', 'population'] as const).map((kind) => (
            <span key={kind} className={styles.swatchItem}>
              <span aria-hidden="true" className={styles.dotSwatch} data-kind={kind} />
              {t(`technical.exposure.${kind}`)}
            </span>
          ))}
          <span>{t('technical.legend.exposure')}</span>
        </>
      )}
    </div>
  );
}
