import React, { createContext, useState, useContext } from 'react';
import { translations } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // 'en' or 'ur'

    const t = (key) => {
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
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ur' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
