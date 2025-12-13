# Phase 4: User Profile & Discovery - Implementation Guide

This guide explains the implementation of Phase 4 features for the Odyssey Journal app.

## ✅ Implemented Features

### 1. User Profile Screen
- **Location**: `app/(tabs)/profile.tsx`
- **Features**:
  - Full profile header with avatar, name, username, bio, and website
  - Real-time profile stats (posts, followers, following, countries visited)
  - Travel history grid (3-column Instagram-style layout)
  - Edit profile button
  - Logout functionality
  - Pull-to-refresh support

### 2. Edit Profile Functionality
- **Component**: `components/edit-profile-modal.tsx`
- **Features**:
  - Modal-based profile editing
  - Update full name, username, bio, and website
  - Avatar upload with image picker
  - Real-time preview
  - Form validation
  - Loading states

### 3. Avatar Upload & Update
- **Service**: `lib/profile-service.ts` - `uploadAvatar()`
- **Features**:
  - Image picker integration
  - Upload to Supabase storage (`avatars` bucket)
  - Automatic file naming with user ID and timestamp
  - Public URL generation
  - Error handling

### 4. Profile Stats
- **Component**: `components/profile-stats-bar.tsx`
- **Features**:
  - Posts count
  - Followers count (clickable - navigates to followers list)
  - Following count (clickable - navigates to following list)
  - Countries visited (calculated from unique post locations)
  - Clean, card-based design

### 5. Travel History Grid
- **Component**: `components/travel-grid.tsx`
- **Features**:
  - 3-column grid layout
  - Displays first image from each post
  - Tap to view post details
  - Responsive sizing
  - Instagram-style presentation

### 6. View Other Users' Profiles
- **Location**: `app/user-profile/[id].tsx`
- **Features**:
  - View any user's profile by ID
  - Same layout as own profile
  - Follow/unfollow button
  - Navigate from post cards by tapping username/avatar
  - Back navigation

### 7. Follow/Unfollow from Profile
- **Hook**: `hooks/use-follow.ts`
- **Features**:
  - Follow/unfollow toggle
  - Optimistic UI updates
  - Automatic cache invalidation
  - Loading states
  - Error handling

## 📁 File Structure

```
odyssey-journal/
├── app/
│   ├── (tabs)/
│   │   └── profile.tsx                 # Main profile screen
│   └── user-profile/
│       └── [id].tsx                    # Other users' profile screen
├── components/
│   ├── edit-profile-modal.tsx          # Profile editing modal
│   ├── profile-header.tsx              # Profile header component
│   ├── profile-stats-bar.tsx           # Stats display component
│   └── travel-grid.tsx                 # Travel history grid
├── hooks/
│   ├── use-profile.ts                  # Profile-related hooks
│   └── use-follow.ts                   # Follow/unfollow hook
├── lib/
│   ├── profile-service.ts              # Profile service layer
│   └── types/
│       └── profile.ts                  # Profile TypeScript types
└── supabase/
    └── migrations/
        └── 004_phase4_profile_discovery.sql  # Database migration
```

## 🗄️ Database Changes

### New Columns in `profiles` table:
- `followers_count` (INTEGER) - Cached follower count
- `following_count` (INTEGER) - Cached following count
- `posts_count` (INTEGER) - Cached post count

### Storage Bucket:
- `avatars` - Public bucket for user avatars

### Triggers:
- `update_follower_counts_trigger` - Auto-updates follower/following counts
- `update_post_counts_trigger` - Auto-updates post counts

### Indexes:
- `idx_profiles_username` - Fast username lookups
- `idx_profiles_full_name` - Fast name searches
- `idx_posts_user_id_created_at` - Optimized user post queries
- `idx_follows_follower_id` - Optimized follower queries
- `idx_follows_following_id` - Optimized following queries

## 🔧 Setup Instructions

### 1. Run Database Migration
```sql
-- Execute in Supabase SQL Editor
-- File: supabase/migrations/004_phase4_profile_discovery.sql
```

