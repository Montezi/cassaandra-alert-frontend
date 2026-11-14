/** True when the user asked the system for less motion (CLAUDE.md: accessibility). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
