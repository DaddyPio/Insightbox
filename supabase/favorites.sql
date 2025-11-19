-- Create table for Favorite Daily Inspirations
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  inspiration_id uuid not null references public.daily_inspiration(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, inspiration_id)
);

alter table public.favorites enable row level security;

-- Read policy: users can only see their own favorites
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'favorites' and policyname = 'Users can view own favorites'
  ) then
    create policy "Users can view own favorites"
      on public.favorites
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end$$;

-- Insert policy: users can only add their own favorites
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'favorites' and policyname = 'Users can insert own favorites'
  ) then
    create policy "Users can insert own favorites"
      on public.favorites
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Delete policy: users can only delete their own favorites
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'favorites' and policyname = 'Users can delete own favorites'
  ) then
    create policy "Users can delete own favorites"
      on public.favorites
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end$$;

