import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME_ID, THEMES, THEME_OPTIONS } from '../constants/theme';

const THEME_STORAGE_KEY = '@al-noor/theme';
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        let active = true;

        AsyncStorage.getItem(THEME_STORAGE_KEY)
            .then((storedThemeId) => {
                if (active && storedThemeId && THEMES[storedThemeId]) {
                    setThemeId(storedThemeId);
                }
            })
            .catch((error) => console.warn('Unable to restore theme preference:', error))
            .finally(() => active && setIsHydrated(true));

        return () => {
            active = false;
        };
    }, []);

    const setTheme = useCallback((nextThemeId) => {
        if (!THEMES[nextThemeId]) {
            console.warn(`Unknown theme preference: ${nextThemeId}`);
            return false;
        }

        setThemeId(nextThemeId);
        AsyncStorage.setItem(THEME_STORAGE_KEY, nextThemeId)
            .catch((error) => console.warn('Unable to save theme preference:', error));
        return true;
    }, []);

    const value = useMemo(() => ({
        themeId,
        colors: THEMES[themeId].colors,
        themes: THEME_OPTIONS,
        setTheme,
        isHydrated,
    }), [themeId, setTheme, isHydrated]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
