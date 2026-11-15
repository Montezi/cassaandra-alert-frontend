import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AiCredits.module.css';
import { Dialog } from './Dialog';
import { IconButton } from './IconButton';

const ITEMS = ['cass', 'symbol', 'radar', 'data', 'code', 'agent'] as const;

/**
 * "AI credits" button and dialog: where and how AI was used in the project
 * (NASA Space Apps rule). Linked from the app header and the landing footer.
 */
export function AiCredits({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${styles[variant]}`}
        onClick={() => setOpen(true)}
      >
        {t('ai.credits.open')}
      </button>
      {open && (
        <Dialog labelledBy={titleId} onClose={() => setOpen(false)}>
          <div className={styles.content}>
            <div className={styles.header}>
              <h2 id={titleId} className={styles.title}>
                {t('ai.credits.title')}
              </h2>
              <IconButton
                icon="close"
                variant="filled"
                label={t('ai.credits.close')}
                onClick={() => setOpen(false)}
              />
            </div>
            <p>{t('ai.credits.intro')}</p>
            <dl className={styles.list}>
              {ITEMS.map((item) => (
                <div key={item} className={styles.item}>
                  <dt>{t(`ai.credits.items.${item}.what`)}</dt>
                  <dd>{t(`ai.credits.items.${item}.how`)}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.note}>{t('ai.credits.nasa')}</p>
          </div>
        </Dialog>
      )}
    </>
  );
}
