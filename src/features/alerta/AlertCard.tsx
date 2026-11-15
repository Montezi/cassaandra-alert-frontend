import { useTranslation } from 'react-i18next';
import { HTML_LANG, type Language } from '../../shared/i18n';
import { classStyle } from '../../shared/lib/classes';
import type { DominantClass } from '../../shared/lib/hotspotSchema';
import { Icon } from '../../shared/ui/Icon';
import { CLASS_ICON, EXPOSURE_ICON } from '../../shared/ui/icons';
import { AiBadge } from '../../shared/ui/AiBadge';
import styles from './AlertCard.module.css';
import type { AlertContent } from './alertMessage';

type AlertCardProps = {
  content: AlertContent;
  language: Language;
  image: string | null;
  cls: DominantClass | null;
};

/** The 4:5 card that goes with the message (readable on a phone screen). */
export function AlertCard({ content, language, image, cls }: AlertCardProps) {
  const { t } = useTranslation();
  return (
    <figure className={styles.figure}>
      <article lang={HTML_LANG[language]} className={styles.card} style={classStyle(cls)}>
        <div className={styles.top}>
          <span className={styles.brand}>
            <img src="/img/brand/simbolo-escuro.webp" alt="" className={styles.symbol} />
            <span className={styles.brandText}>
              <span className={styles.descriptor}>{content.descriptor}</span>
              <span className={styles.name}>CassAAndra</span>
            </span>
          </span>
          {content.className && cls && (
            <span className={styles.classChip}>
              <Icon name={CLASS_ICON[cls]} size={16} strokeWidth={2.6} />
              {content.className}
            </span>
          )}
        </div>
        <div>
          <h3 className={styles.place}>{content.name}</h3>
          <p className={styles.when}>{content.when}</p>
        </div>
        {image && (
          <div className={styles.imageFrame}>
            <img src={image} alt={t('alert.imageAlt')} className={styles.image} />
            <AiBadge />
          </div>
        )}
        <p className={styles.measured}>{content.measured}</p>
        <ul className={styles.facts}>
          {content.exposure.slice(0, 2).map((line) => (
            <li key={line.text}>
              <Icon name={EXPOSURE_ICON[line.kind]} size={18} />
              {line.text}
            </li>
          ))}
          {content.rain && (
            <li>
              <Icon name="moisture" size={18} />
              {content.rain}
            </li>
          )}
        </ul>
        <p className={styles.footer}>{content.footer}</p>
      </article>
      <figcaption className={styles.caption}>{t('alert.cardCaption')}</figcaption>
    </figure>
  );
}
