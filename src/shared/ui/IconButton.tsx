import type { ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import type { IconName } from './icons';
import styles from './IconButton.module.css';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  /** Accessible name; also shown as a tooltip. */
  label: string;
  variant?: 'plain' | 'filled' | 'overlay';
};

/** Square 44 px button with only an icon (WCAG target size). */
export function IconButton({
  icon,
  label,
  variant = 'plain',
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}
