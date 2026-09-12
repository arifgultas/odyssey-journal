-- Canonical place key on posts, plus destination lists grouped by it.
--
-- Until now destinations were grouped by the raw `location_name` text, which is whatever
-- language the poster's device happened to answer in. "Roma" and "Rome" therefore counted
-- as two different destinations, and neither list could be shown in the reader's language.
--
-- `place_key` is the folded city name plus the ISO country code (see placeKeyFor() in
-- lib/place-names.ts), so every spelling of one city groups together, and `country_code`
-- is returned so the client can render the label in the reader's own language.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS place_key text;

COMMENT ON COLUMN public.posts.place_key IS
    'Canonical place key, e.g. ''constanta|RO''. Groups every spelling of one city together.';

CREATE INDEX IF NOT EXISTS idx_posts_place_key ON public.posts(place_key) WHERE place_key IS NOT NULL;

-- 1. Popular destinations, grouped by place rather than by spelling
DROP FUNCTION IF EXISTS public.get_popular_destinations(integer);
DROP FUNCTION IF EXISTS public.get_popular_destinations();
CREATE OR REPLACE FUNCTION public.get_popular_destinations(p_limit int DEFAULT 10)
RETURNS TABLE (
    place_key text,
    location_name text,
    city text,
    country_code text,
    latitude double precision,
    longitude double precision,
    post_count bigint,
    image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    WITH grouped AS (
        SELECT
            -- Posts saved before this migration have no place_key; fall back to their text
            COALESCE(p.place_key, lower(p.location_name)) AS gkey,
            p.location_name,
            p.location->>'city' AS city,
            p.location->>'countryCode' AS country_code,
            p.latitude,
            p.longitude,
            p.images[1] AS first_image,
            ROW_NUMBER() OVER (
                PARTITION BY COALESCE(p.place_key, lower(p.location_name))
                ORDER BY p.created_at DESC
            ) AS rn
        FROM public.posts p
        WHERE p.location_name IS NOT NULL
    )
    SELECT
        g.gkey AS place_key,
        MAX(g.location_name) FILTER (WHERE g.rn = 1) AS location_name,
        MAX(g.city) FILTER (WHERE g.rn = 1) AS city,
        MAX(g.country_code) FILTER (WHERE g.rn = 1) AS country_code,
        MIN(g.latitude) AS latitude,
        MIN(g.longitude) AS longitude,
        COUNT(*) AS post_count,
        MAX(g.first_image) FILTER (WHERE g.rn = 1) AS image_url
    FROM grouped g
    GROUP BY g.gkey
    ORDER BY COUNT(*) DESC
    LIMIT p_limit;
END;
$$;

-- 2. Trending locations, scored over the last 7 days, grouped the same way.
--    `post_count` stays the all-time total for the place, as before; `recent_post_count`
--    is the number of posts inside the window.
DROP FUNCTION IF EXISTS public.get_trending_locations(integer);
DROP FUNCTION IF EXISTS public.get_trending_locations();
CREATE OR REPLACE FUNCTION public.get_trending_locations(p_limit int DEFAULT 10)
RETURNS TABLE (
    place_key text,
    location_name text,
    city text,
    country_code text,
    latitude double precision,
    longitude double precision,
    post_count bigint,
    recent_post_count bigint,
    trend_score bigint,
    image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    WITH totals AS (
        SELECT
            COALESCE(p.place_key, lower(p.location_name)) AS gkey,
            COUNT(*)::bigint AS all_time_count
        FROM public.posts p
        WHERE p.location_name IS NOT NULL
        GROUP BY COALESCE(p.place_key, lower(p.location_name))
    ),
    recent AS (
        SELECT
            COALESCE(p.place_key, lower(p.location_name)) AS gkey,
            p.location_name,
            p.location->>'city' AS city,
            p.location->>'countryCode' AS country_code,
            p.latitude,
            p.longitude,
            p.images[1] AS first_image,
            GREATEST(7 - EXTRACT(DAY FROM (now() - p.created_at)), 1)::bigint AS score,
            ROW_NUMBER() OVER (
                PARTITION BY COALESCE(p.place_key, lower(p.location_name))
                ORDER BY p.created_at DESC
            ) AS rn
        FROM public.posts p
        WHERE p.location_name IS NOT NULL
          AND p.created_at >= now() - INTERVAL '7 days'
    )
    SELECT
        r.gkey AS place_key,
        MAX(r.location_name) FILTER (WHERE r.rn = 1) AS location_name,
        MAX(r.city) FILTER (WHERE r.rn = 1) AS city,
        MAX(r.country_code) FILTER (WHERE r.rn = 1) AS country_code,
        MIN(r.latitude) AS latitude,
        MIN(r.longitude) AS longitude,
        t.all_time_count AS post_count,
        COUNT(*)::bigint AS recent_post_count,
        SUM(r.score)::bigint AS trend_score,
        MAX(r.first_image) FILTER (WHERE r.rn = 1) AS image_url
    FROM recent r
    JOIN totals t ON t.gkey = r.gkey
    GROUP BY r.gkey, t.all_time_count
    ORDER BY SUM(r.score) DESC
    LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_popular_destinations(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_locations(integer) TO anon, authenticated;
