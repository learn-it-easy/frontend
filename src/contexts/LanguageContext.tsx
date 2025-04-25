import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../types/translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const defaultLanguage: LanguageCode = 'ru';

export const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>(defaultLanguage);

  useEffect(() => {
    const savedLanguage = Cookies.get('lang');
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as LanguageCode)) {
      setLanguage(savedLanguage as LanguageCode);
    }
  }, []);

  const handleSetLanguage = (lang: LanguageCode) => {
    Cookies.set('lang', lang, { expires: 365 });
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};