-- Lucas Workspace — módulo Saúde

create table if not exists public.health_followups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  specialty text not null,
  provider text,
  last_visit date,
  next_visit date,
  frequency text,
  status text not null default 'Em dia'
    check (status in ('Em dia','Para agendar','Agendada')),
  contact text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_followups enable row level security;

drop policy if exists health_followups_select_own on public.health_followups;
create policy health_followups_select_own
on public.health_followups
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists health_followups_insert_own on public.health_followups;
create policy health_followups_insert_own
on public.health_followups
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists health_followups_update_own on public.health_followups;
create policy health_followups_update_own
on public.health_followups
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists health_followups_delete_own on public.health_followups;
create policy health_followups_delete_own
on public.health_followups
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.set_health_followups_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists health_followups_set_updated_at on public.health_followups;
create trigger health_followups_set_updated_at
before update on public.health_followups
for each row execute function public.set_health_followups_updated_at();

create index if not exists health_followups_user_next_visit_idx
on public.health_followups(user_id, next_visit);

revoke all on table public.health_followups from anon;
grant select, insert, update, delete on table public.health_followups to authenticated;
