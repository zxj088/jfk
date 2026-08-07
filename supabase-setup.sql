-- Paste this whole file into Supabase SQL Editor and run it once.
-- Public scorecards remain anonymously readable. All writes are performed by
-- the scorecard-write Edge Function after server-side edit-code validation.

create table if not exists public.vegas_courses (
  id text primary key,
  sync_key text not null default 'default',
  course_id text not null,
  name text not null,
  pars jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sync_key, course_id)
);

create table if not exists public.vegas_rounds (
  id text primary key,
  sync_key text not null default 'default',
  saved_at bigint not null,
  name text not null,
  file_name text,
  course_id text not null,
  course_name text not null,
  pars jsonb not null,
  players jsonb not null,
  point_value numeric not null default 1,
  birdie_flip boolean not null default true,
  scores jsonb not null,
  totals jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optimistic concurrency control. The app updates a round only when this
-- version still matches the version it originally loaded.
alter table public.vegas_rounds
add column if not exists version bigint not null default 1;

create table if not exists public.scorecard_credentials (
  resource_type text not null check (resource_type in ('round', 'course')),
  resource_id text not null,
  sync_key text not null,
  edit_code text not null check (edit_code ~ '^[0-9]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (resource_type, resource_id)
);

create table if not exists public.scorecard_write_limits (
  failure_key text primary key,
  window_started timestamptz not null default now(),
  attempts integer not null default 0
);

create or replace function public.scorecard_check_rate_limit(p_key text, p_increment boolean default false)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_attempts integer;
  started timestamptz;
begin
  if p_increment then
    insert into public.scorecard_write_limits (failure_key, window_started, attempts)
    values (p_key, now(), 1)
    on conflict (failure_key) do update set
      window_started = case when scorecard_write_limits.window_started < now() - interval '10 minutes' then now() else scorecard_write_limits.window_started end,
      attempts = case when scorecard_write_limits.window_started < now() - interval '10 minutes' then 1 else scorecard_write_limits.attempts + 1 end
    returning attempts, window_started into current_attempts, started;
  else
    select attempts, window_started into current_attempts, started
    from public.scorecard_write_limits where failure_key = p_key;
  end if;
  return started is null or started < now() - interval '10 minutes' or current_attempts < 8;
end;
$$;

create index if not exists vegas_courses_sync_key_idx on public.vegas_courses (sync_key);
create index if not exists vegas_rounds_sync_key_saved_at_idx on public.vegas_rounds (sync_key, saved_at desc);

create or replace function public.vegas_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vegas_courses_updated_at on public.vegas_courses;
create trigger vegas_courses_updated_at
before update on public.vegas_courses
for each row execute function public.vegas_set_updated_at();

drop trigger if exists vegas_rounds_updated_at on public.vegas_rounds;
create trigger vegas_rounds_updated_at
before update on public.vegas_rounds
for each row execute function public.vegas_set_updated_at();

alter table public.vegas_courses enable row level security;
alter table public.vegas_rounds enable row level security;
alter table public.scorecard_credentials enable row level security;
alter table public.scorecard_write_limits enable row level security;

grant usage on schema public to anon;
grant select on public.vegas_courses to anon;
grant select on public.vegas_rounds to anon;
revoke insert, update, delete on public.vegas_courses from anon, authenticated;
revoke insert, update, delete on public.vegas_rounds from anon, authenticated;
revoke all on public.scorecard_credentials from public, anon, authenticated;
revoke all on public.scorecard_write_limits from public, anon, authenticated;
grant all on public.scorecard_credentials to service_role;
grant all on public.scorecard_write_limits to service_role;
revoke all on function public.scorecard_check_rate_limit(text, boolean) from public, anon, authenticated;
grant execute on function public.scorecard_check_rate_limit(text, boolean) to service_role;

drop policy if exists "vegas_courses_select" on public.vegas_courses;
create policy "vegas_courses_select"
on public.vegas_courses for select
to anon
using (true);

drop policy if exists "vegas_courses_insert" on public.vegas_courses;
drop policy if exists "vegas_courses_update" on public.vegas_courses;
drop policy if exists "vegas_courses_delete" on public.vegas_courses;

drop policy if exists "vegas_rounds_select" on public.vegas_rounds;
create policy "vegas_rounds_select"
on public.vegas_rounds for select
to anon
using (true);

drop policy if exists "vegas_rounds_insert" on public.vegas_rounds;
drop policy if exists "vegas_rounds_update" on public.vegas_rounds;
drop policy if exists "vegas_rounds_delete" on public.vegas_rounds;
