import { useTranslation } from 'react-i18next';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import styles from './TechnicalDialog.module.css';
import { useChartColors } from './useChartColors';

type ChangeHistogramProps = {
  /** Normalized counts (0–1), evenly spaced over `range`. */
  histogram: number[];
  range: [number, number];
  threshold: number;
};

/** Distribution of Δ dB. Bars beyond the threshold take the change colors. */
export function ChangeHistogram({ histogram, range, threshold }: ChangeHistogramProps) {
  const { t } = useTranslation();
  const colors = useChartColors();
  const [low, high] = range;
  const step = (high - low) / histogram.length;
  const data = histogram.map((value, index) => ({
    center: low + (index + 0.5) * step,
    value,
  }));

  return (
    <div role="img" aria-label={t('technical.histogramLabel')} className={styles.chart}>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} barCategoryGap={1} accessibilityLayer={false} aria-hidden="true">
          <XAxis
            dataKey="center"
            type="number"
            domain={[low, high]}
            ticks={[low, 0, high]}
            tickFormatter={(v: number) => (v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v)} dB`)}
            tick={{ fill: colors.text, fontSize: 12 }}
            stroke={colors.grid}
          />
          <YAxis hide domain={[0, 1]} />
          <Bar dataKey="value" isAnimationActive={false}>
            {data.map((bin) => (
              <Cell
                key={bin.center}
                fill={
                  bin.center <= -threshold
                    ? colors.decrease
                    : bin.center >= threshold
                      ? colors.increase
                      : colors.neutral
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
