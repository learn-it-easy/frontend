import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { getTranslations } from '../utils/i18n';
import { Translation } from '../types/translations';

export const useTranslation = (): { t: Translation; language: string } => {
  const { language } = useContext(LanguageContext);
  const t = getTranslations(language);
  
  return { t, language };
};