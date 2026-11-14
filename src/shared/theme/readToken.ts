/**
 * Reads a CSS variable from tokens.css for code that cannot use CSS directly
 * (e.g. MapLibre paint properties). Call it after the theme is applied.
 */
export function readToken(name: `--${string}`): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!value) throw new Error(`CSS token ${name} is not defined in tokens.css`);
  return value;
}
