import { useTranslation } from 'react-i18next';
import { HotspotExplorer } from '../features/mapa/HotspotExplorer';
import styles from './App.module.css';
import { Header } from './Header';

/** The app itself: header, map, rail and hotspot panel. */
export default function MapPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.layout}>
      <a href="#main" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <Header />
      <main id="main" className={styles.main} tabIndex={-1}>
        <h1 className="visually-hidden">{t('map.pageTitle')}</h1>
        <HotspotExplorer />
      </main>
    </div>
  );
}
