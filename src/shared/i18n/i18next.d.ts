import 'i18next';
import type pt from './pt.json';

// Type-checks translation keys: t('app.nmae') fails the build.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof pt };
  }
}
