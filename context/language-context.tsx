/**
 * Language Context Provider
 * Provides language state and switching throughout the app
 */

import {
    getCurrentLanguage,
    LanguageCode,
    loadPersistedLanguage,
    setLanguage as setI18nLanguage,
    SUPPORTED_LANGUAGES,
    t,
} from '@/lib/i18n';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (code: LanguageCode) => Promise<void>;
    t: (key: string, options?: Record<string, any>) => string;
    languages: typeof SUPPORTED_LANGUAGES;
    isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
    const [isReady, setIsReady] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);

    // Load persisted language on mount
    useEffect(() => {
        const init = async () => {
            const persistedLang = await loadPersistedLanguage();
            setCurrentLanguage(persistedLang);
            setIsReady(true);
        };
        init();
    }, []);

    // Change language function
    const setLanguage = useCallback(async (code: LanguageCode) => {
        await setI18nLanguage(code);
        setCurrentLanguage(code);
        // Force re-render of all components using translations
        setUpdateKey(prev => prev + 1);
    }, []);

    // Translation function
    const translate = useCallback((key: string, options?: Record<string, any>): string => {
        return t(key, options);
    }, [updateKey]); // Re-create when updateKey changes

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: translate,
        languages: SUPPORTED_LANGUAGES,
        isReady,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access language context
 * Must be used within a LanguageProvider
 */
export function useLanguage(): LanguageContextType {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageProvider;
