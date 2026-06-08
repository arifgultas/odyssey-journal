import * as Sentry from '@sentry/react-native';

export interface EventProperties {
    [key: string]: any;
}

/**
 * Log a user action/event to Analytics & Sentry
 * @param eventName Name of the event (e.g., 'post_liked', 'screen_viewed')
 * @param properties Additional context variables
 */
export function logEvent(eventName: string, properties?: EventProperties): void {
    try {
        const timestamp = new Date().toISOString();
        const eventData = {
            eventName,
            properties: properties || {},
            timestamp,
        };

        // 1. Write event as a Sentry Breadcrumb
        // This is extremely useful to trace the user's action sequence leading up to a crash
        Sentry.addBreadcrumb({
            category: 'analytics',
            message: `Event: ${eventName}`,
            level: 'info',
            data: properties,
        });

        // 2. Local console log in development environment
        if (__DEV__) {
            console.log(`[Analytics] Event Logged: "${eventName}"`, properties || '');
        }

        // 3. PostHog / Firebase integration placeholder
        // To enable PostHog or Firebase, uncomment and install the libraries:
        // import PostHog from 'posthog-react-native';
        // PostHog.capture(eventName, properties);
        
    } catch (error) {
        console.error('Error logging analytics event:', error);
    }
}

/**
 * Associate active user metadata properties with analytics sessions
 * @param userId Unique user ID from Auth
 * @param properties Key-value metadata of user (e.g., plan: 'pro')
 */
export function setUserProperties(userId: string, properties: EventProperties): void {
    try {
        // Set Sentry user metadata context
        Sentry.setUser({
            id: userId,
            ...properties,
        });

        if (__DEV__) {
            console.log(`[Analytics] Set User Properties for ID ${userId}:`, properties);
        }

        // PostHog / Firebase integration placeholder
        // PostHog.identify(userId, properties);

    } catch (error) {
        console.error('Error setting user properties for analytics:', error);
    }
}
