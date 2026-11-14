import i18n, { type Language } from '../../shared/i18n';
import { forecastSnapshotSchema } from '../../shared/lib/forecastSchema';
import { formatDate, formatNumber, formatPercent, formatWeekday } from '../../shared/lib/format';
import type { HotspotCollection } from '../../shared/lib/hotspotSchema';
import { hotspotStatsSchema } from '../../shared/lib/statsSchema';
import { loadData } from '../../shared/lib/useData';
import type { AgentAnswer } from './agentApi';

/**
 * Demo mode, used while /api/agente is not deployed. No AI here: each answer
 * is assembled from the same /dados files the panel shows, so it can never
 * say something the data does not. The chat says clearly that it is a demo.
 */

export const INTENTS = ['changed', 'largest', 'rain', 'whyClass', 'cause'] as const;
export type Intent = (typeof INTENTS)[number];

/** Rough keyword match for typed questions (PT and EN). */
export function detectIntent(question: string): Intent | null {
  const q = question.toLowerCase();
  if (/chuv|chover|rain|forecast|previs/.test(q)) return 'rain';
  if (/maior|mais área|largest|most|biggest/.test(q)) return 'largest';
  if (/caus|explica|motivo|el niño|el nino|cause|because|reason/.test(q)) return 'cause';
  if (/por que|porque|why|não é|isn't|not a/.test(q)) return 'whyClass';
  if (/mudou|mudança|aconteceu|change|happen|what/.test(q)) return 'changed';
  return null;
}

export async function answerDemo(
  intent: Intent | null,
  hotspotId: string,
  hotspots: HotspotCollection,
  language: Language,
): Promise<AgentAnswer> {
  const t = i18n.getFixedT(language);
  const hotspot = hotspots.features.find((f) => f.properties.id === hotspotId)?.properties;
  if (!hotspot || intent === null) {
    return { paragraphs: [t('cass.demo.unknown')], tools: [], sources: [] };
  }
  const name = hotspot.name[language];
  const stats = await loadData(`stats/${hotspotId}.json`, hotspotStatsSchema);
  const last = stats.passes[stats.passes.length - 1];
  const cls = hotspot.dominant_class;
  const clsName = cls ? t(`classes.${cls}`).toLowerCase() : t('hotspots.noClass');
  const sampleNote = stats.metadata?.sample ? t('common.sampleData') : null;
  const radarSource = last
    ? `${stats.sources[0] ?? 'NISAR'}, ${formatDate(last.date, language)}`
    : '';

  switch (intent) {
    case 'changed': {
      if (!last) break;
      const area = formatNumber(
        last.affected_area_km2,
        language,
        last.affected_area_km2 < 10 ? 1 : 0,
      );
      const rule = stats.measured[0];
      const paragraphs = [
        t('cass.demo.changed', {
          name,
          from: formatDate(stats.baseline_date, language),
          to: formatDate(last.date, language),
          area,
          cls: clsName,
        }),
      ];
      if (rule)
        paragraphs.push(
          `${rule.measure[language]}: ${rule.value[language]}. ${rule.note[language]}`,
        );
      if (stats.hypothesis) {
        paragraphs.push(
          t('cass.demo.hypothesis', {
            text: stats.hypothesis.text[language],
            strength: t(`hypothesis.level.${stats.hypothesis.strength}`),
          }),
        );
      }
      return {
        paragraphs,
        tools: ['consultar_hotspot', 'explicar_classe'],
        sources: [
          radarSource,
          ...(stats.confidence !== null
            ? [t('cass.demo.confidence', { value: formatPercent(stats.confidence, language) })]
            : []),
          ...(sampleNote ? [sampleNote] : []),
        ],
      };
    }
    case 'largest': {
      const ranked = [...hotspots.features]
        .filter((f) => f.properties.affected_area_km2 !== null)
        .sort(
          (a, b) => (b.properties.affected_area_km2 ?? 0) - (a.properties.affected_area_km2 ?? 0),
        );
      const top = ranked[0]?.properties;
      if (!top || top.affected_area_km2 === null) break;
      const list = ranked
        .slice(0, 3)
        .map(
          (f) =>
            `${f.properties.name[language]} (${formatNumber(f.properties.affected_area_km2 ?? 0, language)} km²)`,
        )
        .join('; ');
      return {
        paragraphs: [
          t('cass.demo.largest', {
            name: top.name[language],
            area: formatNumber(top.affected_area_km2, language),
            cls: top.dominant_class ? t(`classes.${top.dominant_class}`).toLowerCase() : '',
          }),
          t('cass.demo.ranking', { list }),
        ],
        tools: ['listar_hotspots'],
        sources: ['NISAR GCOV', ...(sampleNote ? [sampleNote] : [])],
      };
    }
    case 'rain': {
      const snapshot = await loadData('forecast-snapshot.json', forecastSnapshotSchema);
      const days = snapshot.forecasts[hotspotId] ?? [];
      const peak = days.reduce(
        (a, b) => (b.precipitation_mm > a.precipitation_mm ? b : a),
        days[0],
      );
      if (!peak) break;
      const total = days.reduce((sum, d) => sum + d.precipitation_mm, 0);
      return {
        paragraphs: [
          t('cass.demo.rain', {
            total: formatNumber(total, language),
            days: days.length,
            peak: formatNumber(peak.precipitation_mm, language),
            day: formatWeekday(peak.date, language),
          }),
        ],
        tools: ['previsao_tempo'],
        sources: [
          t('cass.demo.snapshotSource', { date: formatDate(snapshot.updated_at, language) }),
          ...(snapshot.metadata?.sample ? [t('common.sampleData')] : []),
        ],
        note: t('cass.demo.rainNote'),
      };
    }
    case 'whyClass':
      return {
        paragraphs: [
          t('cass.demo.whyClass', { name, cls: clsName }),
          ...stats.measured.map(
            (r) => `${r.measure[language]}: ${r.value[language]}. ${r.note[language]}`,
          ),
        ],
        tools: ['explicar_classe'],
        sources: [radarSource, ...(sampleNote ? [sampleNote] : [])],
      };
    case 'cause':
      if (!stats.hypothesis) break;
      return {
        paragraphs: [
          t('cass.demo.hypothesis', {
            text: stats.hypothesis.text[language],
            strength: t(`hypothesis.level.${stats.hypothesis.strength}`),
          }),
          t('cass.demo.evidence', { text: stats.hypothesis.evidence[language] }),
        ],
        tools: ['consultar_hotspot'],
        sources: [...stats.sources.slice(0, 3), ...(sampleNote ? [sampleNote] : [])],
        note: t('hypothesis.disclaimer'),
      };
  }
  return { paragraphs: [t('cass.demo.noData', { name })], tools: [], sources: [] };
}
