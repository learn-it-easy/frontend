import { Translation, LanguageCode } from '../types/translations';
import ru from '../locales/ru.json';
import en from '../locales/en.json';


const translations: Record<LanguageCode, Translation> = {
  ru, en
};

export const getTranslations = (lang: LanguageCode): Translation => {
  return translations[lang] || translations.ru;
};