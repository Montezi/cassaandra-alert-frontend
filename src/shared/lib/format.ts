import type { Language } from '../i18n';

/**
 * Number and date formatting per language. Dates from the pipeline are
 * calendar days ("2026-11-12"), so they are read and shown in UTC: otherwise
 * a browser west of Greenwich would show the day before.
 */

const LOCALE: Record<Language, string> = { pt: 'pt-BR', en: 'en-US' };

export function formatNumber(value: number, language: Language, digits = 0): string {
  return new Intl.NumberFormat(LOCALE[language], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** 0.86 -> "86%" */
export function formatPercent(fraction: number, language: Language): string {
  return new Intl.NumberFormat(LOCALE[language], { style: 'percent' }).format(fraction);
}

function utcDate(isoDate: string): Date {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
}

/** "12 nov 2026" / "Nov 12, 2026" */
export function formatDate(isoDate: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(utcDate(isoDate))
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

/** "12 nov" / "Nov 12" */
export function formatShortDate(isoDate: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
    .format(utcDate(isoDate))
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

/** "jan 2026" / "Jan 2026" */
export function formatMonthYear(isoDate: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
    .format(utcDate(isoDate))
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

/** "sáb 15" / "Sat 15" */
export function formatWeekday(isoDate: string, language: Language): string {
  const date = utcDate(isoDate);
  const weekday = new Intl.DateTimeFormat(LOCALE[language], { weekday: 'short', timeZone: 'UTC' })
    .format(date)
    .replace(/\./g, '');
  return `${weekday} ${date.getUTCDate()}`;
}

/** Date and time in the user's own time zone: "14 nov, 06:00". */
export function formatDateTime(isoDateTime: string, language: Language): string {
  return new Intl.DateTimeFormat(LOCALE[language], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
    .format(new Date(isoDateTime))
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
}

/** Whole days between a calendar day and now. */
export function daysSince(isoDate: string, now = new Date()): number {
  return Math.floor((now.getTime() - utcDate(isoDate).getTime()) / 86_400_000);
}
