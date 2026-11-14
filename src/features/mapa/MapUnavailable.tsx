import { useTranslation } from 'react-i18next';
import styles from './MapUnavailable.module.css';

/** Shown when the map cannot run (no WebGL2, or its code failed to download). */
export function MapUnavailable() {
  const { t } = useTranslation();
  return (
    <p role="status" className={styles.message}>
      {t('map.unavailable')}
    </p>
  );
}
