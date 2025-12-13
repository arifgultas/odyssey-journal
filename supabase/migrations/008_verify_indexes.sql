-- =====================================================
-- INDEX VERIFICATION QUERIES
-- =====================================================
-- Simple, working queries to verify indexes
-- Run these ONE AT A TIME in Supabase SQL Editor

-- =====================================================
-- 1. LIST ALL CUSTOM INDEXES
-- =====================================================

SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- 2. COUNT INDEXES BY TABLE
-- =====================================================

SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- 3. EXPECTED RESULTS
-- =====================================================
-- 
-- You should see approximately:
-- bookmarks: 2 indexes
-- comments: 2 indexes
-- follows: 3 indexes
-- likes: 2 indexes
-- notifications: 1-2 indexes
-- posts: 6 indexes
-- profiles: 2 indexes
--
-- Total: 18-19 indexes
-- =====================================================
