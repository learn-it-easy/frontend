import { Translation, LanguageCode } from '../types/translations';
import ru from '../locales/ru.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';


const translations: Record<LanguageCode, Translation> = {
  ru, en, es, de, fr
};

export const getTranslations = (lang: LanguageCode): Translation => {
  return translations[lang] || translations.ru;
};