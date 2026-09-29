-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security!
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Handle User Creation Trigger
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- POSTS TABLE
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text,
  location_name text,
  latitude float,
  longitude float,
  image_urls text[] -- Array of image URLs
);

alter table posts enable row level security;

create policy "Public posts are viewable by everyone."
  on posts for select
  using ( true );

create policy "Users can create posts."
  on posts for insert
  with check ( auth.uid() = user_id );

-- INTERACTIONS (Likes/Saves)
create table interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  post_id uuid references public.posts(id) not null,
  type text check (type in ('like', 'save')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id, type)
);

alter table interactions enable row level security;

create policy "Interactions are viewable by everyone."
  on interactions for select
  using ( true );

create policy "Users can create interactions."
  on interactions for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own interactions."
  on interactions for delete
  using ( auth.uid() = user_id );

-- FOLLOWS
create table follows (
  follower_id uuid references public.profiles(id) not null,
  following_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone."
  on follows for select
  using ( true );

create policy "Users can follow others."
  on follows for insert
  with check ( auth.uid() = follower_id );

create policy "Users can unfollow."
  on follows for delete
  using ( auth.uid() = follower_id );
