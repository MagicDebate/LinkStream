import { t, TranslationKey } from '@/i18n/translations';

export function useTranslation() {
  return {
    t: (key: TranslationKey) => t(key, 'ru'),
  };
}