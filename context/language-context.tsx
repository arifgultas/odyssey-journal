/**
 * Language Context Provider
 * Provides language state and switching throughout the app
 */

import {
    getCurrentLanguage,
    isRTL,
    LanguageCode,
    loadPersistedLanguage,
    setLanguage as setI18nLanguage,
    SUPPORTED_LANGUAGES,
    t,
} from '@/lib/i18n';
import { ProfileService } from '@/lib/profile-service';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, I18nManager } from 'react-native';

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

/**
 * Brings the native layout direction in line with the language.
 *
 * React Native decides direction once, natively, at startup; forceRTL only takes effect on
 * the next launch. So the most this can do in the running app is record the new direction
 * and tell the reader to reopen it. The setting survives the restart, which is why a reader
 * who already had Arabic selected gets a right-to-left layout from the first frame and
 * never sees this message.
 *
 * @returns true when the direction changed and a restart is needed
 */
function applyLayoutDirection(code: LanguageCode): boolean {
    const shouldBeRTL = isRTL(code);
    if (shouldBeRTL === I18nManager.isRTL) return false;

    I18nManager.allowRTL(true);
    I18nManager.forceRTL(shouldBeRTL);
    return true;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
    const [isReady, setIsReady] = useState(false);

    // Load persisted language on mount
    useEffect(() => {
        const init = async () => {
            const persistedLang = await loadPersistedLanguage();
            setCurrentLanguage(persistedLang);
            // Deliberately silent. A mismatch here is either a direction written on a
            // previous run, or a first launch on an Arabic device - and prompting on
            // startup risks nagging on every launch if forceRTL fails to persist.
            // Recording it is enough: the next launch comes up in the right direction.
            applyLayoutDirection(persistedLang);
            setIsReady(true);
            // Covers users who never open the language picker: their push notifications
            // should still match the language the app is actually running in.
            void ProfileService.syncPreferredLanguage(persistedLang);
        };
        init();
    }, []);

    // Change language function
    const setLanguage = useCallback(async (code: LanguageCode) => {
        await setI18nLanguage(code);
        setCurrentLanguage(code);
        // Let the server know, so push notifications arrive in this language too
        void ProfileService.syncPreferredLanguage(code);

        // Switching between an LTR and an RTL language needs a relaunch. The wording comes
        // from the language just chosen, so the reader can act on it.
        if (applyLayoutDirection(code)) {
            Alert.alert(t('settings.restartTitle'), t('settings.restartMessage'), [
                { text: t('common.ok') },
            ]);
        }
    }, []);

    // Translation function - depends on language to trigger re-renders
    const translate = useCallback((key: string, options?: Record<string, any>): string => {
        // Including language in the dependency ensures components re-render when language changes
        return t(key, options);
    }, [language]); // Re-create when language changes

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
        return {
            language: getCurrentLanguage(),
            setLanguage: async () => {},
            t: (key: string, options?: Record<string, any>) => t(key, options),
            languages: SUPPORTED_LANGUAGES,
            isReady: true,
        };
    }
    return context;
}

export default LanguageProvider;
