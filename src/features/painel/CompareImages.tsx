import { type CSSProperties, useId, useState } from 'react';
import styles from './CompareImages.module.css';

type CompareImagesProps = {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  beforeAlt: string;
  afterAlt: string;
  sliderLabel: string;
};

/**
 * Two stacked images; a range input moves the curtain. The input is the
 * real control, so keyboard (arrows) and screen readers work.
 */
export function CompareImages(props: CompareImagesProps) {
  const [position, setPosition] = useState(50);
  const sliderId = useId();

  return (
    <div className={styles.compare} style={{ '--split': `${position}%` } as CSSProperties}>
      <img src={props.before} alt={props.beforeAlt} className={styles.image} />
      <img src={props.after} alt={props.afterAlt} className={`${styles.image} ${styles.after}`} />
      <span aria-hidden="true" className={styles.line} />
      <span className={`${styles.tag} ${styles.tagLeft}`}>{props.beforeLabel}</span>
      <span className={`${styles.tag} ${styles.tagRight}`}>{props.afterLabel}</span>
      <label htmlFor={sliderId} className="visually-hidden">
        {props.sliderLabel}
      </label>
      <input
        id={sliderId}
        type="range"
        min={0}
        max={100}
        value={position}
        className={styles.slider}
        onChange={(event) => setPosition(Number(event.target.value))}
      />
    </div>
  );
}
