import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Custom AsyncStorage persister for React Query
 * Enables offline persistence of query cache
 */
export const asyncStoragePersister: Persister = {
    persistClient: async (client: PersistedClient) => {
        try {
            await AsyncStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
        } catch (error) {
            console.error('Failed to persist query client:', error);
        }
    },
    restoreClient: async () => {
        try {
            const cachedClient = await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
            return cachedClient ? JSON.parse(cachedClient) : undefined;
        } catch (error) {
            console.error('Failed to restore query client:', error);
            return undefined;
        }
    },
    removeClient: async () => {
        try {
            await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
        } catch (error) {
            console.error('Failed to remove query client:', error);
        }
    },
};

/**
 * Query client configuration with offline support
 */
export const queryClientConfig = {
    defaultOptions: {
        queries: {
            // Cache time: 24 hours
            gcTime: 1000 * 60 * 60 * 24,
            // Stale time: 5 minutes
            staleTime: 1000 * 60 * 5,
            // Retry failed queries
            retry: 2,
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Refetch on reconnect
            refetchOnReconnect: true,
            // Network mode for offline support
            networkMode: 'offlineFirst' as const,
        },
        mutations: {
            // Retry failed mutations
            retry: 1,
            // Network mode for offline support
            networkMode: 'offlineFirst' as const,
        },
    },
};

/**
 * Persist options for React Query
 */
export const persistOptions = {
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    buster: '', // Change this to invalidate all cached data
    dehydrateOptions: {
        shouldDehydrateQuery: (query: any) => {
            // Only persist successful queries
            return query.state.status === 'success';
        },
    },
};
