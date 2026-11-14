import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../shared/i18n/LanguageSwitcher';
import { ThemeToggle } from '../../shared/theme/ThemeToggle';
import { Brand } from '../../shared/ui/Brand';
import { Link } from '../../shared/ui/Link';
import styles from './LandingHeader.module.css';

export function LandingHeader({ mapHref }: { mapHref: string }) {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="#main" className={styles.home} aria-label={t('header.home')}>
          <Brand descriptor={t('brand.descriptor')} />
        </a>
        <nav aria-label={t('landing.nav.label')} className={styles.nav}>
          <a href="#lentes">{t('landing.nav.lenses')}</a>
          <a href="#como-funciona">{t('landing.nav.how')}</a>
          <a href="#radar">{t('landing.nav.radar')}</a>
          <a href="#validacao">{t('landing.nav.validation')}</a>
        </nav>
        <div className={styles.controls}>
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href={mapHref} className={styles.open}>
            {t('landing.openMapShort')}
          </Link>
        </div>
      </div>
    </header>
  );
}
