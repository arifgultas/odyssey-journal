import { SearchService } from '@/lib/search-service';
import type { SearchFilters } from '@/lib/types/search';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to perform search
 */
export function useSearch(query: string, filters?: SearchFilters, enabled = true) {
    return useQuery({
        queryKey: ['search', query, filters],
        queryFn: () => SearchService.search(query, filters),
        enabled: enabled && query.length > 0,
    });
}

/**
 * Hook to search posts
 */
export function useSearchPosts(query: string, filters?: SearchFilters, enabled = true) {
    return useQuery({
        queryKey: ['search', 'posts', query, filters],
        queryFn: () => SearchService.searchPosts(query, filters),
        enabled: enabled && query.length > 0,
    });
}

/**
 * Hook to search users
 */
export function useSearchUsers(query: string, enabled = true) {
    return useQuery({
        queryKey: ['search', 'users', query],
        queryFn: () => SearchService.searchUsers(query),
        enabled: enabled && query.length > 0,
    });
}

/**
 * Hook to search locations
 */
export function useSearchLocations(query: string, enabled = true) {
    return useQuery({
        queryKey: ['search', 'locations', query],
        queryFn: () => SearchService.searchLocations(query),
        enabled: enabled && query.length > 0,
    });
}

/**
 * Hook to get trending locations
 */
export function useTrendingLocations(limit = 10) {
    return useQuery({
        queryKey: ['trending', 'locations', limit],
        queryFn: () => SearchService.getTrendingLocations(limit),
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Hook to get recommended places
 */
export function useRecommendedPlaces(userId?: string, limit = 10) {
    return useQuery({
        queryKey: ['recommended', 'places', userId, limit],
        queryFn: () => SearchService.getRecommendedPlaces(userId, limit),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

/**
 * Hook to get search history
 */
export function useSearchHistory(limit = 10) {
    return useQuery({
        queryKey: ['search', 'history', limit],
        queryFn: () => SearchService.getSearchHistory(limit),
    });
}

/**
 * Hook to save search to history
 */
export function useSaveSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ query, type }: { query: string; type: 'location' | 'username' | 'tag' }) =>
            SearchService.saveSearchHistory(query, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search', 'history'] });
        },
    });
}

/**
 * Hook to clear search history
 */
export function useClearSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => SearchService.clearSearchHistory(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search', 'history'] });
        },
    });
}

/**
 * Hook to delete search history item
 */
export function useDeleteSearchHistoryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => SearchService.deleteSearchHistoryItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['search', 'history'] });
        },
    });
}

/**
 * Hook to get trending posts
 */
export function useTrendingPosts(limit = 12) {
    return useQuery({
        queryKey: ['trending', 'posts', limit],
        queryFn: () => SearchService.getTrendingPosts(limit),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

/**
 * Hook to get suggested users
 */
export function useSuggestedUsers(limit = 10) {
    return useQuery({
        queryKey: ['suggested', 'users', limit],
        queryFn: () => SearchService.getSuggestedUsers(limit),
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Hook to get popular destinations
 */
export function usePopularDestinations(limit = 10) {
    return useQuery({
        queryKey: ['popular', 'destinations', limit],
        queryFn: () => SearchService.getPopularDestinations(limit),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
