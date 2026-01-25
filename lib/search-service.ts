import { supabase } from './supabase';
import type {
    RecommendedPlace,
    SearchFilters,
    SearchHistoryItem,
    SearchResult,
    TrendingLocation,
} from './types/search';

/**
 * Search Service
 * Handles all search and discovery operations
 */
export class SearchService {
    /**
     * Perform comprehensive search across posts, users, and locations
     */
    static async search(query: string, filters?: SearchFilters): Promise<SearchResult> {
        try {
            const [posts, users, locations] = await Promise.all([
                this.searchPosts(query, filters),
                this.searchUsers(query),
                this.searchLocations(query),
            ]);

            return {
                posts,
                users,
                locations,
            };
        } catch (error) {
            console.error('Error performing search:', error);
            throw error;
        }
    }

    /**
     * Search posts by location, tags, or content
     */
    static async searchPosts(query: string, filters?: SearchFilters) {
        try {
            let queryBuilder = supabase
                .from('posts')
                .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `);

            // Search by location
            if (filters?.location || query) {
                const searchTerm = filters?.location || query;
                queryBuilder = queryBuilder.or(
                    `location_name.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`
                );
            }

            // Filter by username
            if (filters?.username) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .ilike('username', `%${filters.username}%`)
                    .single();

                if (userProfile) {
                    queryBuilder = queryBuilder.eq('user_id', userProfile.id);
                }
            }

            // Filter by date range
            if (filters?.dateFrom) {
                queryBuilder = queryBuilder.gte('created_at', filters.dateFrom);
            }
            if (filters?.dateTo) {
                queryBuilder = queryBuilder.lte('created_at', filters.dateTo);
            }

            // Sort by
            if (filters?.sortBy === 'popular') {
                queryBuilder = queryBuilder.order('likes_count', { ascending: false });
            } else if (filters?.sortBy === 'trending') {
                // Trending: recent posts with high engagement
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                queryBuilder = queryBuilder
                    .gte('created_at', weekAgo.toISOString())
                    .order('likes_count', { ascending: false });
            } else {
                queryBuilder = queryBuilder.order('created_at', { ascending: false });
            }

            queryBuilder = queryBuilder.limit(20);

            const { data, error } = await queryBuilder;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching posts:', error);
            return [];
        }
    }

    /**
     * Search users by username or full name
     */
    static async searchUsers(query: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
                .limit(20);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }

    /**
     * Search locations from posts
     */
    static async searchLocations(query: string) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('location_name, latitude, longitude')
                .not('location_name', 'is', null)
                .ilike('location_name', `%${query}%`);

            if (error) throw error;

            // Group by location and count posts
            const locationMap = new Map();
            data?.forEach((post) => {
                const key = post.location_name;
                if (key) {
                    if (!locationMap.has(key)) {
                        const parts = key.split(',').map((p: string) => p.trim());
                        locationMap.set(key, {
                            name: key,
                            city: parts[0],
                            country: parts[parts.length - 1],
                            postCount: 0,
                            coordinates: post.latitude && post.longitude ? {
                                latitude: post.latitude,
                                longitude: post.longitude,
                            } : undefined,
                        });
                    }
                    locationMap.get(key).postCount++;
                }
            });

            return Array.from(locationMap.values())
                .sort((a, b) => b.postCount - a.postCount)
                .slice(0, 10);
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    }

    /**
     * Get trending locations (most posted in last 7 days)
     */
    static async getTrendingLocations(limit = 10): Promise<TrendingLocation[]> {
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const { data, error } = await supabase
                .from('posts')
                .select('location_name, latitude, longitude, created_at')
                .not('location_name', 'is', null)
                .gte('created_at', weekAgo.toISOString());

            if (error) throw error;

            // Group by location and calculate trend score
            const locationMap = new Map();
            data?.forEach((post) => {
                const key = post.location_name;
                if (key) {
                    if (!locationMap.has(key)) {
                        const parts = key.split(',').map((p: string) => p.trim());
                        locationMap.set(key, {
                            name: key,
                            city: parts[0],
                            country: parts[parts.length - 1],
                            postCount: 0,
                            recentPostCount: 0,
                            trendScore: 0,
                            coordinates: post.latitude && post.longitude ? {
                                latitude: post.latitude,
                                longitude: post.longitude,
                            } : undefined,
                        });
                    }
                    const location = locationMap.get(key);
                    location.postCount++;
                    location.recentPostCount++;

                    // Calculate trend score (more recent = higher score)
                    const daysAgo = Math.floor(
                        (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24)
                    );
                    location.trendScore += Math.max(7 - daysAgo, 1);
                }
            });

            return Array.from(locationMap.values())
                .sort((a, b) => b.trendScore - a.trendScore)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching trending locations:', error);
            return [];
        }
    }

    /**
     * Get recommended places based on user activity
     */
    static async getRecommendedPlaces(userId?: string, limit = 10): Promise<RecommendedPlace[]> {
        try {
            // Get all locations with post counts
            const { data, error } = await supabase
                .from('posts')
                .select('location_name, latitude, longitude, images')
                .not('location_name', 'is', null);

            if (error) throw error;

            // Group by location
            const locationMap = new Map();
            data?.forEach((post) => {
                const key = post.location_name;
                if (key) {
                    if (!locationMap.has(key)) {
                        const parts = key.split(',').map((p: string) => p.trim());
                        locationMap.set(key, {
                            id: key.toLowerCase().replace(/\s+/g, '-'),
                            name: key,
                            location: {
                                city: parts[0],
                                country: parts[parts.length - 1],
                                latitude: post.latitude,
                                longitude: post.longitude,
                            },
                            postCount: 0,
                            imageUrl: post.images?.[0],
                        });
                    }
                    const location = locationMap.get(key);
                    location.postCount++;
                    if (!location.imageUrl && post.images?.[0]) {
                        location.imageUrl = post.images[0];
                    }
                }
            });

            return Array.from(locationMap.values())
                .sort((a, b) => b.postCount - a.postCount)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching recommended places:', error);
            return [];
        }
    }

    /**
     * Save search to history
     */
    static async saveSearchHistory(query: string, type: 'location' | 'username' | 'tag') {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if search already exists
            const { data: existing } = await supabase
                .from('search_history')
                .select('id')
                .eq('user_id', user.id)
                .eq('query', query)
                .eq('type', type)
                .single();

            if (existing) {
                // Update timestamp
                await supabase
                    .from('search_history')
                    .update({ timestamp: new Date().toISOString() })
                    .eq('id', existing.id);
            } else {
                // Insert new
                await supabase
                    .from('search_history')
                    .insert({
                        user_id: user.id,
                        query,
                        type,
                        timestamp: new Date().toISOString(),
                    });
            }
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    /**
     * Get search history for current user
     */
    static async getSearchHistory(limit = 10): Promise<SearchHistoryItem[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', user.id)
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching search history:', error);
            return [];
        }
    }

    /**
     * Clear search history
     */
    static async clearSearchHistory() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
                .from('search_history')
                .delete()
                .eq('user_id', user.id);
        } catch (error) {
            console.error('Error clearing search history:', error);
            throw error;
        }
    }

    /**
     * Delete specific search history item
     */
    static async deleteSearchHistoryItem(id: string) {
        try {
            await supabase
                .from('search_history')
                .delete()
                .eq('id', id);
        } catch (error) {
            console.error('Error deleting search history item:', error);
            throw error;
        }
    }

    /**
     * Get trending posts (recent posts with high engagement)
     */
    static async getTrendingPosts(limit = 12) {
        try {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

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
                .gte('created_at', weekAgo.toISOString())
                .order('likes_count', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching trending posts:', error);
            return [];
        }
    }

    /**
     * Get suggested users to follow
     */
    static async getSuggestedUsers(limit = 10) {
        try {
            // Simple query - just get profiles ordered by followers
            // No auth check, no follows filtering - maximum compatibility
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio, followers_count, following_count')
                .order('followers_count', { ascending: false, nullsFirst: false })
                .limit(limit);

            if (error) {
                console.error('Supabase error in getSuggestedUsers:', error);
                throw error;
            }

            // Try to filter out current user client-side if authenticated
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && data) {
                    return data.filter(profile => profile.id !== user.id);
                }
            } catch (authError) {
                // Auth check failed, just return all data
                console.log('Auth check failed, returning all profiles');
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching suggested users:', error);
            return [];
        }
    }

    /**
     * Get popular destinations (locations with most posts)
     */
    static async getPopularDestinations(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('location_name, latitude, longitude, images')
                .not('location_name', 'is', null);

            if (error) throw error;

            // Group by location and count
            const locationMap = new Map();
            data?.forEach((post) => {
                const key = post.location_name;
                if (key) {
                    if (!locationMap.has(key)) {
                        const parts = key.split(',').map((p: string) => p.trim());
                        locationMap.set(key, {
                            name: key,
                            city: parts[0],
                            country: parts[parts.length - 1],
                            postCount: 0,
                            imageUrl: post.images?.[0],
                            coordinates: post.latitude && post.longitude ? {
                                latitude: post.latitude,
                                longitude: post.longitude,
                            } : undefined,
                        });
                    }
                    const location = locationMap.get(key);
                    location.postCount++;
                    if (!location.imageUrl && post.images?.[0]) {
                        location.imageUrl = post.images[0];
                    }
                }
            });

            return Array.from(locationMap.values())
                .sort((a, b) => b.postCount - a.postCount)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching popular destinations:', error);
            return [];
        }
    }

    /**
     * Get posts by category
     * @param categoryId - Category ID to filter by (e.g., 'nature', 'city')
     * @param page - Page number (0-indexed)
     * @param pageSize - Number of posts per page
     */
    static async getPostsByCategory(categoryId: string, page = 0, pageSize = 20) {
        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

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
                .contains('categories', [categoryId])
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching posts by category:', error);
            return [];
        }
    }

    /**
     * Get posts by location name
     * @param locationName - Location name to filter by
     * @param page - Page number (0-indexed)
     * @param pageSize - Number of posts per page
     */
    static async getPostsByLocation(locationName: string, page = 0, pageSize = 20) {
        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            // Use ilike for partial matching (city or full location name)
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
                .or(`location->>city.ilike.%${locationName}%,location->>country.ilike.%${locationName}%`)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching posts by location:', error);
            return [];
        }
    }

    /**
     * Get all trending posts with pagination (for "View All" page)
     * @param page - Page number (0-indexed)
     * @param pageSize - Number of posts per page
     */
    static async getAllTrendingPosts(page = 0, pageSize = 20) {
        try {
            const from = page * pageSize;
            const to = from + pageSize - 1;

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
                .order('likes_count', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching all trending posts:', error);
            return [];
        }
    }
}
