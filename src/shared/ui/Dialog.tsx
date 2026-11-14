import { type ReactNode, useEffect, useRef } from 'react';
import styles from './Dialog.module.css';

type DialogProps = {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'xl';
};

/**
 * Modal built on the native <dialog>: the browser traps focus, closes on Esc
 * and returns focus to the button that opened it. Mount it to open it; each
 * dialog also has a visible close button.
 */
export function Dialog({ labelledBy, onClose, children, size = 'md' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={`${styles.dialog} ${styles[size]}`}
      onClose={onClose}
    >
      <div className={styles.content}>{children}</div>
    </dialog>
  );
}