This will:
- Add count columns to profiles table
- Create avatars storage bucket
- Set up storage policies
- Create triggers for automatic count updates
- Add performance indexes
- Initialize counts for existing data

### 2. Verify Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Confirm `avatars` bucket exists
3. Verify it's set to public
4. Check policies are active

### 3. Test the Features

#### Test Profile Screen:
1. Navigate to Profile tab
2. Verify stats display correctly
3. Test pull-to-refresh
4. Check travel grid displays posts

#### Test Edit Profile:
1. Tap "Edit Profile" button
2. Update profile fields
3. Upload a new avatar
4. Save and verify changes

#### Test User Navigation:
1. Go to Home feed
2. Tap on a user's name/avatar in a post
3. Verify navigation to their profile
4. Test follow/unfollow button

#### Test Follow System:
1. Follow a user from their profile
2. Check followers/following counts update
3. Navigate to followers/following lists
4. Verify counts are accurate

## 🎨 UI Components

### ProfileHeader
- Displays user avatar (with fallback)
- Shows full name, username, bio, website
- Edit button (for own profile)
- Follow button (for other profiles)
- Loading states for follow action

### ProfileStatsBar
- 4 stat items in a row
- Clickable followers/following (navigates to lists)
- Countries count (calculated from posts)
- Clean card design with dividers

### TravelGrid
- 3-column responsive grid
- Square image tiles
- Tap to view post detail
- Efficient rendering with FlatList

### EditProfileModal
- Full-screen modal
- Form fields for all editable data
- Image picker for avatar
- Save/Cancel actions
- Loading states

## 🔄 Data Flow

### Profile Loading:
1. `useCurrentProfile()` fetches profile data
2. `useProfileStats()` calculates stats
3. `useUserPosts()` loads user's posts
4. Components render with data

### Profile Editing:
1. User taps "Edit Profile"
2. Modal opens with current data
3. User makes changes
4. `useUpdateProfile()` mutation saves
5. Cache invalidated and refetched
6. UI updates automatically

### Follow/Unfollow:
1. User taps follow button
2. `useFollowUser()` mutation executes
3. Optimistic UI update
4. Database updated via `followUser()`/`unfollowUser()`
5. Triggers update counts automatically
6. Cache invalidated
7. Stats refresh

## 🚀 Performance Optimizations

1. **Cached Counts**: Follower/following/post counts stored in database
2. **Automatic Updates**: Triggers keep counts in sync
3. **Indexes**: Fast queries for profiles and relationships
4. **React Query**: Automatic caching and background refetching
5. **Optimistic Updates**: Instant UI feedback
6. **Image Optimization**: Expo Image for efficient loading

## 🐛 Common Issues & Solutions

### Issue: Counts not updating
**Solution**: Run the migration script to create triggers

### Issue: Avatar upload fails
**Solution**: Check storage bucket policies and permissions

### Issue: Profile not found
**Solution**: Ensure user has a profile row (created on signup)

### Issue: Follow button not working
**Solution**: Verify follows table RLS policies allow inserts/deletes

## 📱 Navigation Flow

```
Home Feed
  └─ Tap user avatar/name
      └─ User Profile Screen
          ├─ Tap Edit Profile (own profile)
          │   └─ Edit Profile Modal
          ├─ Tap Followers
          │   └─ Followers List
          ├─ Tap Following
          │   └─ Following List
          └─ Tap post in grid
              └─ Post Detail Screen

Profile Tab
  ├─ Own Profile Screen
  ├─ Tap Edit Profile
  │   └─ Edit Profile Modal
  ├─ Tap Followers
  │   └─ Followers List
  ├─ Tap Following
  │   └─ Following List
  └─ Tap post in grid
      └─ Post Detail Screen
```

## ✨ Next Steps

Phase 4 is now complete! The app now has:
- ✅ Full user profiles
- ✅ Profile editing
- ✅ Avatar management
- ✅ Follow system
- ✅ Travel history visualization
- ✅ User discovery

Ready for Phase 5 or additional features!
