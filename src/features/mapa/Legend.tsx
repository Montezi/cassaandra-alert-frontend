import { useTranslation } from 'react-i18next';
import { classStyle } from '../../shared/lib/classes';
import { DOMINANT_CLASSES } from '../../shared/lib/hotspotSchema';
import { Icon } from '../../shared/ui/Icon';
import { CLASS_ICON } from '../../shared/ui/icons';
import styles from './Legend.module.css';

/** Map legend: every class with icon, color and name. */
export function Legend() {
  const { t } = useTranslation();
  return (
    <section className={styles.legend} aria-label={t('legend.label')}>
      <ul className={styles.list}>
        {DOMINANT_CLASSES.map((cls) => (
          <li key={cls} className={styles.item} style={classStyle(cls)}>
            <span className={styles.icon}>
              <Icon name={CLASS_ICON[cls]} size={13} strokeWidth={2.8} />
            </span>
            {t(`classes.${cls}`)}
          </li>
        ))}
      </ul>
      <p className={styles.note}>{t('legend.note')}</p>
    </section>
  );
}
