-- Phase 5: Search & Discovery Schema

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  type TEXT CHECK (type IN ('location', 'username', 'tag')) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Policies for search_history
CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search history"
  ON search_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
  ON search_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

-- Create indexes on posts for search optimization
CREATE INDEX IF NOT EXISTS idx_posts_location_name ON posts(location_name);
CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count_desc ON posts(likes_count DESC);

-- Create full-text search index on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING gin(
  to_tsvector('english', coalesce(username, '') || ' ' || coalesce(full_name, ''))
);

-- Function to get trending locations (last 7 days)
CREATE OR REPLACE FUNCTION get_trending_locations(limit_count INT DEFAULT 10)
RETURNS TABLE (
  location_name TEXT,
  post_count BIGINT,
  recent_post_count BIGINT,
  trend_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.location_name,
    COUNT(*)::BIGINT as post_count,
    COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '7 days')::BIGINT as recent_post_count,
    (COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '7 days') * 2 + 
     COUNT(*) FILTER (WHERE p.created_at >= NOW() - INTERVAL '3 days') * 3)::NUMERIC as trend_score
  FROM posts p
  WHERE p.location_name IS NOT NULL
    AND p.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY p.location_name
  ORDER BY trend_score DESC, recent_post_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended places
CREATE OR REPLACE FUNCTION get_recommended_places(limit_count INT DEFAULT 10)
RETURNS TABLE (
  location_name TEXT,
  post_count BIGINT,
  avg_likes NUMERIC,
  first_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.location_name,
    COUNT(*)::BIGINT as post_count,
    AVG(p.likes_count)::NUMERIC as avg_likes,
    (ARRAY_AGG(p.images[1] ORDER BY p.likes_count DESC))[1] as first_image
  FROM posts p
  WHERE p.location_name IS NOT NULL
    AND p.images IS NOT NULL
    AND array_length(p.images, 1) > 0
  GROUP BY p.location_name
  HAVING COUNT(*) >= 2
  ORDER BY post_count DESC, avg_likes DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
