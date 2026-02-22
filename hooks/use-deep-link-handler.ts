/**
 * Deep Link Handler
 * Handles incoming odysseyjournal:// URLs and routes to appropriate screens
 */

import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * URL patterns:
 * - odysseyjournal://post/:id → Post detail
 * - odysseyjournal://user/:id → User profile
 * - odysseyjournal://collection/:id → Collection detail
 */
export function useDeepLinkHandler() {
    const router = useRouter();

    useEffect(() => {
        // Handle deep link that launched the app
        const handleInitialURL = async () => {
            const url = await Linking.getInitialURL();
            if (url) {
                handleDeepLink(url);
            }
        };

        // Handle deep links while app is open
        const subscription = Linking.addEventListener('url', (event) => {
            handleDeepLink(event.url);
        });

        handleInitialURL();

        return () => {
            subscription.remove();
        };
    }, []);

    const handleDeepLink = (url: string) => {
        try {
            const parsed = Linking.parse(url);
            const { hostname, path, queryParams } = parsed;

            // Combine hostname and path for full route
            const fullPath = hostname ? `${hostname}${path ? `/${path}` : ''}` : path || '';
            const segments = fullPath.split('/').filter(Boolean);

            if (segments.length === 0) return;

            const type = segments[0];
            const id = segments[1];

            if (!id) return;

            switch (type) {
                case 'post':
                    router.push(`/post-detail/${id}` as any);
                    break;
                case 'user':
                    router.push(`/user-profile/${id}` as any);
                    break;
                case 'collection':
                    router.push(`/collection/${id}` as any);
                    break;
                default:
                    // Unknown deep link type — ignore
                    break;
            }
        } catch (error) {
            // Silently fail on malformed URLs
        }
    };
}

export default useDeepLinkHandler;
