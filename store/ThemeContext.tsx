import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleTheme: () => { } });

function getInitialTheme(): boolean {
    const saved = localStorage.getItem('data-talim-theme');
    const isManual = localStorage.getItem('themeManual') === 'true';

    if (saved && isManual) {
        return saved === 'dark';
    }

    // First visit or non-manual: detect system theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(getInitialTheme);

    // Apply theme to DOM and persist
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('data-talim-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    // Listen for system theme changes when user hasn't manually toggled
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            if (localStorage.getItem('themeManual') !== 'true') {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = useCallback(() => {
        localStorage.setItem('themeManual', 'true');
        setIsDark(prev => !prev);
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
