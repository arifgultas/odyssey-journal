/**
 * Sentry Error Monitoring Configuration
 * 
 * Setup: Add your Sentry DSN to .env:
 *   EXPO_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
 * 
 * Free tier: 5,000 errors/month, 10,000 performance transactions/month
 * Sign up at: https://sentry.io/signup/
 */
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

/**
 * Initialize Sentry error tracking
 * Call this once at app startup
 */
export function initSentry() {
    if (!SENTRY_DSN) {
        console.warn('[Sentry] No DSN found. Error monitoring disabled. Add EXPO_PUBLIC_SENTRY_DSN to .env');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        debug: __DEV__,
        enabled: !__DEV__, // Only enabled in production
        environment: __DEV__ ? 'development' : 'production',
        release: Constants.expoConfig?.version || '1.0.0',

        // Performance monitoring
        tracesSampleRate: 0.2, // 20% of transactions (keep costs low)

        // Only send errors in production
        beforeSend(event) {
            if (__DEV__) return null;
            return event;
        },
    });
}

/**
 * Capture a custom error with optional context
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
    if (!SENTRY_DSN) return;

    if (context) {
        Sentry.withScope((scope) => {
            Object.entries(context).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
            Sentry.captureException(error);
        });
    } else {
        Sentry.captureException(error);
    }
}

/**
 * Set user info for error tracking (call after login)
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }) {
    if (!SENTRY_DSN) return;
    Sentry.setUser(user);
}

/**
 * Clear user info (call on logout)
 */
export function clearSentryUser() {
    if (!SENTRY_DSN) return;
    Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
    if (!SENTRY_DSN) return;
    Sentry.addBreadcrumb({
        message,
        category: category || 'app',
        data,
        level: 'info',
    });
}

/**
 * Wrap root component with Sentry error boundary
 */
export const SentryErrorBoundary = Sentry.wrap;
