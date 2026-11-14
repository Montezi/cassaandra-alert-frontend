import { CASS_POSES, type Pose } from './cassPoses';

type CassPoseProps = {
  pose: Pose;
  width: number;
  /** Empty when the image is decoration next to text that says the same. */
  alt?: string;
  className?: string;
};

/** Cass, the mascot. Width is set; height follows the image's proportions. */
export function CassPose({ pose, width, alt = '', className }: CassPoseProps) {
  const [w, h] = CASS_POSES[pose];
  return (
    <img
      src={`/img/cass/${pose}.webp`}
      alt={alt}
      width={width}
      height={Math.round((width * h) / w)}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
