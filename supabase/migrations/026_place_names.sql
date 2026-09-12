-- Shared cache of localized place names.
--
-- Place names differ per language (Constanța is "Köstence" in Turkish). The app ships the
-- well-known ones, and resolves the rest from Wikidata on first sight. This table makes
-- that a one-time cost for the whole community instead of once per device: the first person
-- to view a post from a place fills the row, everyone else reads it.
--
-- Rows are immutable facts about a place, so any signed-in user may insert one, and nobody
-- may change or delete an existing row.

CREATE TABLE IF NOT EXISTS public.place_names (
    -- Folded city name plus ISO country code, e.g. 'constanta|RO' (see placeKeyFor())
    key text PRIMARY KEY,
    -- Wikidata entity id the names came from, e.g. 'Q79808'
    wikidata_id text,
    -- { "tr": "Köstence", "ja": "コンスタンツァ", ... }
    names jsonb NOT NULL DEFAULT '{}'::jsonb,
    country_code text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.place_names IS
    'Localized city names resolved from Wikidata, shared by all users. Filled on demand by the app.';

CREATE INDEX IF NOT EXISTS idx_place_names_country ON public.place_names(country_code);

ALTER TABLE public.place_names ENABLE ROW LEVEL SECURITY;

-- Readable by everyone: the names are public reference data
DROP POLICY IF EXISTS "Place names are readable by everyone" ON public.place_names;
CREATE POLICY "Place names are readable by everyone"
    ON public.place_names FOR SELECT
    USING (true);

-- Any signed-in user may add a place that is not cached yet
DROP POLICY IF EXISTS "Signed-in users can cache a new place" ON public.place_names;
CREATE POLICY "Signed-in users can cache a new place"
    ON public.place_names FOR INSERT
    TO authenticated
    WITH CHECK (
        -- The key is a folded city name, optionally followed by the uppercase ISO country
        -- code: 'constanta' or 'constanta|RO' (see placeKeyFor in lib/place-names.ts)
        key ~ '^[^|]{1,190}(\|[A-Z]{2})?$'
        AND (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
        AND jsonb_typeof(names) = 'object'
    );

-- No UPDATE or DELETE policy on purpose: a cached name is never rewritten from a client.

GRANT SELECT ON public.place_names TO anon, authenticated;
GRANT INSERT ON public.place_names TO authenticated;
