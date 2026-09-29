-- Migration: Add categories field to posts table
-- This allows posts to be filtered by category in the Explore screen

-- Add categories array column to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Create index for faster category-based queries
CREATE INDEX IF NOT EXISTS posts_categories_idx ON posts USING GIN (categories);

-- Note: After running this migration, existing posts will have empty categories array
-- New posts created with category selection will have their categories stored
