-- Faded — initial schema
--
-- Design notes:
--   * Every user-owned table carries user_id and is protected by RLS keyed on auth.uid().
--     Ownership is enforced by Postgres, not asserted by the client.
--   * quit_date lives on profiles and starts at signup. Creating an account is the moment
--     the user commits to quitting, so the clock starts there. It is set by the signup
--     trigger rather than lazily on first render of the timer card, so the start time is
--     the account's actual creation instant and not whenever a component happened to mount.
--     Users can move it afterwards (relapse or correction) via sobriety_resets.
--   * Daily tracking tables carry a unique (user_id, entry_date) so the client can upsert
--     instead of doing a read-then-write that races against itself.

set check_function_bodies = off;

create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at honest
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text,
  avatar_url     text,
  quit_date      timestamptz    not null default now(),
  daily_spend    numeric(10, 2) not null default 15 check (daily_spend >= 0 and daily_spend <= 99999),
  currency       text           not null default 'USD',
  onboarded_at   timestamptz,
  created_at     timestamptz    not null default now(),
  updated_at     timestamptz    not null default now()
);

comment on column public.profiles.quit_date is
  'Starts at account creation — signing up is the commitment. Moved later only by
   an explicit user action, which also writes a sobriety_resets row.';

comment on column public.profiles.onboarded_at is
  'Null until the user finishes onboarding. Tracks the onboarding flow only —
   it does not gate the quit date, which is already running.';

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-provision a profile row whenever an auth user is created.
-- SECURITY DEFINER so it can write past RLS during signup.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- quit_date is set here, at account creation, because signing up is the
  -- point at which the user commits to quitting.
  insert into public.profiles (id, display_name, avatar_url, quit_date)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    now()
  )
  on conflict (id) do nothing;

  insert into public.course_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- sobriety_resets — history of relapses / timer corrections
-- ---------------------------------------------------------------------------

create table public.sobriety_resets (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  previous_quit_date timestamptz,
  new_quit_date      timestamptz not null,
  reason             text,
  created_at         timestamptz not null default now()
);

alter table public.sobriety_resets enable row level security;

create policy "sobriety_resets: read own"
  on public.sobriety_resets for select
  using (auth.uid() = user_id);

create policy "sobriety_resets: insert own"
  on public.sobriety_resets for insert
  with check (auth.uid() = user_id);

create index sobriety_resets_user_created_idx
  on public.sobriety_resets (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- mood_check_ins
-- ---------------------------------------------------------------------------

create table public.mood_check_ins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  mood       text not null,
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.mood_check_ins enable row level security;

create policy "mood_check_ins: read own"
  on public.mood_check_ins for select
  using (auth.uid() = user_id);

create policy "mood_check_ins: insert own"
  on public.mood_check_ins for insert
  with check (auth.uid() = user_id);

create policy "mood_check_ins: update own"
  on public.mood_check_ins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "mood_check_ins: delete own"
  on public.mood_check_ins for delete
  using (auth.uid() = user_id);

create index mood_check_ins_user_date_idx
  on public.mood_check_ins (user_id, entry_date desc);

create trigger mood_check_ins_set_updated_at
  before update on public.mood_check_ins
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- consumption_logs
-- ---------------------------------------------------------------------------

create table public.consumption_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  status     text not null check (status in ('clean', 'smoked')),
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.consumption_logs enable row level security;

create policy "consumption_logs: read own"
  on public.consumption_logs for select
  using (auth.uid() = user_id);

create policy "consumption_logs: insert own"
  on public.consumption_logs for insert
  with check (auth.uid() = user_id);

create policy "consumption_logs: update own"
  on public.consumption_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "consumption_logs: delete own"
  on public.consumption_logs for delete
  using (auth.uid() = user_id);

create index consumption_logs_user_date_idx
  on public.consumption_logs (user_id, entry_date desc);

create trigger consumption_logs_set_updated_at
  before update on public.consumption_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- course_progress — one row per user, so it survives a reinstall
-- ---------------------------------------------------------------------------

create table public.course_progress (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  current_chapter    integer     not null default 1,
  current_section    integer     not null default 0,
  completed_sections jsonb       not null default '[]'::jsonb,
  completed_chapters jsonb       not null default '[]'::jsonb,
  quiz_scores        jsonb       not null default '{}'::jsonb,
  total_xp           integer     not null default 0 check (total_xp >= 0),
  streak_days        integer     not null default 0 check (streak_days >= 0),
  last_streak_date   date,
  last_accessed_at   timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.course_progress enable row level security;

create policy "course_progress: read own"
  on public.course_progress for select
  using (auth.uid() = user_id);

create policy "course_progress: insert own"
  on public.course_progress for insert
  with check (auth.uid() = user_id);

create policy "course_progress: update own"
  on public.course_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger course_progress_set_updated_at
  before update on public.course_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- chat_sessions / chat_messages
-- ---------------------------------------------------------------------------

create table public.chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_sessions enable row level security;

create policy "chat_sessions: read own"
  on public.chat_sessions for select
  using (auth.uid() = user_id);

create policy "chat_sessions: insert own"
  on public.chat_sessions for insert
  with check (auth.uid() = user_id);

create policy "chat_sessions: update own"
  on public.chat_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "chat_sessions: delete own"
  on public.chat_sessions for delete
  using (auth.uid() = user_id);

create index chat_sessions_user_updated_idx
  on public.chat_sessions (user_id, updated_at desc);

create trigger chat_sessions_set_updated_at
  before update on public.chat_sessions
  for each row execute function public.set_updated_at();

create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'model')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "chat_messages: read own"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "chat_messages: insert own"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "chat_messages: delete own"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

create index chat_messages_session_created_idx
  on public.chat_messages (session_id, created_at);

-- ---------------------------------------------------------------------------
-- Account deletion — callable by the signed-in user, removes everything.
-- Every table above cascades from auth.users, so one delete is sufficient.
-- ---------------------------------------------------------------------------

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Attach the signup trigger last, once every table it writes to exists.
-- ---------------------------------------------------------------------------

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
