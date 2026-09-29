-- COMMENTS TABLE
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Users can create comments."
  on comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comments."
  on comments for delete
  using ( auth.uid() = user_id );

-- NOTIFICATIONS TABLE
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null, -- Recipient
  actor_id uuid references public.profiles(id) not null, -- Who triggered the notification
  type text check (type in ('like', 'comment', 'follow')) not null,
  post_id uuid references public.posts(id) on delete cascade, -- Nullable for follow notifications
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notifications enable row level security;

create policy "Users can view their own notifications."
  on notifications for select
  using ( auth.uid() = user_id );

create policy "Users can create notifications."
  on notifications for insert
  with check ( true ); -- Anyone can create notifications (for other users)

create policy "Users can update their own notifications."
  on notifications for update
  using ( auth.uid() = user_id );
