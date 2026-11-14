import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { classStyle } from '../../shared/lib/classes';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import type { HotspotStats } from '../../shared/lib/statsSchema';
import { Badge } from '../../shared/ui/Badge';
import { Icon } from '../../shared/ui/Icon';
import { CLASS_ICON } from '../../shared/ui/icons';
import styles from './sections.module.css';
import { confidenceLevel } from './selection';

type PanelHeadingProps = {
  hotspot: Hotspot['properties'];
  stats: HotspotStats;
  sample: boolean;
};

export function PanelHeading({ hotspot, stats, sample }: PanelHeadingProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const cls = hotspot.dominant_class;

  return (
    <div>
      <h2 className={styles.title}>{hotspot.name[language]}</h2>
      <p className={styles.region}>{stats.region[language]}</p>
      <div className={styles.chips}>
        {cls && (
          <span className={styles.classChip} style={classStyle(cls)}>
            <span className={styles.classChipIcon}>
              <Icon name={CLASS_ICON[cls]} size={14} strokeWidth={2.8} />
            </span>
            {t(`classes.${cls}`)}
          </span>
        )}
        {stats.confidence !== null && (
          <span className={styles.outlineChip}>
            <Icon name="shield" size={14} strokeWidth={2.6} />
            {t('panel.confidenceLevel', {
              level: t(`panel.level.${confidenceLevel(stats.confidence)}`),
            })}
          </span>
        )}
        {sample && <Badge>{t('common.sampleData')}</Badge>}
      </div>
    </div>
  );
}
