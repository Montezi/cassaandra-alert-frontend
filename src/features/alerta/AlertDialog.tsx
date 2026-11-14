import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HTML_LANG, type Language, LANGUAGES } from '../../shared/i18n';
import { useLanguage } from '../../shared/i18n/useLanguage';
import type { Forecast } from '../../shared/lib/forecastSchema';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import { CassPose } from '../../shared/ui/CassPose';
import { Dialog } from '../../shared/ui/Dialog';
import { Icon } from '../../shared/ui/Icon';
import { IconButton } from '../../shared/ui/IconButton';
import { AlertCard } from './AlertCard';
import styles from './AlertDialog.module.css';
import { buildAlert } from './alertMessage';

type AlertDialogProps = {
  hotspot: Hotspot['properties'];
  stats: HotspotStats;
  pass: HotspotStats['passes'][number];
  forecast: Forecast | null;
  onClose: () => void;
};

/** Preview of the alert card and message, ready to share on WhatsApp. */
export default function AlertDialog({ hotspot, stats, pass, forecast, onClose }: AlertDialogProps) {
  const { t } = useTranslation();
  const pageLanguage = useLanguage();
  const titleId = useId();
  const [language, setLanguage] = useState<Language>(pageLanguage);
  const [copied, setCopied] = useState(false);
  const content = buildAlert(language, hotspot, stats, pass, forecast);
  const image = stats.scenes.nisar_rgb?.[pass.date] ?? null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(content.message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <div className={styles.introHeader}>
            <CassPose pose="enviando" width={64} />
            <h2 id={titleId} className={styles.title}>
              {t('alert.title')}
            </h2>
            <IconButton icon="close" variant="filled" label={t('alert.close')} onClick={onClose} />
          </div>
          <p>{t('alert.intro')}</p>

          <div role="group" aria-label={t('alert.languageGroup')} className={styles.languages}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                aria-pressed={lang === language}
                className={styles.language}
                onClick={() => {
                  setLanguage(lang);
                  setCopied(false);
                }}
              >
                {t(`language.${lang}.name`)}
              </button>
            ))}
          </div>

          <div className={styles.messageBox}>
            <p className={styles.messageLabel}>{t('alert.messageLabel')}</p>
            <p lang={HTML_LANG[language]} className={styles.message}>
              {content.message}
            </p>
          </div>

          <div className={styles.actions}>
            {/* wa.me is WhatsApp's official share link: the only way to open it from a page. */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(content.message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.share}
            >
              <Icon name="share" />
              {t('alert.share')}
            </a>
            <button type="button" className={styles.copy} onClick={() => void copy()}>
              <Icon name="copy" />
              {t('alert.copy')}
            </button>
            <p role="status" className={styles.copied}>
              {copied ? t('alert.copied') : ''}
            </p>
          </div>
          <p className={styles.note}>{t('alert.note')}</p>
        </div>

        <AlertCard
          content={content}
          language={language}
          image={image}
          cls={hotspot.dominant_class}
        />
      </div>
    </Dialog>
  );
}
