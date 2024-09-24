import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import i18n from 'i18next';
import * as Updates from 'expo-updates';

const LANGUAGE_STORAGE_KEY = 'current-language';

interface LanguageContextType {
  currentLanguage: 'en' | 'ar';
  changeLanguage: (language: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    Localization.getLocales()[0].languageCode ?? 'en'
  );

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage) {
        i18n.changeLanguage(storedLanguage);
        setCurrentLanguage(storedLanguage);
        handleRTL(storedLanguage);
      } else {
        const defaultLanguage = Localization.getLocales()[0].languageCode?.startsWith('ar')
          ? 'ar'
          : 'en';
        i18n.changeLanguage(defaultLanguage);
        setCurrentLanguage(defaultLanguage);
        handleRTL(defaultLanguage);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (language: string) => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
    handleRTL(language);
  };

  const handleRTL = (language: string) => {
    if (language.startsWith('ar')) {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }
    // You need to reload the app for the changes to take effect
    if (I18nManager.isRTL !== language.startsWith('ar')) {
      I18nManager.allowRTL(language.startsWith('ar'));
      I18nManager.forceRTL(language.startsWith('ar'));
      // Restart the app to apply changes
      Updates.reloadAsync();
    }
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage: currentLanguage as 'en' | 'ar', changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
