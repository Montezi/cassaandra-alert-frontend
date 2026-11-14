import { lazy, Suspense, useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { Hotspot, HotspotCollection } from '../../shared/lib/hotspotSchema';
import { IconButton } from '../../shared/ui/IconButton';
import styles from './HotspotPanel.module.css';
import { PanelContent } from './PanelContent';

// The chat loads only when someone opens it (CLAUDE.md: lazy chat).
const CassChat = lazy(() => import('../cass/CassChat'));

export type PanelTab = 'panel' | 'chat';

type HotspotPanelProps = {
  hotspot: Hotspot;
  allHotspots: HotspotCollection;
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  onClose: () => void;
};

/** Right column: the hotspot panel and the Cass chat, as two tabs. */
export function HotspotPanel({
  hotspot,
  allHotspots,
  tab,
  onTabChange,
  onClose,
}: HotspotPanelProps) {
  const { t } = useTranslation();
  const baseId = useId();
  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'panel', label: t('panel.tab') },
    { id: 'chat', label: t('rail.askCass') },
  ];

  return (
    <aside className={styles.panel} aria-label={t('panel.label')}>
      <div className={styles.bar}>
        <div role="tablist" aria-label={t('panel.sections')} className={styles.tabs}>
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-${item.id}-tab`}
              aria-selected={tab === item.id}
              aria-controls={`${baseId}-${item.id}`}
              className={styles.tab}
              onClick={() => onTabChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <IconButton icon="close" label={t('panel.close')} onClick={onClose} />
      </div>

      {tab === 'panel' ? (
        <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-panel-tab`}>
          <PanelContent hotspot={hotspot} onAskCass={() => onTabChange('chat')} />
        </div>
      ) : (
        <div
          role="tabpanel"
          id={`${baseId}-chat`}
          aria-labelledby={`${baseId}-chat-tab`}
          className={styles.chatPanel}
        >
          <Suspense
            fallback={
              <p role="status" className={styles.loading}>
                {t('cass.loading')}
              </p>
            }
          >
            <CassChat hotspot={hotspot} allHotspots={allHotspots} />
          </Suspense>
        </div>
      )}
    </aside>
  );
}
