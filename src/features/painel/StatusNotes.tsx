import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { daysSince, formatDate } from '../../shared/lib/format';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import { Icon } from '../../shared/ui/Icon';
import styles from './sections.module.css';

/** NISAR repeats every 12 days; beyond this the data counts as old. */
const STALE_AFTER_DAYS = 30;

type StatusNotesProps = { hotspot: Hotspot['properties']; stats: HotspotStats };

/** Warnings that change how much to trust the panel: old data, low coherence. */
export function StatusNotes({ hotspot, stats }: StatusNotesProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const lastPass = hotspot.last_pass ?? stats.passes[stats.passes.length - 1]?.date ?? null;
  const age = lastPass ? daysSince(lastPass) : null;

  return (
    <>
      {age !== null && lastPass && age > STALE_AFTER_DAYS && (
        <div role="note" className={styles.note}>
          <Icon name="info" size={22} className={styles.noteIcon} />
          <p>
            <strong>{t('panel.stale.title', { days: age })}</strong>{' '}
            {t('panel.stale.text', { date: formatDate(lastPass, language) })}
          </p>
        </div>
      )}
      {stats.low_coherence && (
        <div role="note" className={styles.note}>
          <Icon name="warning" size={22} className={styles.noteIcon} />
          <p>
            <strong>{t('panel.lowCoherence.title')}</strong> {t('panel.lowCoherence.text')}
          </p>
        </div>
      )}
    </>
  );
}
