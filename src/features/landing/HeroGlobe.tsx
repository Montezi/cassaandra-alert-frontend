import { useTranslation } from 'react-i18next';
import { CassPose } from '../../shared/ui/CassPose';
import { Icon } from '../../shared/ui/Icon';
import styles from './HeroGlobe.module.css';

/** Pins on the globe image, in % of its box (from the design prototype). */
const PINS = [
  { id: 'california', cls: 'fire', left: 25.7, top: 24.87, side: 'right' },
  { id: 'peru', cls: 'flood', left: 51.22, top: 57.99, side: 'left' },
  { id: 'amazon', cls: 'drought', left: 68.7, top: 55.93, side: 'right' },
  { id: 'guaiba', cls: 'flood', left: 72.17, top: 77.53, side: 'right' },
] as const;

/** Globe with the Americas, a radar sweep and four hotspots. */
export function HeroGlobe() {
  const { t } = useTranslation();
  return (
    <div className={styles.wrap}>
      <div className={styles.globeBox}>
        <svg viewBox="0 0 100 100" aria-hidden="true" className={styles.orbit}>
          <path d="M41.7 97.3 A48 48 0 0 1 19.1 13.2" className={styles.orbitBlue} />
          <path d="M45.8 2.2 A48 48 0 0 1 96.4 37.6" className={styles.orbitOrange} />
          <circle cx="86.8" cy="19.1" r="3.4" className={styles.sun} />
        </svg>
        <div role="img" aria-label={t('landing.globe.label')} className={styles.globe}>
          <img src="/img/landing/globo-americas.svg" alt="" className={styles.globeImage} />
          <div aria-hidden="true" className={styles.sweep} />
          {PINS.map((pin) => (
            <span
              key={pin.id}
              aria-hidden="true"
              className={styles.pin}
              data-cls={pin.cls}
              data-side={pin.side}
              style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            >
              <span className={styles.ping} />
              <span className={styles.dot} />
              <span className={styles.pinLabel}>{t(`landing.globe.pins.${pin.id}`)}</span>
            </span>
          ))}
        </div>
        <CassPose
          pose="pin3"
          width={240}
          alt={t('landing.globe.cassAlt')}
          className={styles.cass}
        />
        <div className={styles.card}>
          <span className={styles.cardChip}>
            <Icon name="flood" size={16} strokeWidth={2.4} />
            {t('classes.flood')}
          </span>
          <p className={styles.cardTitle}>{t('landing.globe.cardTitle')}</p>
          <p className={styles.cardText}>{t('landing.globe.cardText')}</p>
        </div>
      </div>
    </div>
  );
}
