/**
 * The language switch rides on `t(key, { locale })`.
 *
 * `context/language-context.tsx` hands the active language to i18n as data on every call,
 * rather than relying on the mutable module-level `i18n.locale`. That is what keeps the
 * translation function re-created per language under the React Compiler, which in turn is
 * what stops compiled components freezing their strings in the language that was active when
 * they first mounted. If a future i18n-js upgrade ever stops honouring a per-call locale,
 * every screen would quietly fall back to the module locale again - so assert it here.
 *
 * The compiled-output half of the same invariant lives in scripts/i18n-compiler-check.js.
 */
import i18n, { setLanguage, t } from '../i18n';

describe('per-call locale', () => {
    afterEach(async () => {
        await setLanguage('en');
    });

    it('translates in the requested language, whatever the module locale is', async () => {
        await setLanguage('en');

        expect(t('settings.passportHolder')).toBe('Passport Holder');
        expect(t('settings.passportHolder', { locale: 'it' })).toBe('Titolare del Passaporto');
        expect(t('post.boardingPass', { locale: 'it' })).toBe("Carta d'imbarco");
        expect(t('profile.kilometers', { locale: 'tr' })).toBe('Kilometre');
    });

    it('leaves the module locale alone, so non-React callers are unaffected', async () => {
        await setLanguage('en');

        t('settings.passportHolder', { locale: 'ja' });

        expect(i18n.locale).toBe('en');
        expect(t('settings.passportHolder')).toBe('Passport Holder');
    });

    it('still interpolates when a locale is passed alongside the values', async () => {
        await setLanguage('en');

        const withLocale = t('create.maxImages', { locale: 'it', count: 3 });
        const withoutLocale = t('create.maxImages', { count: 3 });

        expect(withLocale).toContain('3');
        expect(withoutLocale).toContain('3');
        expect(withLocale).not.toBe(withoutLocale);
    });

    it('falls back to English for a key a locale is missing, not to the module locale', async () => {
        await setLanguage('tr');

        // Every locale is complete (see i18n-parity.test.ts), so an invented key is the only
        // way to exercise the fallback. It must not come back in Turkish.
        expect(t('nope.not.a.key', { locale: 'it' })).not.toMatch(/[çğşıöü]/i);
    });
});
