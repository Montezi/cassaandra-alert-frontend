import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../shared/i18n/LanguageSwitcher';
import { useLanguage } from '../shared/i18n/useLanguage';
import { ThemeToggle } from '../shared/theme/ThemeToggle';
import { Brand } from '../shared/ui/Brand';
import { Link } from '../shared/ui/Link';
import { EnsoBadge } from './EnsoBadge';
import styles from './Header.module.css';

/** Header of the map page: brand, El Niño status, language and theme. */
export function Header() {
  const { t } = useTranslation();
  const language = useLanguage();

  return (
    <header className={styles.header}>
      <Link href={`/?lang=${language}`} className={styles.home} aria-label={t('header.home')}>
        <Brand size="sm" />
      </Link>
      <span aria-hidden="true" className={styles.divider} />
      <EnsoBadge />
      <span className={styles.spacer} />
      <div className={styles.controls}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
