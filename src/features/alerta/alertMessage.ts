import i18n from '../../shared/i18n';
import type { Language } from '../../shared/i18n';
import type { Forecast } from '../../shared/lib/forecastSchema';
import { formatDate, formatNumber } from '../../shared/lib/format';
import type { Hotspot } from '../../shared/lib/hotspotSchema';
import type { ExposureKind, HotspotStats } from '../../shared/lib/statsSchema';
import { isFresh, totalRain } from '../painel/useForecast';

export type AlertContent = {
  descriptor: string;
  className: string | null;
  name: string;
  when: string;
  measured: string;
  exposure: { kind: ExposureKind; text: string }[];
  rain: string | null;
  footer: string;
  link: string;
  message: string;
};

/**
 * Text of the alert card and of the WhatsApp message, in one language
 * (not necessarily the page's: the user can preview PT and EN).
 */
export function buildAlert(
  language: Language,
  hotspot: Hotspot['properties'],
  stats: HotspotStats,
  pass: HotspotStats['passes'][number],
  forecast: Forecast | null,
): AlertContent {
  const t = i18n.getFixedT(language);
  const cls = hotspot.dominant_class;
  const area = formatNumber(pass.affected_area_km2, language, pass.affected_area_km2 < 10 ? 1 : 0);
  const measured = t(`alert.measured.${cls ?? 'stable'}`, { area });
  const exposure = stats.exposure.map((e) => ({
    kind: e.kind,
    text: `${e.label[language]}: ${e.value[language]}`,
  }));
  // Rule 8: an old forecast is not part of an alert.
  const rain =
    forecast && isFresh(forecast)
      ? t('alert.rain', {
          total: formatNumber(totalRain(forecast), language),
          days: forecast.days.length,
        })
      : null;
  const sample = Boolean(stats.metadata?.sample);
  const hypothesis = stats.hypothesis
    ? t('alert.hypothesis', { text: stats.hypothesis.text[language] })
    : '';
  const footer = [
    hypothesis,
    t('alert.sources', { sources: stats.sources.join(', ') }),
    sample ? t('common.sampleData') + '.' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const link = `${window.location.origin}/app?hotspot=${hotspot.id}&lang=${language}`;
  const when = t('alert.when', { date: formatDate(pass.date, language) });

  const message = [
    t('alert.messageTitle', { name: hotspot.name[language] }),
    t('alert.messageMeasured', { measured, date: formatDate(pass.date, language) }),
    exposure.map((e) => e.text).join('. ') + (exposure.length ? '.' : ''),
    rain ? `${rain}.` : '',
    hypothesis,
    sample ? t('common.sampleData') + '.' : '',
    t('alert.messageLink', { link }),
  ]
    .filter(Boolean)
    .join('\n');

  return {
    descriptor: t('alert.descriptor'),
    className: cls ? t(`classes.${cls}`) : null,
    name: hotspot.name[language],
    when,
    measured,
    exposure,
    rain,
    footer,
    link,
    message,
  };
}
