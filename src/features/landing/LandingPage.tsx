import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../shared/i18n/useLanguage';
import { classStyle, LENSES } from '../../shared/lib/classes';
import { Brand } from '../../shared/ui/Brand';
import { CassPose } from '../../shared/ui/CassPose';
import { Icon } from '../../shared/ui/Icon';
import { CLASS_ICON, type IconName } from '../../shared/ui/icons';
import { Link } from '../../shared/ui/Link';
import { useTheme } from '../../shared/theme/theme';
import { HeroGlobe } from './HeroGlobe';
import styles from './LandingPage.module.css';
import { LandingHeader } from './LandingHeader';

const STEPS = ['search', 'crop', 'measure', 'classify', 'explain'] as const;
const RADAR_FACTS: { id: 'lband' | 'hv' | 'coherence'; icon: IconName }[] = [
  { id: 'lband', icon: 'wave' },
  { id: 'hv', icon: 'tree' },
  { id: 'coherence', icon: 'layers' },
];
const VALIDATION = ['jrc', 'sentinel1', 'deter', 'firms'] as const;

/** Landing page: what the app does, how, and the way into the map. */
export default function LandingPage() {
  const { t } = useTranslation();
  const language = useLanguage();
  const theme = useTheme();
  const mapHref = `/app?lang=${language}`;

  return (
    <div className={styles.page}>
      <a href="#main" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <LandingHeader mapHref={mapHref} />

      <main id="main" tabIndex={-1} className={styles.main}>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroText}>
            <h1 id="landing-title" className={styles.heroTitle}>
              {t('landing.hero.line1')}
              <br />
              {t('landing.hero.line2')}
            </h1>
            <p className={styles.heroLead}>{t('landing.hero.lead')}</p>
            <div className={styles.ctas}>
              <Link href={mapHref} className={styles.primary}>
                {t('landing.openMap')}
              </Link>
              <a href="#radar" className={styles.secondary}>
                {t('landing.hero.howRadar')}
              </a>
            </div>
            <p className={styles.heroNote}>
              <Icon name="info" />
              <span>{t('landing.hero.note')}</span>
            </p>
          </div>
          <HeroGlobe />
        </section>

        <section id="lentes" className={styles.band} aria-labelledby="lenses-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <h2 id="lenses-title" className={styles.sectionTitle}>
                  {t('landing.lenses.title')}
                </h2>
                <p className={styles.sectionLead}>{t('landing.lenses.lead')}</p>
              </div>
              <CassPose pose="detectando" width={150} />
            </div>
            <div className={styles.cards}>
              {LENSES.map((lens) => (
                <article key={lens} className={styles.card} style={classStyle(lens)}>
                  <span className={styles.cardIcon}>
                    <Icon name={CLASS_ICON[lens]} size={24} />
                  </span>
                  <h3 className={styles.cardTitle}>{t(`classes.${lens}`)}</h3>
                  <p>{t(`landing.lenses.${lens}.text`)}</p>
                  <p className={styles.cardSource}>{t(`landing.lenses.${lens}.source`)}</p>
                </article>
              ))}
            </div>
            <p className={styles.soon}>{t('landing.lenses.soon')}</p>
          </div>
        </section>

        <section id="como-funciona" className={styles.section} aria-labelledby="how-title">
          <div className={`${styles.container} ${styles.split}`}>
            <figure className={styles.beforeAfter}>
              <div className={styles.pair}>
                <div className={styles.pairItem}>
                  <img
                    src="/img/landing/sar-antes.webp"
                    alt={t('landing.how.altBefore')}
                    width={760}
                    height={460}
                    loading="lazy"
                  />
                  <span className={styles.pairTag}>{t('landing.how.before')}</span>
                </div>
                <div className={styles.pairItem}>
                  <img
                    src="/img/landing/sar-agora.webp"
                    alt={t('landing.how.altNow')}
                    width={760}
                    height={460}
                    loading="lazy"
                  />
                  <span className={styles.pairTag}>{t('landing.how.now')}</span>
                </div>
              </div>
              <figcaption className={styles.caption}>{t('landing.how.caption')}</figcaption>
            </figure>
            <div>
              <h2 id="how-title" className={styles.sectionTitle}>
                {t('landing.how.title')}
              </h2>
              <ol className={styles.steps}>
                {STEPS.map((step, index) => (
                  <li key={step} className={styles.step}>
                    <span aria-hidden="true" className={styles.stepNumber}>
                      {index + 1}
                    </span>
                    <span>
                      <strong className={styles.stepTitle}>
                        {t(`landing.how.steps.${step}.title`)}
                      </strong>
                      <span className={styles.stepText}>{t(`landing.how.steps.${step}.text`)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="radar" className={styles.band} aria-labelledby="radar-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <h2 id="radar-title" className={styles.sectionTitle}>
                {t('landing.radar.title')}
              </h2>
              <CassPose pose="tecnico" width={170} />
            </div>
            <div className={styles.cards}>
              {RADAR_FACTS.map(({ id, icon }) => (
                <article key={id} className={styles.card}>
                  <span className={styles.plainIcon}>
                    <Icon name={icon} size={28} />
                  </span>
                  <h3 className={styles.cardTitle}>{t(`landing.radar.${id}.title`)}</h3>
                  <p>{t(`landing.radar.${id}.text`)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="brand-title">
          <div className={`${styles.container} ${styles.brandStory}`}>
            <img
              src={`/img/brand/simbolo-${theme}.webp`}
              alt={t('landing.brand.symbolAlt')}
              width={240}
              height={176}
              className={styles.bigSymbol}
              loading="lazy"
            />
            <div>
              <h2 id="brand-title" className={styles.sectionTitle}>
                {t('landing.brand.title')}
              </h2>
              <p className={styles.paragraph}>{t('landing.brand.story')}</p>
              <p className={styles.paragraph}>{t('landing.brand.symbol')}</p>
              <div className={styles.promise}>
                <CassPose pose="confiante" width={80} />
                <p>
                  <strong>{t('landing.brand.promiseTitle')}</strong> {t('landing.brand.promise')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="validacao" className={styles.band} aria-labelledby="validation-title">
          <div className={styles.container}>
            <h2 id="validation-title" className={styles.sectionTitle}>
              {t('landing.validation.title')}
            </h2>
            <p className={styles.sectionLead}>{t('landing.validation.lead')}</p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">{t('landing.validation.reference')}</th>
                    <th scope="col">{t('landing.validation.checks')}</th>
                    <th scope="col">{t('landing.validation.precision')}</th>
                    <th scope="col">F1</th>
                  </tr>
                </thead>
                <tbody>
                  {VALIDATION.map((row) => (
                    <tr key={row}>
                      <th scope="row">{t(`landing.validation.rows.${row}.name`)}</th>
                      <td>{t(`landing.validation.rows.${row}.checks`)}</td>
                      <td>{t('landing.validation.pending')}</td>
                      <td>{t('landing.validation.pending')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-title">
          <div className={`${styles.container} ${styles.ctaInner}`}>
            <div>
              <h2 id="cta-title" className={styles.ctaTitle}>
                {t('landing.cta.title')}
              </h2>
              <p className={styles.ctaText}>{t('landing.cta.text')}</p>
              <Link href={mapHref} className={styles.primary}>
                {t('landing.openMap')}
              </Link>
            </div>
            <CassPose pose="globo" width={220} alt={t('landing.cta.cassAlt')} />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}>
          <Brand size="sm" />
          <div className={styles.footerText}>
            <p>{t('landing.footer.data')}</p>
            <p>{t('landing.footer.ai')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
