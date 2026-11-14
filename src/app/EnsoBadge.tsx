import { useTranslation } from 'react-i18next';
import { useLanguage } from '../shared/i18n/useLanguage';
import { ensoSchema } from '../shared/lib/ensoSchema';
import { formatDate, formatNumber } from '../shared/lib/format';
import { useData } from '../shared/lib/useData';
import styles from './EnsoBadge.module.css';

/** "Very strong El Niño: RONI +2.0 °C" plus source and the latest radar date. */
export function EnsoBadge() {
  const { t } = useTranslation();
  const language = useLanguage();
  const { state } = useData('enso.json', ensoSchema);

  // The badge is context, not essential: while loading or on error, show nothing.
  if (state.status !== 'ready') return null;
  const enso = state.data;
  const sign = enso.value_c > 0 ? '+' : '';

  return (
    <div className={styles.wrapper}>
      <span className={styles.badge}>
        <span aria-hidden="true" className={styles.dot} />
        {t('enso.badge', {
          strength: t(`enso.strength.${enso.strength}`),
          value: `${sign}${formatNumber(enso.value_c, language, 1)}`,
        })}
      </span>
      <span className={styles.note}>
        {t('enso.note', {
          source: enso.source,
          season: enso.season[language],
          date: formatDate(enso.radar_through, language),
        })}
      </span>
    </div>
  );
}
