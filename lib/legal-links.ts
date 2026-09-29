import * as WebBrowser from 'expo-web-browser';

export const SITE_URL = 'https://odysseyjournal.app';

// Where the sign-up confirmation link lands: a site page, in the reader's language, that says the
// address is confirmed and offers to open the app. The site serves English at the root and every
// other language under /<code>/, the same twelve codes as the app. Supabase only redirects to
// URLs matching Authentication → URL Configuration → Redirect URLs (`https://odysseyjournal.app/**`);
// anything else falls back to the bare Site URL.
export function emailConfirmedUrl(language: string) {
    return `${SITE_URL}${language === 'en' ? '' : `/${language}`}/email-confirmed`;
}

// Legal pages live on the public site; the store listings point to the same URLs.
export const LEGAL_URLS = {
    terms: 'https://odysseyjournal.app/terms',
    privacy: 'https://odysseyjournal.app/privacy-policy',
    support: 'https://odysseyjournal.app/support',
} as const;

// Same addresses as the website's /support and /delete-account pages.
export const LEGAL_EMAILS = {
    privacy: 'privacy@odysseyjournal.app',
    support: 'support@odysseyjournal.app',
} as const;

export function openLegalPage(page: keyof typeof LEGAL_URLS) {
    return WebBrowser.openBrowserAsync(LEGAL_URLS[page]);
}

// Google / Apple sign-in stay hidden until both providers are configured in Supabase
// (Authentication → Providers). Apple guideline 4.8: Google may only ship alongside Apple.
export const SOCIAL_SIGN_IN_ENABLED = false;
