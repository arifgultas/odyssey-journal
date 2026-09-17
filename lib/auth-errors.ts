/**
 * Turns an error from Supabase into a message in the reader's language.
 *
 * Supabase returns `error.message` in English and always will - "Invalid login credentials",
 * "User already registered". Showing it directly, which every auth screen used to do, put
 * English text in front of a reader who had chosen Japanese. So nothing here ever returns
 * `error.message`: an error is recognised by its machine-readable `code` and answered with a
 * translation key, and anything unrecognised falls back to a generic localized message.
 */
import { t } from './i18n';

/**
 * Supabase Auth error codes (`AuthApiError.code`), documented at
 * https://supabase.com/docs/guides/auth/debugging/error-codes. Only the codes a reader of
 * this app can actually trigger are listed; the rest fall through to the generic message.
 */
const AUTH_CODE_KEYS: Record<string, string> = {
    invalid_credentials: 'auth.invalidCredentials',
    email_not_confirmed: 'errors.emailNotConfirmed',
    user_already_exists: 'errors.emailExists',
    email_exists: 'errors.emailExists',
    weak_password: 'errors.weakPassword',
    same_password: 'errors.samePassword',
    over_email_send_rate_limit: 'errors.rateLimit',
    over_request_rate_limit: 'errors.rateLimit',
    over_sms_send_rate_limit: 'errors.rateLimit',
    otp_expired: 'errors.linkExpired',
    user_not_found: 'errors.userNotFound',
    signup_disabled: 'errors.signupDisabled',
    email_provider_disabled: 'errors.signupDisabled',
    session_expired: 'errors.sessionExpired',
    session_not_found: 'errors.sessionExpired',
    refresh_token_not_found: 'errors.sessionExpired',
    bad_jwt: 'errors.sessionExpired',
    validation_failed: 'auth.invalidEmail',
    email_address_invalid: 'auth.invalidEmail',
};

/** PostgREST / Postgres SQLSTATE codes that reach the user through a form */
const POSTGRES_CODE_KEYS: Record<string, string> = {
    '23505': 'errors.usernameTaken', // unique_violation - in this app only profiles.username
    '42501': 'errors.unauthorized', // insufficient_privilege, i.e. an RLS policy said no
    PGRST301: 'errors.sessionExpired', // JWT expired
};

/**
 * Older GoTrue responses, and a few thrown by supabase-js itself, carry no `code`.
 * Matched on a lowercased substring of the English message, which is stable enough for
 * these few cases and only ever used to *choose a translation*, never to display.
 */
const MESSAGE_PATTERNS: [pattern: string, key: string][] = [
    ['invalid login credentials', 'auth.invalidCredentials'],
    ['email not confirmed', 'errors.emailNotConfirmed'],
    ['already registered', 'errors.emailExists'],
    ['already been registered', 'errors.emailExists'],
    ['password should be', 'errors.weakPassword'],
    ['should be different from the old password', 'errors.samePassword'],
    ['rate limit', 'errors.rateLimit'],
    ['too many requests', 'errors.rateLimit'],
    ['expired', 'errors.linkExpired'],
    ['network request failed', 'errors.network'],
    ['failed to fetch', 'errors.network'],
];

type ErrorLike = {
    code?: unknown;
    status?: unknown;
    name?: unknown;
    message?: unknown;
};

function asErrorLike(error: unknown): ErrorLike {
    return error && typeof error === 'object' ? (error as ErrorLike) : {};
}

/** The translation key for an error, or null when nothing recognises it */
function keyFor(error: unknown): string | null {
    const { code, status, name, message } = asErrorLike(error);

    if (typeof code === 'string') {
        if (AUTH_CODE_KEYS[code]) return AUTH_CODE_KEYS[code];
        if (POSTGRES_CODE_KEYS[code]) return POSTGRES_CODE_KEYS[code];
    }

    // supabase-js wraps a failed request rather than giving it a code
    if (name === 'AuthRetryableFetchError' || status === 0) return 'errors.network';
    if (status === 429) return 'errors.rateLimit';

    if (typeof message === 'string') {
        const haystack = message.toLowerCase();
        const match = MESSAGE_PATTERNS.find(([pattern]) => haystack.includes(pattern));
        if (match) return match[1];
    }

    return null;
}

/**
 * A message safe to put on screen, in the language the app is running in.
 *
 * @param error     whatever was caught or returned in `{ error }`
 * @param fallbackKey translation key used when the error is not recognised
 */
export function localizedErrorMessage(error: unknown, fallbackKey: string = 'errors.generic'): string {
    return t(keyFor(error) ?? fallbackKey);
}

/**
 * The translation key for an error, for callers that have to keep it around.
 *
 * Anything that stores an error in state should store this rather than the rendered string:
 * a message translated once and parked in state stays in the old language when the reader
 * switches, because nothing re-runs the translation.
 *
 * @param error       whatever was caught or returned in `{ error }`
 * @param fallbackKey translation key used when the error is not recognised
 */
export function localizedErrorKey(error: unknown, fallbackKey: string = 'errors.generic'): string {
    return keyFor(error) ?? fallbackKey;
}

/** True when this app knows a specific translated message for the error */
export function isRecognizedError(error: unknown): boolean {
    return keyFor(error) !== null;
}

export default localizedErrorMessage;
