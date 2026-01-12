import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

const THEME_STORAGE_KEY = '@odyssey_theme_preference';

type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
    colorScheme: ColorSchemeName;
    themePreference: ThemePreference;
    setThemePreference: (preference: ThemePreference) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
    const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
        Appearance.getColorScheme()
    );
    const [isLoading, setIsLoading] = useState(true);

    // Load saved preference
    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedPreference && ['system', 'light', 'dark'].includes(savedPreference)) {
                    setThemePreferenceState(savedPreference as ThemePreference);
                }
            } catch (error) {
                console.error('Error loading theme preference:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadThemePreference();
    }, []);

    // Listen to system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemColorScheme(colorScheme);
        });

        return () => subscription.remove();
    }, []);

    // Determine actual color scheme
    const colorScheme: ColorSchemeName =
        themePreference === 'system' ? systemColorScheme : themePreference;

    const isDark = colorScheme === 'dark';

    // Save preference and update state
    const setThemePreference = useCallback(async (preference: ThemePreference) => {
        setThemePreferenceState(preference);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    }, []);

    // Don't render children until we've loaded the preference
    if (isLoading) {
        return null;
    }

    return (
        <ThemeContext.Provider
            value={{
                colorScheme,
                themePreference,
                setThemePreference,
                isDark,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
