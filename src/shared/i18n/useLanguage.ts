import { useTranslation } from 'react-i18next';
import { isLanguage, type Language } from '.';

/** Current language; re-renders the component when it changes. */
export function useLanguage(): Language {
  const { i18n } = useTranslation();
  return isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : 'pt';
}
