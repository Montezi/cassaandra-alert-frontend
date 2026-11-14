import { useTranslation } from 'react-i18next';
import { HotspotExplorer } from '../features/mapa/HotspotExplorer';
import styles from './App.module.css';
import { Header } from './Header';

export function App() {
  const { t } = useTranslation();

  return (
    <div className={styles.layout}>
      <a href="#main" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <Header />
      <main id="main" className={styles.main} tabIndex={-1}>
        <HotspotExplorer />
      </main>
    </div>
  );
}
