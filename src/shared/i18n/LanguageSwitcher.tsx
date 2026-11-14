import { useTranslation } from 'react-i18next';
import { changeLanguage, HTML_LANG, LANGUAGES } from '.';
import styles from './LanguageSwitcher.module.css';
import { useLanguage } from './useLanguage';

/** PT/EN buttons for the header. The choice goes to the URL (`?lang=`). */
export function LanguageSwitcher() {
  const { t } = useTranslation();
  const current = useLanguage();

  return (
    <div role="group" aria-label={t('header.languageGroup')} className={styles.group}>
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          lang={HTML_LANG[language]}
          aria-pressed={language === current}
          className={styles.option}
          onClick={() => changeLanguage(language)}
        >
          {/* Accessible name "PT Português": keeps the visible text (WCAG 2.5.3). */}
          {t(`language.${language}.short`)}
          <span className="visually-hidden"> {t(`language.${language}.name`)}</span>
        </button>
      ))}
    </div>
  );
}
