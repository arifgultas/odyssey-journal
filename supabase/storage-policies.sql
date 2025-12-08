-- STORAGE POLICIES FOR AVATARS BUCKET
-- Run this after creating the 'avatars' bucket in Supabase Storage

-- Allow users to upload their own avatar
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
create policy "Avatar images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Allow users to update their own avatar
create policy "Users can update their own avatar"
on storage.objects for update
using ( 
  bucket_id = 'avatars' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
create policy "Users can delete their own avatar"
on storage.objects for delete
using ( 
  bucket_id = 'avatars' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- STORAGE POLICIES FOR POSTS BUCKET
-- Run this after creating the 'posts' bucket in Supabase Storage

-- Allow authenticated users to upload post images
create policy "Users can upload post images"
on storage.objects for insert
with check (
  bucket_id = 'posts' 
  and auth.role() = 'authenticated'
);

-- Allow public read access
create policy "Post images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'posts' );

-- Allow users to delete their own post images
create policy "Users can delete their own post images"
on storage.objects for delete
using ( 
  bucket_id = 'posts' 
  and auth.uid()::text = (storage.foldername(name))[1]
);
