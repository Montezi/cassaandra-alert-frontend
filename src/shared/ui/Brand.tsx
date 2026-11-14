import { useTheme } from '../theme/theme';
import styles from './Brand.module.css';

type BrandProps = {
  /** "ALERTA" / "ALERT" above the name, as in the full lockup. */
  descriptor?: string;
  size?: 'sm' | 'md';
};

/** Symbol + "CassAAndra" wordmark. The two A's are Ana and Aline (Marca board). */
export function Brand({ descriptor, size = 'md' }: BrandProps) {
  const theme = useTheme();
  return (
    <span className={`${styles.brand} ${styles[size]}`}>
      <img
        src={`/img/brand/simbolo-${theme}.webp`}
        alt=""
        className={styles.symbol}
        width={240}
        height={176}
      />
      <span className={styles.text}>
        {descriptor && <span className={styles.descriptor}>{descriptor}</span>}
        <span className={styles.name}>
          Cass<span className={styles.a1}>A</span>
          <span className={styles.a2}>A</span>ndra
        </span>
      </span>
    </span>
  );
}
