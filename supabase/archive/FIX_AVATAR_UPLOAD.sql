-- Fix Avatar Upload RLS Policy
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create simpler, more permissive policies

-- Allow public read access to all avatars
CREATE POLICY "Public Avatar Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow users to update any avatar (can be restricted later)
CREATE POLICY "Authenticated users can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Allow users to delete any avatar (can be restricted later)
CREATE POLICY "Authenticated users can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Verify bucket exists and is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';
