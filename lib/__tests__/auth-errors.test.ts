/**
 * The rule this file guards: a message shown to the user is never `error.message`.
 *
 * Supabase answers in English whatever language the reader chose, so every error has to be
 * recognised by its code and answered from the translation files. These tests check both
 * halves of that: the mapping resolves to keys that actually exist in all twelve locales,
 * and no English text from an error object can leak through to the return value.
 */
import { isRecognizedError, localizedErrorMessage } from '../auth-errors';
import i18n, { setLanguage } from '../i18n';

import arLocale from '../i18n/translations/ar';
import enLocale from '../i18n/translations/en';
import jaLocale from '../i18n/translations/ja';
import trLocale from '../i18n/translations/tr';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
}));

function flatten(value: unknown, prefix = '', out: Record<string, string> = {}) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (child && typeof child === 'object') flatten(child, full, out);
        else out[full] = String(child);
    }
    return out;
}

const EN = flatten(enLocale);
const TR = flatten(trLocale);
const JA = flatten(jaLocale);
const AR = flatten(arLocale);

/** Every English string an error object could carry, so we can assert none of them leak */
const RAW_SUPABASE_MESSAGES = [
    'Invalid login credentials',
    'Email not confirmed',
    'User already registered',
    'Password should be at least 6 characters',
    'New password should be different from the old password',
    'Email rate limit exceeded',
    'Token has expired or is invalid',
    'Network request failed',
];

beforeEach(async () => {
    await setLanguage('en');
});

describe('localizedErrorMessage', () => {
    it('translates a Supabase auth code into the reader’s language', async () => {
        const error = { code: 'invalid_credentials', message: 'Invalid login credentials' };

        await setLanguage('tr');
        expect(localizedErrorMessage(error)).toBe(TR['auth.invalidCredentials']);

        await setLanguage('ja');
        expect(localizedErrorMessage(error)).toBe(JA['auth.invalidCredentials']);

        await setLanguage('ar');
        expect(localizedErrorMessage(error)).toBe(AR['auth.invalidCredentials']);
    });

    it.each([
        ['email_not_confirmed', 'errors.emailNotConfirmed'],
        ['user_already_exists', 'errors.emailExists'],
        ['email_exists', 'errors.emailExists'],
        ['weak_password', 'errors.weakPassword'],
        ['same_password', 'errors.samePassword'],
        ['over_email_send_rate_limit', 'errors.rateLimit'],
        ['otp_expired', 'errors.linkExpired'],
        ['user_not_found', 'errors.userNotFound'],
        ['signup_disabled', 'errors.signupDisabled'],
        ['session_expired', 'errors.sessionExpired'],
    ])('maps the auth code %s to %s', (code, key) => {
        expect(localizedErrorMessage({ code })).toBe(EN[key]);
    });

    it('maps a unique-violation from Postgres to the username message', () => {
        expect(localizedErrorMessage({ code: '23505' })).toBe(EN['errors.usernameTaken']);
    });

    it('recognises a failed request as a connection problem', () => {
        expect(localizedErrorMessage({ name: 'AuthRetryableFetchError' })).toBe(EN['errors.network']);
        expect(localizedErrorMessage({ status: 429 })).toBe(EN['errors.rateLimit']);
    });

    it('falls back to the English message text when the response carries no code', () => {
        // Older GoTrue responses have a message but no `code`
        expect(localizedErrorMessage({ message: 'Invalid login credentials' }))
            .toBe(EN['auth.invalidCredentials']);
        expect(localizedErrorMessage({ message: 'Email rate limit exceeded' }))
            .toBe(EN['errors.rateLimit']);
    });

    it('uses the generic message for anything it does not recognise', () => {
        expect(localizedErrorMessage({ code: 'some_future_code' })).toBe(EN['errors.generic']);
        expect(localizedErrorMessage(null)).toBe(EN['errors.generic']);
        expect(localizedErrorMessage(undefined)).toBe(EN['errors.generic']);
        expect(localizedErrorMessage('a bare string')).toBe(EN['errors.generic']);
    });

    it('honours a caller-supplied fallback key', () => {
        expect(localizedErrorMessage({ code: 'some_future_code' }, 'editProfile.updateError'))
            .toBe(EN['editProfile.updateError']);
    });

    it('never returns the raw English message, in any language', async () => {
        for (const language of ['tr', 'ja', 'ar', 'ru', 'zh'] as const) {
            await setLanguage(language);
            for (const message of RAW_SUPABASE_MESSAGES) {
                const result = localizedErrorMessage({ message });
                expect(result).not.toBe(message);
                expect(result.length).toBeGreaterThan(0);
            }
        }
    });

    it('never returns an empty string, which would leave the alert blank', async () => {
        for (const language of Object.keys(i18n.translations)) {
            await setLanguage(language as never);
            expect(localizedErrorMessage({ code: 'invalid_credentials' }).trim()).not.toBe('');
            expect(localizedErrorMessage({ code: 'unknown' }).trim()).not.toBe('');
        }
    });
});

describe('isRecognizedError', () => {
    it('separates errors this app has wording for from the ones it does not', () => {
        expect(isRecognizedError({ code: 'invalid_credentials' })).toBe(true);
        expect(isRecognizedError({ code: 'some_future_code' })).toBe(false);
    });
});

describe('the mapping itself', () => {
    // A typo in a translation key would show the generic message forever without failing
    // anything else, because these keys are looked up through a table rather than written
    // as literal t('...') calls that scripts/i18n-check.js can see.
    it('only points at keys that exist in every locale', () => {
        const codes = [
            'invalid_credentials', 'email_not_confirmed', 'user_already_exists', 'email_exists',
            'weak_password', 'same_password', 'over_email_send_rate_limit',
            'over_request_rate_limit', 'over_sms_send_rate_limit', 'otp_expired',
            'user_not_found', 'signup_disabled', 'email_provider_disabled', 'session_expired',
            'session_not_found', 'refresh_token_not_found', 'bad_jwt', 'validation_failed',
            'email_address_invalid', '23505', '42501', 'PGRST301',
        ];

        for (const code of codes) {
            const message = localizedErrorMessage({ code });
            expect(message).not.toBe(EN['errors.generic']);
            expect(message).not.toMatch(/^⟦/); // t() marks a missing key this way in dev
        }
    });
});
