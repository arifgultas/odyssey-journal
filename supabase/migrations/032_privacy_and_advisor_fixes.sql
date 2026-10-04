-- Before build 8 (4 October): Supabase Security Advisor findings S1-S3 (29 September) and two
-- privacy items the website review found (W1 home location, W3 push queue retention).
BEGIN;

-- =============================================================================================
-- S1: storage buckets could be listed by anyone
-- =============================================================================================
-- The three image buckets are public, so a file opens from its public URL whatever the SELECT
-- policies say (getPublicUrl, and moderate-content handing those URLs to OpenAI, keep working).
-- A broad SELECT policy only adds listing: anyone, signed in or not, could enumerate every
-- user's file paths. Listing is used for one thing, account deletion listing the caller's own
-- folder (listAllUserImages), so SELECT is narrowed to the owner. A storage delete or upsert also
-- needs the row to be visible to its owner, which this keeps.
-- Avatars keep the legacy 'avatars/<uid>-<time>' name, as 030 does for update and delete, so
-- account deletion still finds and removes old avatars.

-- Policy names have differed between the files run on this project over time (see 030), so every
-- SELECT policy that mentions one of the three buckets is dropped, whatever it is called.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND cmd = 'SELECT'
          AND COALESCE(qual, '') ~ '''(avatars|posts|collection-covers)''::text'
    LOOP
        EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Users see their own avatars"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'avatars'
        AND ((storage.foldername(name))[1] = auth.uid()::text
             OR name LIKE 'avatars/' || auth.uid()::text || '-%')
    );

CREATE POLICY "Users see their own post images"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users see their own collection covers"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'collection-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- =============================================================================================
-- S2: destination summaries were callable without signing in
-- =============================================================================================
-- Both are SECURITY DEFINER and return a location summary of posts, which anon cannot read
-- directly. The app only calls them from the Explore tab, behind sign-in. Functions are
-- executable by PUBLIC by default, so PUBLIC is revoked as well.
REVOKE ALL ON FUNCTION public.get_popular_destinations(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_trending_locations(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_popular_destinations(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_locations(integer) TO authenticated;

-- =============================================================================================
-- S3: a trigger function was directly executable
-- =============================================================================================
-- EXECUTE is checked when a trigger is created, not when it fires, so the trigger keeps working.
REVOKE ALL ON FUNCTION public.move_profile_push_token() FROM PUBLIC, anon, authenticated;

-- =============================================================================================
-- W1: home location coordinates were readable by every signed-in user
-- =============================================================================================
-- profiles.home_location was added by hand on the hosted project and sits on a row every
-- signed-in user can select. The app never shows it, but the API returned it, and the app itself
-- read another user's row to work out their "kilometers" figure. The coordinates move to a table
-- only the owner can read; the kilometers figure is computed here and only the number leaves.

-- Fresh databases built from FULL_SETUP.sql never had the column; older builds still write it.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_location jsonb;

CREATE TABLE IF NOT EXISTS public.user_home_locations (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    city text CHECK (char_length(city) <= 100),
    country text CHECK (char_length(country) <= 100),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_home_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own home location" ON public.user_home_locations;
DROP POLICY IF EXISTS "Users add their own home location" ON public.user_home_locations;
DROP POLICY IF EXISTS "Users change their own home location" ON public.user_home_locations;
DROP POLICY IF EXISTS "Users remove their own home location" ON public.user_home_locations;

CREATE POLICY "Users read their own home location"
    ON public.user_home_locations FOR SELECT TO authenticated
    USING (user_id = auth.uid());
CREATE POLICY "Users add their own home location"
    ON public.user_home_locations FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users change their own home location"
    ON public.user_home_locations FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users remove their own home location"
    ON public.user_home_locations FOR DELETE TO authenticated
    USING (user_id = auth.uid());

REVOKE ALL ON public.user_home_locations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_home_locations TO authenticated;

-- The jsonb shape the app has written: {latitude, longitude, city?, country?}; the old stats
-- code also accepted {lat, lon}. Anything without two usable numbers is ignored, as it was.
CREATE OR REPLACE FUNCTION public.store_home_location(p_user_id uuid, p_home jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    lat_text text := COALESCE(p_home->>'latitude', p_home->>'lat');
    lon_text text := COALESCE(p_home->>'longitude', p_home->>'lon');
    lat double precision;
    lon double precision;
BEGIN
    IF p_user_id IS NULL OR p_home IS NULL OR jsonb_typeof(p_home) <> 'object' THEN
        RETURN;
    END IF;
    IF lat_text !~ '^\s*-?[0-9]+(\.[0-9]+)?\s*$' OR lon_text !~ '^\s*-?[0-9]+(\.[0-9]+)?\s*$' THEN
        RETURN;
    END IF;
    lat := lat_text::double precision;
    lon := lon_text::double precision;
    IF lat NOT BETWEEN -90 AND 90 OR lon NOT BETWEEN -180 AND 180 THEN
        RETURN;
    END IF;

    INSERT INTO public.user_home_locations (user_id, latitude, longitude, city, country, updated_at)
    VALUES (
        p_user_id, lat, lon,
        left(NULLIF(p_home->>'city', ''), 100),
        left(NULLIF(p_home->>'country', ''), 100),
        now()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.store_home_location(uuid, jsonb) FROM PUBLIC, anon, authenticated;

-- Move what is already there, then empty the column
SELECT public.store_home_location(id, home_location)
FROM public.profiles
WHERE home_location IS NOT NULL;

UPDATE public.profiles SET home_location = NULL WHERE home_location IS NOT NULL;

-- Older builds (TestFlight 7 and earlier) still write profiles.home_location: the value is moved
-- to the new table and the column stays empty, the same way 030 handles expo_push_token. RLS has
-- already limited an UPDATE to the caller's own row by the time this BEFORE trigger sees it.
CREATE OR REPLACE FUNCTION public.move_profile_home_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- On INSERT the profile row does not exist yet for the foreign key; no build has ever sent a
    -- home location when creating a profile, so the value is simply not kept.
    IF NEW.home_location IS NOT NULL AND TG_OP = 'UPDATE' THEN
        PERFORM public.store_home_location(NEW.id, NEW.home_location);
    END IF;
    NEW.home_location := NULL;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.move_profile_home_location() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS move_profile_home_location ON public.profiles;
CREATE TRIGGER move_profile_home_location
    BEFORE INSERT OR UPDATE OF home_location ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.move_profile_home_location();

-- The boarding pass "kilometers" figure: a round trip from home to every post that has
-- coordinates, the same sum the app used to compute on the device (lib/profile-service.ts).
-- Without a home location the distance is measured from Istanbul, as before. Only the rounded
-- number is returned. NULL when either side has blocked the other, matching the profile policy.
CREATE OR REPLACE FUNCTION public.get_travel_distance_km(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    home_lat double precision := 41.0082;
    home_lon double precision := 28.9784;
    total double precision;
BEGIN
    IF auth.uid() IS NULL OR p_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    IF public.is_blocked_by(auth.uid(), p_user_id) THEN
        RETURN NULL;
    END IF;

    SELECT h.latitude, h.longitude INTO home_lat, home_lon
    FROM public.user_home_locations h
    WHERE h.user_id = p_user_id;
    IF NOT FOUND THEN
        home_lat := 41.0082;
        home_lon := 28.9784;
    END IF;

    SELECT COALESCE(SUM(
        2 * 6371 * 2 * atan2(
            sqrt(a),
            sqrt(1 - a)
        )
    ), 0)
    INTO total
    FROM (
        SELECT
            sin(radians(lat - home_lat) / 2) ^ 2
            + cos(radians(home_lat)) * cos(radians(lat)) * sin(radians(lon - home_lon) / 2) ^ 2 AS a
        FROM (
            SELECT (p.location->>'latitude')::double precision AS lat,
                   (p.location->>'longitude')::double precision AS lon
            FROM public.posts p
            WHERE p.user_id = p_user_id
              AND jsonb_typeof(p.location->'latitude') = 'number'
              AND jsonb_typeof(p.location->'longitude') = 'number'
        ) coords
        -- The app skipped a zero coordinate (a falsy check), so this does too
        WHERE lat <> 0 AND lon <> 0
    ) legs;

    RETURN round(total)::integer;
END;
$$;

REVOKE ALL ON FUNCTION public.get_travel_distance_km(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_travel_distance_km(uuid) TO authenticated;

-- =============================================================================================
-- W3: sent push notifications were kept forever
-- =============================================================================================
-- Each queue row holds a device token, the actor's name and IDs. Delivered rows (and the unsent
-- ones 029 retires after a day) are deleted once they are 30 days old. There is no sent_at
-- column; created_at is when the notification was queued, which is within a minute of sending.
-- cron.schedule replaces a job with the same name, so running this again is harmless.
SELECT cron.schedule(
    'purge-push-queue',
    '17 3 * * *',
    $$DELETE FROM public.push_notification_queue WHERE sent AND created_at < now() - interval '30 days';$$
);

COMMIT;
