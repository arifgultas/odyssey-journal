import { followUser, unfollowUser } from '@/lib/follow';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FollowUserParams {
    targetUserId: string;
    action: 'follow' | 'unfollow';
}

/**
 * Hook to follow/unfollow a user
 */
export function useFollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ targetUserId, action }: FollowUserParams) => {
            if (action === 'follow') {
                return await followUser(targetUserId);
            } else {
                return await unfollowUser(targetUserId);
            }
        },
        onSuccess: (_data: boolean, variables: FollowUserParams) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['profile', variables.targetUserId] });
            queryClient.invalidateQueries({ queryKey: ['profile', 'stats'] });
            queryClient.invalidateQueries({ queryKey: ['followers'] });
            queryClient.invalidateQueries({ queryKey: ['following'] });
        },
    });
}
