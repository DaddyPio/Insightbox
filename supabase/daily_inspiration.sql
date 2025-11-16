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

-- Simple read policy for anon (adjust as you need)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'daily_inspiration' and policyname = 'Enable read for anon'
  ) then
    create policy "Enable read for anon"
      on public.daily_inspiration
      for select
      to anon
      using (true);
  end if;
end$$;


