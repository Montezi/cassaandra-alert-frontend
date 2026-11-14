import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { classStyle } from '../../shared/lib/classes';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import { Icon } from '../../shared/ui/Icon';
import { CLASS_ICON } from '../../shared/ui/icons';
import styles from './HotspotMarker.module.css';

type HotspotMarkerProps = {
  hotspot: Hotspot['properties'];
  selected: boolean;
  /** Put the label on the left when a neighbor sits close on the right. */
  labelLeft: boolean;
  onSelect: (id: string) => void;
};

/**
 * One map marker, rendered by React into a MapLibre Marker element. The
 * class is shown by color, icon and name together (never color alone).
 */
export function HotspotMarker({ hotspot, selected, labelLeft, onSelect }: HotspotMarkerProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const cls = hotspot.dominant_class;
  const label = (hotspot.short_name ?? hotspot.name)[language];

  return (
    <div
      className={styles.marker}
      data-selected={selected}
      data-label={labelLeft ? 'left' : 'right'}
      style={classStyle(cls)}
    >
      {selected && <span aria-hidden="true" className={styles.ping} />}
      <button
        type="button"
        className={styles.button}
        aria-pressed={selected}
        aria-label={
          cls ? `${hotspot.name[language]}: ${t(`classes.${cls}`)}` : hotspot.name[language]
        }
        onClick={() => onSelect(hotspot.id)}
      >
        <span className={styles.dot}>
          <Icon name={cls ? CLASS_ICON[cls] : 'stable'} size={16} strokeWidth={2.6} />
        </span>
      </button>
      <span aria-hidden="true" className={styles.label}>
        {label}
      </span>
    </div>
  );
}
