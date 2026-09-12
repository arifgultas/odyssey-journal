import { router } from 'expo-router';

/**
 * Safely navigates back if there is a screen in history,
 * otherwise falls back to the specified route (default: home tabs).
 * Prevents "The action 'GO_BACK' was not handled by any navigator" warnings/errors.
 */
export function safeGoBack(fallbackRoute: string = '/(tabs)'): void {
    try {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace(fallbackRoute as any);
        }
    } catch {
        try {
            router.replace(fallbackRoute as any);
        } catch {
            // Ignore if already at destination
        }
    }
}
