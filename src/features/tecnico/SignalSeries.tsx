import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { formatNumber, formatShortDate } from '../../shared/lib/format';
import type { Technical } from '../../shared/lib/statsSchema';
import styles from './TechnicalDialog.module.css';
import { useChartColors } from './useChartColors';

type SignalSeriesProps = { series: Technical['series']; selectedDate: string };

/** HH (solid) and HV (dashed) backscatter at the marked point, per pass. */
export function SignalSeries({ series, selectedDate }: SignalSeriesProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const colors = useChartColors();
  const first = series[0];
  const selected = series.find((p) => p.date === selectedDate) ?? series[series.length - 1];
  if (!first || !selected) return null;

  const fmt = (v: number) => formatNumber(v, language, 1);
  const data = series.map((p) => ({ ...p, label: formatShortDate(p.date, language) }));
  const description = t('technical.seriesLabel', {
    hhFrom: fmt(first.hh_db),
    hhTo: fmt(selected.hh_db),
    hvFrom: fmt(first.hv_db),
    hvTo: fmt(selected.hv_db),
  });

  return (
    <>
      <div role="img" aria-label={description} className={styles.chart}>
        <ResponsiveContainer width="100%" height={170}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
            accessibilityLayer={false}
            aria-hidden="true"
          >
            <CartesianGrid stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: colors.text, fontSize: 11 }}
              stroke={colors.grid}
            />
            <YAxis
              domain={[-34, -6]}
              ticks={[-30, -20, -10]}
              tickFormatter={(v: number) => `−${Math.abs(v)}`}
              tick={{ fill: colors.text, fontSize: 11 }}
              stroke={colors.grid}
            />
            <ReferenceLine
              x={formatShortDate(selected.date, language)}
              stroke={colors.text}
              strokeDasharray="3 3"
            />
            <Line
              dataKey="hh_db"
              stroke={colors.hh}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
            <Line
              dataKey="hv_db"
              stroke={colors.hv}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.sideNote}>
        {t('technical.seriesNote', {
          hh: `${fmt(first.hh_db)} → ${fmt(selected.hh_db)} dB`,
          hv: `${fmt(first.hv_db)} → ${fmt(selected.hv_db)} dB`,
        })}
      </p>
    </>
  );
}
