/**
 * i18n Configuration
 * Internationalization setup using i18n-js and expo-localization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

// Import translations
import ar from './translations/ar';
import de from './translations/de';
import en from './translations/en';
import es from './translations/es';
import fr from './translations/fr';
import it from './translations/it';
import ja from './translations/ja';
import ko from './translations/ko';
import pt from './translations/pt';
import ru from './translations/ru';
import tr from './translations/tr';
import zh from './translations/zh';

// Storage key for persisting language preference
const LANGUAGE_KEY = '@odyssey_language';

// Supported languages (ordered by usage/importance)
export const SUPPORTED_LANGUAGES = {
    tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
    es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Create i18n instance with all translations
const i18n = new I18n({
    ar,
    de,
    en,
    es,
    fr,
    it,
    ja,
    ko,
    pt,
    ru,
    tr,
    zh,
});

// Default configuration
i18n.defaultLocale = 'tr';
i18n.enableFallback = true;

// Get device locale
const getDeviceLocale = (): LanguageCode => {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
        const locale = locales[0].languageCode;
        if (locale && locale in SUPPORTED_LANGUAGES) {
            return locale as LanguageCode;
        }
    }
    return 'tr'; // Default to Turkish
};

// Initialize with device locale
i18n.locale = getDeviceLocale();

/**
 * Get the current language code
 */
export const getCurrentLanguage = (): LanguageCode => {
    return i18n.locale as LanguageCode;
};

/**
 * Set language and persist to storage
 */
export const setLanguage = async (languageCode: LanguageCode): Promise<void> => {
    i18n.locale = languageCode;
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
};

/**
 * Load persisted language from storage
 */
export const loadPersistedLanguage = async (): Promise<LanguageCode> => {
    try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
            i18n.locale = savedLanguage;
            return savedLanguage as LanguageCode;
        }
    } catch (error) {
        console.error('Error loading persisted language:', error);
    }
    return getDeviceLocale();
};

/**
 * Translate function with type safety
 */
export const t = (key: string, options?: Record<string, any>): string => {
    const translation = i18n.t(key, options);
    if (typeof translation === 'string' && (translation.startsWith('[missing "') || translation.startsWith('[MISSING "'))) {
        return '';
    }
    return translation;
};

/**
 * Check if a translation key exists
 */
export const hasTranslation = (key: string): boolean => {
    const translation = i18n.t(key, { defaultValue: '__MISSING__' });
    return translation !== '__MISSING__';
};

/**
 * Get all supported language codes
 */
export const getSupportedLanguages = (): LanguageCode[] => {
    return Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
};

/**
 * Get language info by code
 */
export const getLanguageInfo = (code: LanguageCode) => {
    return SUPPORTED_LANGUAGES[code];
};

/**
 * Check if language is RTL (Right-to-Left)
 */
export const isRTL = (code: LanguageCode): boolean => {
    return code === 'ar';
};

export { i18n };
export default i18n;

