import { useTranslation } from 'react-i18next';
import styles from './AiBadge.module.css';

type AiBadgeProps = {
  /** Over an image (corner or bottom center), or in the text flow under it. */
  placement?: 'bottom-left' | 'bottom-center' | 'inline';
};

/**
 * Visible "AI-generated" mark for images made with AI (NASA Space Apps rule:
 * AI images and videos must carry a visible watermark).
 */
export function AiBadge({ placement = 'bottom-left' }: AiBadgeProps) {
  const { t } = useTranslation();
  return <span className={`${styles.badge} ${styles[placement]}`}>{t('ai.badge')}</span>;
}
