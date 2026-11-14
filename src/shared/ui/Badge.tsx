import type { ReactNode } from 'react';
import styles from './Badge.module.css';

/** Small neutral label, e.g. "Sample data". */
export function Badge({ children }: { children: ReactNode }) {
  return <span className={styles.badge}>{children}</span>;
}
