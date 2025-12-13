-- =====================================================
-- ADVANCED INDEX MONITORING (Optional)
-- =====================================================
-- Run these queries individually to monitor index performance
-- These are more advanced and should be run separately

-- =====================================================
-- 1. INDEX USAGE STATISTICS
-- =====================================================

SELECT 
    relname as table_name,
    indexrelname as index_name,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexrelname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- =====================================================
-- 2. INDEX SIZES
-- =====================================================

SELECT 
    relname as table_name,
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexrelname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- 3. UNUSED INDEXES (idx_scan = 0)
-- =====================================================

SELECT 
    relname as table_name,
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as wasted_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexrelname LIKE 'idx_%'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- =====================================================
-- 4. TABLE STATISTICS
-- =====================================================

SELECT 
    relname as table_name,
    n_live_tup as row_count,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- =====================================================
-- 5. QUERY PERFORMANCE TEST (Example)
-- =====================================================

-- Test home feed query performance
EXPLAIN ANALYZE
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- NOTES
-- =====================================================
--
-- - Run these queries AFTER your app has been running for a while
-- - idx_scan shows how many times an index was used
-- - Low idx_scan might indicate an unused index
-- - High dead_rows might indicate need for VACUUM
--
-- =====================================================
