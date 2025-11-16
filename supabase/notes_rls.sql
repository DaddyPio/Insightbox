-- Add user_id column and RLS policies for notes table
alter table public.notes
  add column if not exists user_id uuid not null default auth.uid();

alter table public.notes enable row level security;

-- Select own rows
create policy if not exists "Notes select own"
  on public.notes
  for select
  using (auth.uid() = user_id);

-- Insert rows as self
create policy if not exists "Notes insert own"
  on public.notes
  for insert
  with check (auth.uid() = user_id);

-- Update own rows
create policy if not exists "Notes update own"
  on public.notes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Delete own rows
create policy if not exists "Notes delete own"
  on public.notes
  for delete
  using (auth.uid() = user_id);


