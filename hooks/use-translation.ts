/**
 * useTranslation Hook
 * Custom hook for accessing translations with auto-refresh on language change
 */

import {
    getCurrentLanguage,
    getLanguageInfo,
    getSupportedLanguages,
    LanguageCode,
    loadPersistedLanguage,
    setLanguage,
    SUPPORTED_LANGUAGES,
    t,
} from '@/lib/i18n';
import { useCallback, useEffect, useState } from 'react';

interface UseTranslationReturn {
    t: (key: string, options?: Record<string, any>) => string;
    language: LanguageCode;
    setLanguage: (code: LanguageCode) => Promise<void>;
    languages: typeof SUPPORTED_LANGUAGES;
    isReady: boolean;
}

/**
 * Hook for using translations in components
 * 
 * @example
 * const { t, language, setLanguage } = useTranslation();
 * 
 * <Text>{t('home.title')}</Text>
 * <Button onPress={() => setLanguage('en')} title={t('settings.language')} />
 */
export function useTranslation(): UseTranslationReturn {
    const [language, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
    const [isReady, setIsReady] = useState(false);
    const [, setForceUpdate] = useState(0);

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
    const changeLanguage = useCallback(async (code: LanguageCode) => {
        await setLanguage(code);
        setCurrentLanguage(code);
        // Force re-render to update all translations
        setForceUpdate(prev => prev + 1);
    }, []);

    // Translation function
    const translate = useCallback((key: string, options?: Record<string, any>): string => {
        return t(key, options);
    }, [language]); // Re-create when language changes

    return {
        t: translate,
        language,
        setLanguage: changeLanguage,
        languages: SUPPORTED_LANGUAGES,
        isReady,
    };
}

/**
 * Get language display name
 */
export function useLanguageInfo(code: LanguageCode) {
    return getLanguageInfo(code);
}

/**
 * Get all supported language codes
 */
export function useSupportedLanguages() {
    return getSupportedLanguages();
}

export default useTranslation;
