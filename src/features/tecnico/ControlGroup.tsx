import { type ReactNode, useId } from 'react';
import styles from './TechnicalDialog.module.css';

/** Labelled group of toggle pills (pass date, polarization, threshold). */
export function ControlGroup({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div>
      <p id={id} className={styles.controlLabel}>
        {label}
      </p>
      <div role="group" aria-labelledby={id} className={styles.pills}>
        {children}
      </div>
    </div>
  );
}
