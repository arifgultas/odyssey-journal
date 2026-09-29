-- =====================================================
-- MANUAL USER EMAIL CONFIRMATION
-- =====================================================
-- Use these queries to manually confirm user emails in Supabase

-- =====================================================
-- METHOD 1: CONFIRM SPECIFIC USER BY EMAIL
-- =====================================================

-- Find user by email first
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'USER_EMAIL_HERE@example.com';

-- Confirm the user (replace USER_EMAIL with actual email)
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'USER_EMAIL_HERE@example.com'
  AND email_confirmed_at IS NULL;

-- =====================================================
-- METHOD 2: CONFIRM USER BY ID
-- =====================================================

-- If you know the user ID
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE id = 'USER_ID_HERE'
  AND email_confirmed_at IS NULL;

-- =====================================================
-- METHOD 3: CONFIRM ALL UNCONFIRMED USERS
-- =====================================================

-- ⚠️ WARNING: This confirms ALL unconfirmed users!
-- Only use in development/testing

UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all users and their confirmation status
SELECT 
    id,
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'NOT CONFIRMED'
        ELSE 'CONFIRMED'
    END as status,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Count confirmed vs unconfirmed users
SELECT 
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'Unconfirmed'
        ELSE 'Confirmed'
    END as status,
    COUNT(*) as user_count
FROM auth.users
GROUP BY 
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'Unconfirmed'
        ELSE 'Confirmed'
    END;

-- =====================================================
-- FIND RECENTLY REGISTERED USERS
-- =====================================================

-- Show users registered in last 24 hours
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN 'NEEDS CONFIRMATION'
        ELSE 'CONFIRMED'
    END as status
FROM auth.users
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- =====================================================
-- COMPLETE USER PROFILE CHECK
-- =====================================================

-- Check if user has a profile in profiles table
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    p.username,
    p.full_name,
    CASE 
        WHEN u.email_confirmed_at IS NULL THEN 'Email Not Confirmed'
        WHEN p.id IS NULL THEN 'Profile Missing'
        ELSE 'Complete'
    END as account_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- =====================================================
-- NOTES
-- =====================================================
--
-- 1. Email Confirmation:
--    - email_confirmed_at = NULL means not confirmed
--    - email_confirmed_at = timestamp means confirmed
--
-- 2. After Confirmation:
--    - User can log in without email verification
--    - User's account is fully active
--
-- 3. Development Mode:
--    - You can disable email confirmation in Supabase settings
--    - Go to: Authentication → Settings → Email Auth
--    - Toggle "Enable email confirmations"
--
-- 4. Profile Creation:
--    - Make sure user has a profile in public.profiles table
--    - This should be created automatically via trigger
--
-- =====================================================
