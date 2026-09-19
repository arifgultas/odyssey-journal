import * as WebBrowser from 'expo-web-browser';

// Legal pages live on the public site; the store listings point to the same URLs.
export const LEGAL_URLS = {
    terms: 'https://odysseyjournal.app/terms',
    privacy: 'https://odysseyjournal.app/privacy-policy',
    support: 'https://odysseyjournal.app/support',
} as const;

export function openLegalPage(page: keyof typeof LEGAL_URLS) {
    return WebBrowser.openBrowserAsync(LEGAL_URLS[page]);
}

// Google / Apple sign-in stay hidden until both providers are configured in Supabase
// (Authentication → Providers). Apple guideline 4.8: Google may only ship alongside Apple.
export const SOCIAL_SIGN_IN_ENABLED = false;
