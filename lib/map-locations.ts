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
 * Fetches all posts that contain valid location data from Supabase
 */
export async function fetchPostsWithLocation(): Promise<Post[]> {
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

        return (data as Post[]) || [];
    } catch (error) {
        console.error('Error fetching posts with location:', error);
        throw error;
    }
}

/**
 * Dynamically clusters posts based on coordinates and current zoom level
 */
export function clusterLocations(posts: Post[], zoom: number): LocationCluster[] {
    if (!posts || posts.length === 0) return [];

    // Clustering threshold in degrees depending on zoom level
    // Lower threshold means points must be closer together to cluster (zoomed in)
    // Higher threshold means points further apart will cluster (zoomed out)
    const threshold = 1.5 / Math.pow(2, zoom);
    const clusters: LocationCluster[] = [];

    posts.forEach((post) => {
        if (!post.location?.latitude || !post.location?.longitude) {
            return;
        }

        const lat = post.location.latitude;
        const lng = post.location.longitude;

        // Find an existing cluster close enough
        const match = clusters.find((c) => {
            const latDiff = Math.abs(c.latitude - lat);
            const lngDiff = Math.abs(c.longitude - lng);
            return latDiff < threshold && lngDiff < threshold;
        });

        if (match) {
            match.posts.push(post);
            match.postCount++;
            // Update cluster center to be the average (centroid) of all its posts
            match.latitude = (match.latitude * (match.postCount - 1) + lat) / match.postCount;
            match.longitude = (match.longitude * (match.postCount - 1) + lng) / match.postCount;
        } else {
            clusters.push({
                id: `cluster-${post.id}`,
                latitude: lat,
                longitude: lng,
                postCount: 1,
                posts: [post],
                city: post.location.city,
                country: post.location.country,
                locationName: post.location.city || post.location.country || 'Unknown Location',
            });
        }
    });

    return clusters;
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
