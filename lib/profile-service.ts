import { supabase } from './supabase';
import type { Profile, ProfileStats, ProfileWithStats, UpdateProfileData } from './types/profile';

/**
 * Profile Service
 * Handles all profile-related operations including fetching, updating, and managing user profiles
 */
export class ProfileService {
    /**
     * Get current user's profile
     */
    static async getCurrentProfile(): Promise<Profile | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('No authenticated user');
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching current profile:', error);
            return null;
        }
    }

    /**
     * Get profile by user ID
     */
    static async getProfileById(userId: string): Promise<Profile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    /**
     * Get profile with stats
     */
    static async getProfileWithStats(userId: string): Promise<ProfileWithStats | null> {
        try {
            const profile = await this.getProfileById(userId);
            if (!profile) return null;

            const stats = await this.getProfileStats(userId);

            const { data: { user } } = await supabase.auth.getUser();
            let isFollowing = false;

            if (user && user.id !== userId) {
                const { data } = await supabase
                    .from('follows')
                    .select('*')
                    .eq('follower_id', user.id)
                    .eq('following_id', userId)
                    .single();

                isFollowing = !!data;
            }

            return {
                ...profile,
                stats,
                isFollowing,
            };
        } catch (error) {
            console.error('Error fetching profile with stats:', error);
            return null;
        }
    }

    /**
     * Get profile statistics
     */
    static async getProfileStats(userId: string): Promise<ProfileStats> {
        try {
            // Get posts count
            const { count: postsCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // Get followers count
            const { count: followersCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', userId);

            // Get following count
            const { count: followingCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', userId);

            // Get unique countries visited
            const { data: posts } = await supabase
                .from('posts')
                .select('location_name')
                .eq('user_id', userId)
                .not('location_name', 'is', null);

            const uniqueCountries = new Set(
                posts?.map(post => {
                    // Extract country from location (assuming format: "City, Country")
                    const parts = post.location_name?.split(',');
                    return parts?.[parts.length - 1]?.trim();
                }).filter(Boolean)
            );

            return {
                postsCount: postsCount || 0,
                followersCount: followersCount || 0,
                followingCount: followingCount || 0,
                countriesVisited: uniqueCountries.size,
            };
        } catch (error) {
            console.error('Error fetching profile stats:', error);
            return {
                postsCount: 0,
                followersCount: 0,
                followingCount: 0,
                countriesVisited: 0,
            };
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(updates: UpdateProfileData): Promise<Profile | null> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('No authenticated user');
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Upload avatar image
     */
    static async uploadAvatar(uri: string, userId: string): Promise<string | null> {
        try {
            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Convert URI to blob
            const response = await fetch(uri);
            const blob = await response.blob();

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, blob, {
                    contentType: `image/${fileExt}`,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    /**
     * Get user's posts
     */
    static async getUserPosts(userId: string, limit = 20, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching user posts:', error);
            return [];
        }
    }

    /**
     * Search profiles by username or full name
     */
    static async searchProfiles(query: string, limit = 20) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching profiles:', error);
            return [];
        }
    }
}
