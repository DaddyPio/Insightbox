-- Create table for Daily Inspiration
create table if not exists public.daily_inspiration (
  id uuid primary key default gen_random_uuid(),
  -- store yyyy-mm-dd, unique per day
  date date not null unique,
  -- JSON result from OpenAI (message, title, song, etc.)
  content_json jsonb not null,
  created_at timestamp with time zone default now()
);

alter table public.daily_inspiration enable row level security;

-- Read policy for authenticated users
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'daily_inspiration' and policyname = 'Enable read for authenticated'
  ) then
    create policy "Enable read for authenticated"
      on public.daily_inspiration
      for select
      to authenticated
      using (true);
  end if;
end$$;

-- Insert policy for authenticated users
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'daily_inspiration' and policyname = 'Enable insert for authenticated'
  ) then
    create policy "Enable insert for authenticated"
      on public.daily_inspiration
      for insert
      to authenticated
      with check (true);
  end if;
end$$;

-- Update policy for authenticated users
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'daily_inspiration' and policyname = 'Enable update for authenticated'
  ) then
    create policy "Enable update for authenticated"
      on public.daily_inspiration
      for update
      to authenticated
      using (true)
      with check (true);
  end if;
end$$;


