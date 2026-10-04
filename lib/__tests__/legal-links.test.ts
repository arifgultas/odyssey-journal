jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn() }));

import { emailConfirmedUrl, legalPageUrl, siteUrl } from '../legal-links';
import { generatePostShareUrl } from '../share';
import { setLanguage } from '../i18n';

describe('site links follow the language', () => {
    it('serves English at the root', () => {
        expect(legalPageUrl('privacy', 'en')).toBe('https://odysseyjournal.app/privacy-policy');
        expect(legalPageUrl('terms', 'en')).toBe('https://odysseyjournal.app/terms');
    });

    it('puts every other language under its code, zh included', () => {
        expect(legalPageUrl('privacy', 'tr')).toBe('https://odysseyjournal.app/tr/privacy-policy');
        expect(legalPageUrl('terms', 'zh')).toBe('https://odysseyjournal.app/zh/terms');
        expect(emailConfirmedUrl('ar')).toBe('https://odysseyjournal.app/ar/email-confirmed');
    });

    it('falls back to English for a code the site does not have', () => {
        expect(siteUrl('/support', 'xx')).toBe('https://odysseyjournal.app/support');
    });

    it('shares posts on the home page in the app language', async () => {
        await setLanguage('de');
        expect(generatePostShareUrl('abc')).toBe('https://odysseyjournal.app/de/?post=abc');
        await setLanguage('en');
        expect(generatePostShareUrl('abc')).toBe('https://odysseyjournal.app/?post=abc');
    });
});
