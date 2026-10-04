import { uploadImage } from './image-upload';
import { getCountryCode } from './location-formatter';
import { sanitizeBio, sanitizeFullName, sanitizeText, sanitizeUsername } from './sanitize';
import { supabase } from './supabase';
import type { CommonDestination, HomeLocation, Profile, ProfileStats, ProfileWithStats, UpdateProfileData } from './types/profile';
import { captureError } from './sentry';

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
     * Get profile statistics with extended travel data
     */
    static async getProfileStats(userId: string): Promise<ProfileStats> {
        try {
            // Fetch all statistics and profile info in parallel
            const [
                postsResult,
                followersResult,
                followingResult,
                postsDataResult,
                distanceResult,
                foodPostsResult,
                photoPostsResult
            ] = await Promise.all([
                supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId),
                supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', userId),
                supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', userId),
                supabase
                    .from('posts')
                    .select('location, created_at')
                    .eq('user_id', userId)
                    .not('location', 'is', null)
                    .order('created_at', { ascending: true }),
                // Kilometers are worked out on the server (032): home coordinates are readable
                // only by their owner, so only the number comes back
                supabase.rpc('get_travel_distance_km', { p_user_id: userId }),
                supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .contains('categories', ['food']),
                supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .not('images', 'eq', '{}'),
            ]);

            const postsCount = postsResult.count;
            const followersCount = followersResult.count;
            const followingCount = followingResult.count;
            const posts = postsDataResult.data;

            // Process location data
            const visitedLocations: Array<{
                latitude: number;
                longitude: number;
                name: string;
                country: string;
                visitDate: string;
            }> = [];
            const uniqueCountries = new Set<string>();
            const countryDays = new Map<string, Set<string>>(); // country -> Set of unique dates
            const totalDistanceKm = typeof distanceResult.data === 'number' ? distanceResult.data : 0;

            if (posts && posts.length > 0) {
                for (const post of posts) {
                    const location = post.location as {
                        latitude?: number;
                        longitude?: number;
                        address?: string;
                        city?: string;
                        country?: string;
                        countryCode?: string;
                    } | null;

                    if (location && location.latitude && location.longitude) {
                        // Count by ISO code, not by the stored text: a post saved as
                        // "Türkiye" and one saved as "Turkey" are the same country.
                        const countryKey =
                            location.countryCode || getCountryCode(location.country) || location.country || 'Unknown';
                        const country = location.country || 'Unknown';
                        const locationName = location.city || location.address || country;
                        const visitDate = post.created_at.split('T')[0]; // Get date part only

                        // Add to visited locations
                        visitedLocations.push({
                            latitude: location.latitude,
                            longitude: location.longitude,
                            name: locationName,
                            country: country,
                            visitDate: visitDate,
                        });

                        // Track unique countries
                        if (countryKey !== 'Unknown') {
                            uniqueCountries.add(countryKey);
                        }

                        // Track days per country
                        if (!countryDays.has(countryKey)) {
                            countryDays.set(countryKey, new Set());
                        }
                        countryDays.get(countryKey)!.add(visitDate);

                    }
                }
            }

            // Calculate total travel days (unique days across all countries)
            let travelDays = 0;
            countryDays.forEach((dates) => {
                travelDays += dates.size;
            });

            return {
                postsCount: postsCount || 0,
                followersCount: followersCount || 0,
                followingCount: followingCount || 0,
                countriesVisited: uniqueCountries.size,
                totalDistanceKm,
                foodPostsCount: foodPostsResult.count || 0,
                photoPostsCount: photoPostsResult.count || 0,
                travelDays: travelDays,
                visitedLocations: visitedLocations,
            };
        } catch (error) {
            console.error('Error fetching profile stats:', error);
            captureError(error as Error, { context: 'getProfileStats', userId });
            return {
                postsCount: 0,
                followersCount: 0,
                followingCount: 0,
                countriesVisited: 0,
                totalDistanceKm: 0,
                foodPostsCount: 0,
                photoPostsCount: 0,
                travelDays: 0,
                visitedLocations: [],
            };
        }
    }

    /**
     * The signed-in user's home location, or null. It lives in its own table that only its owner
     * can read (032), not on the profile row every signed-in user can select.
     */
    static async getMyHomeLocation(): Promise<HomeLocation | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_home_locations')
            .select('latitude, longitude, city, country')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;
        return {
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city ?? undefined,
            country: data.country ?? undefined,
        };
    }

    /**
     * Save the signed-in user's home location (used for the boarding pass kilometers)
     */
    static async setHomeLocation(home: HomeLocation): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('No authenticated user');
        }

        const { error } = await supabase
            .from('user_home_locations')
            .upsert({
                user_id: user.id,
                latitude: Number(home.latitude),
                longitude: Number(home.longitude),
                city: home.city ? sanitizeText(home.city, 100) : null,
                country: home.country ? sanitizeText(home.country, 100) : null,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

        if (error) throw error;
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

            // Sanitize text fields before update
            const sanitizedUpdates: Partial<UpdateProfileData> = { ...updates };
            if (sanitizedUpdates.username) {
                sanitizedUpdates.username = sanitizeUsername(sanitizedUpdates.username);
            }
            if (sanitizedUpdates.full_name) {
                sanitizedUpdates.full_name = sanitizeFullName(sanitizedUpdates.full_name);
            }
            if (sanitizedUpdates.bio) {
                sanitizedUpdates.bio = sanitizeBio(sanitizedUpdates.bio);
            }
            if (sanitizedUpdates.website) {
                sanitizedUpdates.website = sanitizeText(sanitizedUpdates.website, 200);
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...sanitizedUpdates,
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
            // '<userId>/<time>.jpg': storage only lets a user write inside their own folder
            return await uploadImage(uri, 'avatars', userId);
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
     * Get common destinations between two users
     * Finds cities that both users have posted from
     */
    static async getCommonDestinations(
        currentUserId: string,
        targetUserId: string
    ): Promise<CommonDestination[]> {
        try {
            // Fetch posts with location data for both users in parallel
            const [currentUserPosts, targetUserPosts] = await Promise.all([
                supabase
                    .from('posts')
                    .select('location')
                    .eq('user_id', currentUserId)
                    .not('location', 'is', null),
                supabase
                    .from('posts')
                    .select('location')
                    .eq('user_id', targetUserId)
                    .not('location', 'is', null),
            ]);

            if (currentUserPosts.error || targetUserPosts.error) {
                throw currentUserPosts.error || targetUserPosts.error;
            }

            // Extract city counts for each user
            const extractCities = (posts: Array<{ location: unknown }>) => {
                const cityMap = new Map<string, { country: string; count: number }>();
                for (const post of posts) {
                    const loc = post.location as {
                        city?: string;
                        country?: string;
                    } | null;
                    if (loc?.city) {
                        const key = loc.city.toLowerCase().trim();
                        const existing = cityMap.get(key);
                        if (existing) {
                            existing.count++;
                        } else {
                            cityMap.set(key, {
                                country: loc.country || '',
                                count: 1,
                            });
                        }
                    }
                }
                return cityMap;
            };

            const currentCities = extractCities(currentUserPosts.data || []);
            const targetCities = extractCities(targetUserPosts.data || []);

            // Find common cities
            const commonDestinations: CommonDestination[] = [];
            for (const [cityKey, currentData] of currentCities) {
                const targetData = targetCities.get(cityKey);
                if (targetData) {
                    // Use the display name from whichever has more data
                    const displayCity = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
                    commonDestinations.push({
                        city: displayCity,
                        country: currentData.country || targetData.country,
                        currentUserCount: currentData.count,
                        targetUserCount: targetData.count,
                    });
                }
            }

            // Sort by total posts count (most common first)
            commonDestinations.sort(
                (a, b) =>
                    (b.currentUserCount + b.targetUserCount) -
                    (a.currentUserCount + a.targetUserCount)
            );

            return commonDestinations;
        } catch (error) {
            console.error('Error fetching common destinations:', error);
            return [];
        }
    }

    /**
     * Search profiles by username or full name
     */
    static async searchProfiles(query: string, limit = 20) {
        try {
            // Sanitize search query to prevent injection
            const sanitizedQuery = sanitizeText(query, 50);
            if (!sanitizedQuery) return [];

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or(`username.ilike.%${sanitizedQuery.replace(/[%_\\]/g, '\\$&')}%,full_name.ilike.%${sanitizedQuery.replace(/[%_\\]/g, '\\$&')}%`)
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching profiles:', error);
            return [];
        }
    }

    /**
     * Records the language the app is set to, so the server can write push notifications in
     * it (the queue is built by a database trigger, which has no other way of knowing).
     *
     * Fire and forget: failing to record a preference must never interrupt the user.
     */
    static async syncPreferredLanguage(language: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('profiles').update({ preferred_language: language }).eq('id', user.id);
        } catch (error) {
            captureError(error as Error, { context: 'syncPreferredLanguage', language });
        }
    }
}
