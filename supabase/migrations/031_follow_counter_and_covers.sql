-- Two leftovers found by the post-030 verification query (19 September).
BEGIN;

-- 1. Follow counts were maintained by two triggers at once: FULL_SETUP.sql's
--    trigger_update_follow_counts and 004's update_follower_counts_trigger. Both add one, so
--    every new follow would count twice (the live counts were still right only because no
--    follow had happened since both existed). Keep the FULL_SETUP one.
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON public.follows;

-- Bring any count that already drifted back in line with the follows table
UPDATE public.profiles p
SET followers_count = c.followers, following_count = c.following
FROM (
    SELECT pr.id,
           (SELECT count(*) FROM public.follows f WHERE f.following_id = pr.id)::int AS followers,
           (SELECT count(*) FROM public.follows f WHERE f.follower_id = pr.id)::int AS following
    FROM public.profiles pr
) c
WHERE p.id = c.id
  AND (p.followers_count IS DISTINCT FROM c.followers OR p.following_count IS DISTINCT FROM c.following);

-- 2. collection-covers had update/delete/upload policies but no SELECT policy on the hosted
--    project. Public URLs work without one, but listing does not, and a storage delete checks
--    that the row is visible first, so a user could not remove or replace their own cover and
--    account deletion could not find them. Same rule as the other two image buckets.
DROP POLICY IF EXISTS "Collection covers are publicly accessible" ON storage.objects;
CREATE POLICY "Collection covers are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'collection-covers');

COMMIT;
