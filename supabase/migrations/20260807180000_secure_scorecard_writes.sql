-- Move edit codes out of publicly readable scorecard JSON and close direct
-- anonymous writes. Deploy the scorecard-write Edge Function before applying
-- this migration so updated clients retain write access.

create table if not exists public.scorecard_credentials (
  resource_type text not null check (resource_type in ('round', 'course')),
  resource_id text not null,
  sync_key text not null,
  edit_code text not null check (edit_code ~ '^[0-9]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (resource_type, resource_id)
);

alter table public.scorecard_credentials enable row level security;
revoke all on public.scorecard_credentials from public, anon, authenticated;
grant all on public.scorecard_credentials to service_role;

create table if not exists public.scorecard_write_limits (
  failure_key text primary key,
  window_started timestamptz not null default now(),
  attempts integer not null default 0
);
alter table public.scorecard_write_limits enable row level security;
revoke all on public.scorecard_write_limits from public, anon, authenticated;
grant all on public.scorecard_write_limits to service_role;

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
revoke all on function public.scorecard_check_rate_limit(text, boolean) from public, anon, authenticated;
grant execute on function public.scorecard_check_rate_limit(text, boolean) to service_role;

insert into public.scorecard_credentials (resource_type, resource_id, sync_key, edit_code)
select 'round', id, sync_key, totals->>'editCode'
from public.vegas_rounds
where totals->>'editCode' ~ '^[0-9]{2}$'
on conflict (resource_type, resource_id) do update
set edit_code = excluded.edit_code, sync_key = excluded.sync_key, updated_at = now();

insert into public.scorecard_credentials (resource_type, resource_id, sync_key, edit_code)
select 'course', id, sync_key, pars->>'editCode'
from public.vegas_courses
where pars->>'editCode' ~ '^[0-9]{2}$'
on conflict (resource_type, resource_id) do update
set edit_code = excluded.edit_code, sync_key = excluded.sync_key, updated_at = now();

update public.vegas_rounds
set totals = totals - 'editCode'
where totals ? 'editCode';

update public.vegas_courses
set pars = pars - 'editCode'
where jsonb_typeof(pars) = 'object' and pars ? 'editCode';

revoke insert, update, delete on public.vegas_courses from anon, authenticated;
revoke insert, update, delete on public.vegas_rounds from anon, authenticated;

drop policy if exists "vegas_courses_insert" on public.vegas_courses;
drop policy if exists "vegas_courses_update" on public.vegas_courses;
drop policy if exists "vegas_courses_delete" on public.vegas_courses;
drop policy if exists "vegas_rounds_insert" on public.vegas_rounds;
drop policy if exists "vegas_rounds_update" on public.vegas_rounds;
drop policy if exists "vegas_rounds_delete" on public.vegas_rounds;

-- Reading remains anonymous so shared scorecards continue to open without an
-- account. RLS hides the credential table; the service-role Edge Function owns
-- all writes and is the only component that reads edit codes.
