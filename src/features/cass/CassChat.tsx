import { type FormEvent, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../../shared/i18n';
import { useLanguage } from '../../shared/i18n/useLanguage';
import type { Hotspot, HotspotCollection } from '../../shared/lib/hotspotSchema';
import { CassPose } from '../../shared/ui/CassPose';
import { Icon } from '../../shared/ui/Icon';
import { IconButton } from '../../shared/ui/IconButton';
import { type AgentAnswer, AgentUnavailableError, askAgent } from './agentApi';
import { CassAnswer } from './CassAnswer';
import styles from './CassChat.module.css';
import { answerDemo, detectIntent, type Intent, INTENTS } from './demoAgent';

type Message =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'cass'; answer: AgentAnswer; language: Language };

type CassChatProps = { hotspot: Hotspot; allHotspots: HotspotCollection };

/**
 * "Perguntar ao Cass". Asks /api/agente; while the agent is not deployed
 * (the service answers something that is not the contract), switches to
 * demo mode and says so on screen.
 */
export default function CassChat({ hotspot, allHotspots }: CassChatProps) {
  const { t } = useTranslation();
  const language = useLanguage();
  const inputId = useId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'error'>('idle');
  const [demo, setDemo] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<{ text: string; intent: Intent | null } | null>(
    null,
  );
  const logRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const id = hotspot.properties.id;
  const name = (hotspot.properties.short_name ?? hotspot.properties.name)[language];

  // Keep the newest message in view.
  useEffect(() => {
    logRef.current?.lastElementChild?.scrollIntoView({ block: 'nearest' });
  }, [messages, status]);

  async function ask(question: string, intent: Intent | null, addUserMessage = true) {
    if (status === 'thinking') return;
    if (addUserMessage) {
      setMessages((m) => [...m, { id: nextId.current++, role: 'user', text: question }]);
    }
    setLastQuestion({ text: question, intent });
    setStatus('thinking');
    try {
      let answer: AgentAnswer;
      if (demo) {
        answer = await answerDemo(intent ?? detectIntent(question), id, allHotspots, language);
      } else {
        try {
          answer = await askAgent(question, id, language);
        } catch (error) {
          if (!(error instanceof AgentUnavailableError)) throw error;
          console.warn('Cass agent not deployed yet, using demo mode:', error.message);
          setDemo(true);
          answer = await answerDemo(intent ?? detectIntent(question), id, allHotspots, language);
        }
      }
      setMessages((m) => [...m, { id: nextId.current++, role: 'cass', answer, language }]);
      setStatus('idle');
    } catch (error) {
      console.error('Cass could not answer:', error);
      setStatus('error');
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const question = text.trim();
    if (!question) return;
    setText('');
    void ask(question, null);
  }

  return (
    <div className={styles.chat}>
      <div className={styles.scroll}>
        <div className={styles.intro}>
          <CassPose pose="ola" width={72} />
          <div>
            <h2 className={styles.title}>{t('cass.introTitle')}</h2>
            <p className={styles.muted}>{t('cass.introText')}</p>
          </div>
        </div>

        {demo && (
          <div role="note" className={styles.demo}>
            <Icon name="info" size={20} />
            <p>{t('cass.demoNotice')}</p>
          </div>
        )}

        <div>
          <p className={styles.label}>{t('cass.suggestionsLabel', { name })}</p>
          <div className={styles.suggestions}>
            {INTENTS.map((intent) => {
              const question = t(`cass.suggestions.${intent}`, { name });
              return (
                <button
                  key={intent}
                  type="button"
                  className={styles.suggestion}
                  disabled={status === 'thinking'}
                  onClick={() => void ask(question, intent)}
                >
                  {question}
                </button>
              );
            })}
          </div>
        </div>

        <div ref={logRef} role="log" aria-label={t('cass.log')} className={styles.log}>
          {messages.map((message) =>
            message.role === 'user' ? (
              <p key={message.id} className={styles.user}>
                {message.text}
              </p>
            ) : (
              <CassAnswer key={message.id} answer={message.answer} language={message.language} />
            ),
          )}
          {status === 'thinking' && (
            <div className={styles.thinking} role="status" aria-label={t('cass.thinking')}>
              <CassPose pose="tecnico" width={56} />
              <span aria-hidden="true" className={styles.dots}>
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
          {status === 'error' && (
            <div role="alert" className={styles.error}>
              <CassPose pose="atento" width={64} />
              <div>
                <p>
                  <strong>{t('cass.errorTitle')}</strong>
                </p>
                <p className={styles.muted}>{t('cass.errorText')}</p>
                {lastQuestion && (
                  <button
                    type="button"
                    className={styles.retry}
                    onClick={() => void ask(lastQuestion.text, lastQuestion.intent, false)}
                  >
                    {t('cass.retry')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <form className={styles.form} onSubmit={submit}>
        <label htmlFor={inputId} className="visually-hidden">
          {t('cass.inputLabel')}
        </label>
        <div className={styles.inputRow}>
          <textarea
            id={inputId}
            rows={2}
            value={text}
            placeholder={t('cass.placeholder')}
            className={styles.input}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              // Enter sends; Shift+Enter makes a new line.
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <IconButton
            icon="send"
            type="submit"
            variant="filled"
            label={t('cass.send')}
            disabled={status === 'thinking' || text.trim() === ''}
          />
        </div>
        <p className={styles.disclaimer}>{t('cass.disclaimer')}</p>
      </form>
    </div>
  );
}
