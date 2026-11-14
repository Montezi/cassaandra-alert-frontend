import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../shared/i18n/LanguageSwitcher';
import { ThemeToggle } from '../shared/theme/ThemeToggle';
import styles from './Header.module.css';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <h1 className={styles.name}>{t('app.name')}</h1>
        <p className={styles.slogan}>{t('app.slogan')}</p>
      </div>
      <div className={styles.controls}>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
