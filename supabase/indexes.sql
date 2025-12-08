-- DATABASE INDEXES FOR PERFORMANCE
-- Run this in SQL Editor to improve query performance

-- Indexes on posts table
create index if not exists posts_user_id_idx on posts(user_id);
create index if not exists posts_created_at_idx on posts(created_at desc);
create index if not exists posts_location_idx on posts(location_name);

-- Indexes on interactions table
create index if not exists interactions_user_id_idx on interactions(user_id);
create index if not exists interactions_post_id_idx on interactions(post_id);
create index if not exists interactions_type_idx on interactions(type);

-- Indexes on follows table
create index if not exists follows_follower_id_idx on follows(follower_id);
create index if not exists follows_following_id_idx on follows(following_id);

-- Indexes on comments table
create index if not exists comments_post_id_idx on comments(post_id);
create index if not exists comments_user_id_idx on comments(user_id);
create index if not exists comments_created_at_idx on comments(created_at desc);

-- Indexes on notifications table
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_read_idx on notifications(read);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- Composite indexes for common queries
create index if not exists interactions_user_post_type_idx on interactions(user_id, post_id, type);
create index if not exists notifications_user_read_idx on notifications(user_id, read);
