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
        staleTime: 1000 * 60 * 5, // 5 minutes (reduced from 30)
        retry: 2,
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

/**
 * Hook to get posts by category
 */
export function usePostsByCategory(categoryId: string, page = 0, pageSize = 20) {
    return useQuery({
        queryKey: ['posts', 'category', categoryId, page, pageSize],
        queryFn: () => SearchService.getPostsByCategory(categoryId, page, pageSize),
        enabled: !!categoryId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get posts by location
 */
export function usePostsByLocation(locationName: string, page = 0, pageSize = 20) {
    return useQuery({
        queryKey: ['posts', 'location', locationName, page, pageSize],
        queryFn: () => SearchService.getPostsByLocation(locationName, page, pageSize),
        enabled: !!locationName,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get all trending posts (for "View All" page)
 */
export function useAllTrendingPosts(page = 0, pageSize = 20) {
    return useQuery({
        queryKey: ['trending', 'posts', 'all', page, pageSize],
        queryFn: () => SearchService.getAllTrendingPosts(page, pageSize),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
