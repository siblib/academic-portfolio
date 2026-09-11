-- ==============================================================================
-- ManuscriptReady — Supabase Database Schema & Storage Setup
-- Phase 3 (1.3: Project Structure & Setup)
-- Run this script in the Supabase Dashboard SQL Editor
-- ==============================================================================

-- 1. PROFILES: 1-to-1 with auth users
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz default now()
);

-- 2. PROJECTS TABLE
-- CHECK constraints mirror Phase 2 Figma specifications:
-- 4 service types & 5 dashboard badge states
create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  service_type   text not null check (service_type in
                   ('formatting','editing','lit_review','coaching',
                    'drafting','data_analysis','figures','defense_deck')),
  status         text not null default 'submitted' check (status in
                   ('submitted','under_review','editing','awaiting_payment','completed')),
  word_count     int,
  due_date       date,
  file_url       text,
  final_file_url text,
  amount_due     numeric(10,2) default 0,
  paid           boolean not null default false,
  created_at     timestamptz default now()
);

-- Index for client query performance
create index if not exists projects_user_id_idx on public.projects (user_id);

-- 3. AUTO-CREATE PROFILE TRIGGER
-- Trigger creates a corresponding profile row whenever a user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. PRIVATE STORAGE BUCKET: manuscripts
insert into storage.buckets (id, name, public)
values ('manuscripts', 'manuscripts', false)
on conflict (id) do nothing;

-- 5. STORAGE POLICIES
-- Folder convention: manuscripts/{user_id}/{project_id}/{filename}
-- Client can write and read only within their own user_id directory
drop policy if exists "Client uploads to own folder" on storage.objects;
create policy "Client uploads to own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'manuscripts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Client reads own files" on storage.objects;
create policy "Client reads own files"
on storage.objects for select to authenticated
using (
  bucket_id = 'manuscripts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. DATABASE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- Profiles policies
drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile"
on public.profiles for select using (auth.uid() = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile"
on public.profiles for update using (auth.uid() = id);

-- Projects policies
drop policy if exists "Read own projects" on public.projects;
create policy "Read own projects"
on public.projects for select using (auth.uid() = user_id);

drop policy if exists "Create own projects" on public.projects;
create policy "Create own projects"
on public.projects for insert with check (auth.uid() = user_id);

-- SECURITY ARCHITECTURE NOTE:
-- Deliberately NO update policy for clients on public.projects.
-- Clients must never be able to mutate 'paid = true' or 'status = completed'.
-- All status transitions, payments, and deliverables are handled through the
-- admin Table Editor or backend serverless functions with the service-role key.
