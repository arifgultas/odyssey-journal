# Supabase Configuration Guide

## 1. Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** (gear icon) → **API**
4. Copy the following:
   - **Project URL** (looks like: https://xxxxxxxxxxxxx.supabase.co)
   - **anon/public key** (starts with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)

## 2. Update Your .env File

Replace the placeholder values in `.env` with your actual credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## 3. Storage Buckets Setup

### Create Storage Buckets for Images:

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Create two buckets:

#### Bucket 1: `avatars`
- Name: `avatars`
- Public: ✅ Yes (so profile pictures are accessible)
- File size limit: 2MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

#### Bucket 2: `posts`
- Name: `posts`
- Public: ✅ Yes (so post images are accessible)
- File size limit: 5MB
- Allowed MIME types: `image/png, image/jpeg, image/jpg, image/webp`

### Storage Policies (RLS):

After creating buckets, set up policies:

**For `avatars` bucket:**
```sql
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
```

**For `posts` bucket:**
```sql
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
```

## 4. Email Templates (Optional but Recommended)

Go to **Authentication** → **Email Templates** and customize:
- Confirm signup
- Magic Link
- Change Email Address
- Reset Password

Add your app branding and styling.

## 5. Authentication Settings

Go to **Authentication** → **Settings**:

### Email Auth:
- ✅ Enable Email provider
- ✅ Confirm email (recommended for production)
- Disable email confirmations for development (optional)

### Social Auth (for future):
- Google OAuth (you'll need Google Cloud credentials)
- Apple Sign In (you'll need Apple Developer credentials)

## 6. Database Indexes (Performance)

Run these in SQL Editor for better performance:

```sql
-- Index on posts for faster queries
create index posts_user_id_idx on posts(user_id);
create index posts_created_at_idx on posts(created_at desc);

-- Index on interactions
create index interactions_user_id_idx on interactions(user_id);
create index interactions_post_id_idx on interactions(post_id);

-- Index on follows
create index follows_follower_id_idx on follows(follower_id);
create index follows_following_id_idx on follows(following_id);

-- Index on comments
create index comments_post_id_idx on comments(post_id);
create index comments_user_id_idx on comments(user_id);

-- Index on notifications
create index notifications_user_id_idx on notifications(user_id);
create index notifications_read_idx on notifications(read);
```

## 7. Restart Your Expo Server

After updating `.env`, restart the server:
```bash
# Stop the current server (Ctrl+C)
# Then run:
npx expo start --clear
```

## ✅ Checklist

- [ ] Copy Project URL and anon key
- [ ] Update `.env` file
- [ ] Create `avatars` storage bucket
- [ ] Create `posts` storage bucket
- [ ] Add storage policies
- [ ] Add database indexes
- [ ] Restart Expo server
- [ ] Test authentication

## 🎯 Next Steps

After completing this setup:
1. Test signup/login in your app
2. Verify profile creation in Supabase dashboard
3. Ready to build Post creation feature!
