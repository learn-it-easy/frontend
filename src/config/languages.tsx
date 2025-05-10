import { LanguageCode } from '../types/translations';

export const SUPPORTED_LANGUAGES: { code: LanguageCode; name: string }[] = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
];

export const getLanguageName = (code: LanguageCode): string => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : 'Unknown';
};