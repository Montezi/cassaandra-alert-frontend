import { readToken } from '../../shared/theme/readToken';
import { useTheme } from '../../shared/theme/theme';

/**
 * Recharts draws SVG attributes, where CSS variables do not apply, so the
 * colors are read from tokens.css. Reading again on each theme change keeps
 * the charts in sync with light/dark.
 */
export function useChartColors() {
  const theme = useTheme();
  return {
    theme,
    decrease: readToken('--color-decrease'),
    increase: readToken('--color-increase'),
    neutral: readToken('--color-bar-off'),
    hh: readToken('--color-line-hh'),
    hv: readToken('--color-line-hv'),
    grid: readToken('--color-divider'),
    text: readToken('--color-text-muted'),
  };
}
