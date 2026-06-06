-- 1. Popular Destinations
CREATE OR REPLACE FUNCTION public.get_popular_destinations(p_limit int DEFAULT 10)
RETURNS TABLE (
    location_name text,
    latitude double precision,
    longitude double precision,
    post_count bigint,
    image_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_posts AS (
        SELECT 
            p.location_name,
            p.latitude,
            p.longitude,
            p.images[1] as first_image,
            ROW_NUMBER() OVER (PARTITION BY p.location_name ORDER BY p.created_at DESC) as rn
        FROM public.posts p
        WHERE p.location_name IS NOT NULL
    )
    SELECT 
        p.location_name,
        MIN(p.latitude) as latitude,
        MIN(p.longitude) as longitude,
        COUNT(*) as post_count,
        (SELECT rp.first_image FROM ranked_posts rp WHERE rp.location_name = p.location_name AND rp.rn = 1) as image_url
    FROM public.posts p
    WHERE p.location_name IS NOT NULL
    GROUP BY p.location_name
    ORDER BY post_count DESC
    LIMIT p_limit;
END;
$$;

-- 2. Trending Locations (Son 7 gün içinde trend skoruna göre)
CREATE OR REPLACE FUNCTION public.get_trending_locations(p_limit int DEFAULT 10)
RETURNS TABLE (
    location_name text,
    latitude double precision,
    longitude double precision,
    post_count bigint,
    recent_post_count bigint,
    trend_score bigint,
    image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH post_scores AS (
        SELECT 
            p.location_name,
            p.latitude,
            p.longitude,
            p.created_at,
            p.images[1] as first_image,
            GREATEST(7 - EXTRACT(DAY FROM (now() - p.created_at)), 1)::bigint as score
        FROM public.posts p
        WHERE p.location_name IS NOT NULL
          AND p.created_at >= now() - INTERVAL '7 days'
    ),
    ranked_posts AS (
        SELECT 
            ps.location_name,
            ps.first_image,
            ROW_NUMBER() OVER (PARTITION BY ps.location_name ORDER BY ps.created_at DESC) as rn
        FROM post_scores ps
    )
    SELECT 
        ps.location_name,
        MIN(ps.latitude) as latitude,
        MIN(ps.longitude) as longitude,
        (SELECT COUNT(*) FROM public.posts p2 WHERE p2.location_name = ps.location_name)::bigint as post_count,
        COUNT(*)::bigint as recent_post_count,
        SUM(ps.score)::bigint as trend_score,
        (SELECT rp.first_image FROM ranked_posts rp WHERE rp.location_name = ps.location_name AND rp.rn = 1) as image_url
    FROM post_scores ps
    GROUP BY ps.location_name
    ORDER BY trend_score DESC
    LIMIT p_limit;
END;
$$;
