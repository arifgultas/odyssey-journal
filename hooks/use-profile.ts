import { ProfileService } from '@/lib/profile-service';
import type { UpdateProfileData } from '@/lib/types/profile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Hook to fetch current user's profile
 */
export function useCurrentProfile() {
    return useQuery({
        queryKey: ['profile', 'current'],
        queryFn: () => ProfileService.getCurrentProfile(),
    });
}

/**
 * Hook to fetch a profile by user ID with stats
 */
export function useProfile(userId: string | null) {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: () => userId ? ProfileService.getProfileWithStats(userId) : null,
        enabled: !!userId,
    });
}

/**
 * Hook to fetch profile stats
 */
export function useProfileStats(userId: string | null) {
    return useQuery({
        queryKey: ['profile', 'stats', userId],
        queryFn: () => userId ? ProfileService.getProfileStats(userId) : null,
        enabled: !!userId,
    });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: UpdateProfileData) => ProfileService.updateProfile(updates),
        onSuccess: () => {
            // Invalidate and refetch profile queries
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

/**
 * Hook to upload avatar
 */
export function useUploadAvatar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ uri, userId }: { uri: string; userId: string }) =>
            ProfileService.uploadAvatar(uri, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

/**
 * Hook to fetch user's posts
 */
export function useUserPosts(userId: string | null, limit = 20, offset = 0) {
    return useQuery({
        queryKey: ['posts', 'user', userId, limit, offset],
        queryFn: () => userId ? ProfileService.getUserPosts(userId, limit, offset) : [],
        enabled: !!userId,
    });
}

/**
 * Hook to search profiles
 */
export function useSearchProfiles(query: string, enabled = true) {
    return useQuery({
        queryKey: ['profiles', 'search', query],
        queryFn: () => ProfileService.searchProfiles(query),
        enabled: enabled && query.length > 0,
    });
}
