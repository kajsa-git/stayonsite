
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, TranslationKey, AvailableLanguages } from '../data/translations';

interface LanguageContextType {
  language: AvailableLanguages;
  setLanguage: (lang: AvailableLanguages) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<AvailableLanguages>('sv');

  const t = (key: TranslationKey): string => {
    const value = translations[language][key];
    return value !== undefined ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
