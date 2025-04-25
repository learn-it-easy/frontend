import { useTranslation } from '../hooks/useTranslation';
import { useContext, useMemo} from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

export const useValidations = () => {
  const { t } = useTranslation();
  const { language } = useContext(LanguageContext);

  // Мемоизируем функции валидации, для обновления при смене языка
  const validations = useMemo(() => ({
    validateEmail: (email: string): boolean => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    validateUsername: (username: string): string => {
      if (!username.trim()) return t.validation.usernameRequired;
      if (username.length < 3 || username.length > 20) return t.validation.usernameLength;
      return '';
    },
    validatePassword: (password: string, isRequired = true): string => {
      if (isRequired && !password) return t.validation.passwordRequired;
      if (password && (password.length < 8 || password.length > 16)) {
        return t.validation.passwordLength;
      }
      return '';
    },
    validateLanguage: (languageId: number): string => {
      return languageId === 0 ? t.validation.chooseLanguage : '';
    }
  }), [t, language]);

  return validations;
};