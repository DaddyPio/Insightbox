-- Create letters table
create table if not exists letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_name text not null,               -- e.g. "大兒子", "小兒子", or an actual name
  child_label text,                       -- optional, for internal tags
  title text,                             -- optional title for the letter
  raw_text text not null,                 -- raw speech transcript (possibly lightly edited by user)
  ai_letter text not null,                -- final AI-generated letter text
  ai_summary text,                        -- optional: short summary of what this letter is about
  tone text,                              -- tone/style used: "warm", "honest", "story", "short"
  tags text[] default array[]::text[],    -- optional tags (e.g. ["親子", "鼓勵", "道歉"])
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists letters_user_id_created_at_idx
  on letters(user_id, created_at desc);

create index if not exists letters_user_id_child_name_idx
  on letters(user_id, child_name);

-- Enable RLS
alter table letters enable row level security;

-- RLS Policies
-- Allow users to select their own letters
create policy "Letters select own"
  on letters
  for select
  using (auth.uid() = user_id);

-- Allow users to insert their own letters
create policy "Letters insert own"
  on letters
  for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own letters
create policy "Letters update own"
  on letters
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to delete their own letters
create policy "Letters delete own"
  on letters
  for delete
  using (auth.uid() = user_id);

