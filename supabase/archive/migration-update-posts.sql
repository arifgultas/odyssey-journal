-- Update posts table to match the application schema
-- Run this in Supabase SQL Editor

-- Add missing columns
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS images text[],
ADD COLUMN IF NOT EXISTS location jsonb,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS likes_count integer default 0,
ADD COLUMN IF NOT EXISTS comments_count integer default 0;

-- Update existing data if needed (optional)
-- Migrate image_urls to images if data exists
UPDATE posts SET images = image_urls WHERE image_urls IS NOT NULL AND images IS NULL;

-- Migrate location data to JSON format if needed
UPDATE posts 
SET location = jsonb_build_object(
  'latitude', latitude,
  'longitude', longitude,
  'address', location_name
)
WHERE latitude IS NOT NULL AND location IS NULL;

-- You can optionally drop old columns after migration
-- ALTER TABLE posts DROP COLUMN IF EXISTS image_urls;
-- ALTER TABLE posts DROP COLUMN IF EXISTS location_name;
-- ALTER TABLE posts DROP COLUMN IF EXISTS latitude;
-- ALTER TABLE posts DROP COLUMN IF EXISTS longitude;
