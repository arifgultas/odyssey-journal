import * as WebBrowser from 'expo-web-browser';
import { getCurrentLanguage, SUPPORTED_LANGUAGES } from './i18n';

export const SITE_URL = 'https://odysseyjournal.app';

// The site serves English at the root and every other language under /<code>/, the same twelve
// codes as the app (zh included). Anything else falls back to the English root.
export function siteUrl(path: string, language: string = getCurrentLanguage()) {
    const prefix = language !== 'en' && language in SUPPORTED_LANGUAGES ? `/${language}` : '';
    return `${SITE_URL}${prefix}${path}`;
}

// Where the sign-up confirmation link lands: a site page, in the reader's language, that says the
// address is confirmed and offers to open the app. Supabase only redirects to URLs matching
// Authentication → URL Configuration → Redirect URLs (`https://odysseyjournal.app/**`); anything
// else falls back to the bare Site URL.
export function emailConfirmedUrl(language: string) {
    return siteUrl('/email-confirmed', language);
}

// Legal pages live on the public site, in each language; the store listings use the English ones.
const LEGAL_PATHS = {
    terms: '/terms',
    privacy: '/privacy-policy',
    support: '/support',
} as const;

export type LegalPage = keyof typeof LEGAL_PATHS;

export function legalPageUrl(page: LegalPage, language: string = getCurrentLanguage()) {
    return siteUrl(LEGAL_PATHS[page], language);
}

// Same addresses as the website's /support and /delete-account pages.
export const LEGAL_EMAILS = {
    privacy: 'privacy@odysseyjournal.app',
    support: 'support@odysseyjournal.app',
} as const;

// Opens in the app's current language
export function openLegalPage(page: LegalPage) {
    return WebBrowser.openBrowserAsync(legalPageUrl(page));
}

// Google / Apple sign-in stay hidden until both providers are configured in Supabase
// (Authentication → Providers). Apple guideline 4.8: Google may only ship alongside Apple.
export const SOCIAL_SIGN_IN_ENABLED = false;
