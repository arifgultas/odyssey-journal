-- =====================================================
-- NOTIFICATIONS TABLE SCHEMA CHECK AND UPDATE
-- =====================================================
-- Run this to check and update notifications table structure

-- Step 1: Check current notifications table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
ORDER BY ordinal_position;

-- =====================================================
-- If 'is_read' or 'read' column doesn't exist, run this:
-- =====================================================

-- Add is_read column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add index for unread notifications (run after adding column)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, is_read, created_at DESC);

-- =====================================================
-- Update existing notifications to be unread
-- =====================================================

-- Set all existing notifications as unread (optional)
-- UPDATE notifications SET is_read = FALSE WHERE is_read IS NULL;

-- =====================================================
-- VERIFY
-- =====================================================

-- Check if column was added successfully
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'notifications'
  AND column_name = 'is_read';
