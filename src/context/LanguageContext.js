import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../constants/translations';

const LanguageContext = createContext();
const LANGUAGE_STORAGE_KEY = '@al-noor/language';
const SUPPORTED_LANGUAGES = ['en', 'ur'];

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState('en');
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        let active = true;
        AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
            .then((storedLanguage) => {
                if (active && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
                    setLanguageState(storedLanguage);
                }
            })
            .catch((error) => console.warn('Unable to restore language preference:', error))
            .finally(() => active && setIsHydrated(true));

        return () => {
            active = false;
        };
    }, []);

    const setLanguage = useCallback((nextLanguage) => {
        if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return false;
        setLanguageState(nextLanguage);
        AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
            .catch((error) => console.warn('Unable to save language preference:', error));
        return true;
    }, []);

    const t = useCallback((key) => {
        const keys = key.split('.');
        let result = translations[language];

        for (const k of keys) {
            if (result && result[k]) {
                result = result[k];
            } else {
                return key; // return key if not found
            }
        }
        return result;
    }, [language]);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'en' ? 'ur' : 'en');
    }, [language, setLanguage]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        t,
        toggleLanguage,
        isHydrated,
    }), [language, setLanguage, t, toggleLanguage, isHydrated]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
