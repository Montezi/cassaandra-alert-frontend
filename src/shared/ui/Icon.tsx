import { ICON_PATHS, type IconName } from './icons';

type IconProps = { name: IconName; size?: number; strokeWidth?: number; className?: string };

/** Decorative icon: always next to a text label, so hidden from screen readers. */
export function Icon({ name, size = 20, strokeWidth = 2.2, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
