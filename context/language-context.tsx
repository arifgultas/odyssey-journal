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
    try {
        const shouldBeRTL = isRTL(code);
        if (shouldBeRTL === I18nManager.isRTL) return false;

        I18nManager.allowRTL(true);
        I18nManager.forceRTL(shouldBeRTL);
        return true;
    } catch (error) {
        // Called on the startup path, which the splash screen waits on. A direction we could
        // not write is worth one badly laid out launch, not a hung app.
        console.error('Error applying layout direction:', error);
        return false;
    }
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
    const [isReady, setIsReady] = useState(false);

    // Load persisted language on mount
    useEffect(() => {
        // Nothing before setIsReady is allowed to throw: the first frame waits on it
        // (app/_layout.tsx), so a failure here would hold the splash screen forever rather
        // than cost one wrong-language frame. loadPersistedLanguage and applyLayoutDirection
        // both swallow their own errors, and the push-language sync runs after the flag.
        // Keep it that way, and keep `try` out of this component - the React Compiler bails
        // out of the whole file over one, which would drop the memoisation t relies on.
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

    /**
     * The translation function handed to the rest of the app.
     *
     * `language` MUST be read inside the body, not only listed as a dependency. The React
     * Compiler (app.config.ts -> experiments.reactCompiler) re-derives dependencies from the
     * body and ignores the array, so a body that closed over nothing but the module-level `t`
     * was hoisted to module scope and kept one identity for the whole life of the app. Every
     * compiled component caches its strings as `if ($[n] !== t) { ... a translated string ... }`, so
     * a frozen `t` froze the text on screen in whatever language was active when that component
     * first mounted - which is exactly the bug where a screen kept showing Italian after the
     * reader had switched to English.
     *
     * Passing the locale through as data also makes the result a pure function of its arguments
     * rather than of the mutable `i18n.locale`. Keep `language` in the body.
     */
    const translate = useCallback(
        (key: string, options?: Record<string, any>): string => t(key, { locale: language, ...options }),
        [language],
    );

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
            t: (key: string, options?: Record<string, any>) =>
                t(key, { locale: getCurrentLanguage(), ...options }),
            languages: SUPPORTED_LANGUAGES,
            isReady: true,
        };
    }
    return context;
}

export default LanguageProvider;
