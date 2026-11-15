import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getUrlParam, setUrlParam } from '../lib/urlState';
import en from './en.json';
import pt from './pt.json';

/** Order of the language buttons: English first, as it is the default. */
export const LANGUAGES = ['en', 'pt'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Value for <html lang>; screen readers use it to pick the voice. */
export const HTML_LANG: Record<Language, string> = { pt: 'pt-BR', en: 'en' };

export function isLanguage(value: unknown): value is Language {
  return value === 'pt' || value === 'en';
}

/**
 * English by default (the judges and most visitors read English). Only the
 * URL changes it, so a shared Portuguese link keeps its language (?lang=pt).
 */
export const DEFAULT_LANGUAGE: Language = 'en';

function initialLanguage(): Language {
  const fromUrl = getUrlParam('lang');
  return isLanguage(fromUrl) ? fromUrl : DEFAULT_LANGUAGE;
}

i18n.on('languageChanged', (language) => {
  if (!isLanguage(language)) return;
  document.documentElement.lang = HTML_LANG[language];
  document.title = i18n.t('app.title');
});

void i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    // `satisfies` makes the build fail if en.json is missing a key from pt.json.
    en: { translation: en satisfies typeof pt },
  },
  lng: initialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...LANGUAGES],
  // Resources are bundled, so init synchronously and never suspend.
  initAsync: false,
  react: { useSuspense: false },
  // React already escapes text.
  interpolation: { escapeValue: false },
});

/** Switches the language and records it in the URL (`?lang=en`). */
export function changeLanguage(language: Language): void {
  setUrlParam('lang', language);
  void i18n.changeLanguage(language);
}

export default i18n;
