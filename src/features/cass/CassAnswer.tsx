import { useTranslation } from 'react-i18next';
import { HTML_LANG, type Language } from '../../shared/i18n';
import { Icon } from '../../shared/ui/Icon';
import type { AgentAnswer } from './agentApi';
import styles from './CassChat.module.css';

/** Turns "**212 km²** of water" into text with <strong>, without HTML injection. */
function withBold(paragraph: string) {
  return paragraph
    .split('**')
    .map((part, index) => (index % 2 === 1 ? <strong key={index}>{part}</strong> : part));
}

/** One answer from Cass: tools used, text, optional note and sources. */
export function CassAnswer({ answer, language }: { answer: AgentAnswer; language: Language }) {
  const { t } = useTranslation();
  return (
    <div className={styles.answer} lang={HTML_LANG[language]}>
      <img
        src="/img/cass/icone.webp"
        alt={t('cass.name')}
        width={36}
        height={39}
        className={styles.avatar}
      />
      <div className={styles.bubble}>
        {answer.tools.length > 0 && (
          <p className={styles.tools}>
            {answer.tools.map((tool) => (
              <span key={tool} className={styles.tool}>
                <Icon name="tool" size={12} strokeWidth={2.4} />
                {tool}
              </span>
            ))}
          </p>
        )}
        <div className={styles.paragraphs}>
          {answer.paragraphs.map((p) => (
            <p key={p}>{withBold(p)}</p>
          ))}
        </div>
        {answer.note && (
          <div role="note" className={styles.answerNote}>
            <Icon name="warning" size={18} />
            <span>{answer.note}</span>
          </div>
        )}
        {answer.sources.length > 0 && (
          <ul className={styles.sources} aria-label={t('sources.title')}>
            {answer.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
