import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { classStyle } from '../../shared/lib/classes';
import { DOMINANT_CLASSES } from '../../shared/lib/hotspotSchema';
import { Icon } from '../../shared/ui/Icon';
import { CLASS_ICON } from '../../shared/ui/icons';
import styles from './Legend.module.css';

/**
 * Map legend: every class with icon, color and name. Collapsed by default
 * so it never hides markers; the rail already names each hotspot's class.
 */
export function Legend() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className={styles.legend} aria-label={t('legend.label')}>
      {open && (
        <div id={panelId} className={styles.panel}>
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
        </div>
      )}
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name={open ? 'close' : 'layers'} size={18} />
        {open ? t('legend.hide') : t('legend.show')}
      </button>
    </section>
  );
}
