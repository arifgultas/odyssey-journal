import { Post } from './posts';
import { supabase } from './supabase';

/**
 * Represents a cluster of posts at a location
 */
export interface LocationCluster {
    id: string;
    latitude: number;
    longitude: number;
    postCount: number;
    posts: Post[];
    city?: string;
    country?: string;
    locationName?: string;
}

/**
 * Fetches all posts with location data and groups them by proximity
 */
export async function fetchPostLocations(): Promise<LocationCluster[]> {
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
            .not('location', 'is', null)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Group posts by location (using city/country as key for clustering)
        const locationMap = new Map<string, LocationCluster>();

        data.forEach((post: Post) => {
            if (!post.location?.latitude || !post.location?.longitude) {
                return;
            }

            // Create a location key based on city/country or rounded coordinates
            const locationKey = post.location.city && post.location.country
                ? `${post.location.city}-${post.location.country}`
                : `${Math.round(post.location.latitude * 100) / 100}-${Math.round(post.location.longitude * 100) / 100}`;

            if (locationMap.has(locationKey)) {
                const cluster = locationMap.get(locationKey)!;
                cluster.posts.push(post);
                cluster.postCount++;
            } else {
                locationMap.set(locationKey, {
                    id: locationKey,
                    latitude: post.location.latitude,
                    longitude: post.location.longitude,
                    postCount: 1,
                    posts: [post],
                    city: post.location.city,
                    country: post.location.country,
                    locationName: post.location.city || post.location.country || 'Unknown Location',
                });
            }
        });

        return Array.from(locationMap.values());
    } catch (error) {
        console.error('Error fetching post locations:', error);
        throw error;
    }
}

/**
 * Calculates the center point of all location clusters
 */
export function calculateMapCenter(clusters: LocationCluster[]): { latitude: number; longitude: number } {
    if (clusters.length === 0) {
        // Default to Turkey's center
        return { latitude: 39.0, longitude: 35.0 };
    }

    const totalLat = clusters.reduce((sum, c) => sum + c.latitude, 0);
    const totalLng = clusters.reduce((sum, c) => sum + c.longitude, 0);

    return {
        latitude: totalLat / clusters.length,
        longitude: totalLng / clusters.length,
    };
}

/**
 * Calculates appropriate zoom delta based on cluster spread
 */
export function calculateZoomDelta(clusters: LocationCluster[]): { latDelta: number; lngDelta: number } {
    if (clusters.length <= 1) {
        return { latDelta: 5.0, lngDelta: 5.0 };
    }

    const lats = clusters.map(c => c.latitude);
    const lngs = clusters.map(c => c.longitude);

    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);

    // Add padding
    return {
        latDelta: Math.max(latSpread * 1.5, 2.0),
        lngDelta: Math.max(lngSpread * 1.5, 2.0),
    };
}
