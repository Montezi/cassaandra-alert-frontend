import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { usePathname } from '../shared/lib/urlState';
import styles from './App.module.css';

// Two pages, each in its own chunk: the landing page does not download the
// map, and the map page does not download the landing images.
const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const MapPage = lazy(() => import('./MapPage'));

/** "/app" (and anything under it) is the map; every other path is the landing page. */
export function App() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isMap = pathname === '/app' || pathname.startsWith('/app/');

  return (
    <Suspense
      fallback={
        <p role="status" className={styles.loading}>
          {t('app.loading')}
        </p>
      }
    >
      {isMap ? <MapPage /> : <LandingPage />}
    </Suspense>
  );
}
