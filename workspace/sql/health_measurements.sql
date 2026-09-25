-- Lucas Workspace — Saúde: peso e pressão arterial

create table if not exists public.health_weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measurement_date date not null,
  weight_kg numeric(5,2) not null
    check (weight_kg >= 20 and weight_kg <= 400),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, measurement_date)
);

alter table public.health_weight_logs enable row level security;

drop policy if exists health_weight_logs_select_own on public.health_weight_logs;
create policy health_weight_logs_select_own
on public.health_weight_logs for select to authenticated
using (auth.uid() = user_id);

drop policy if exists health_weight_logs_insert_own on public.health_weight_logs;
create policy health_weight_logs_insert_own
on public.health_weight_logs for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists health_weight_logs_update_own on public.health_weight_logs;
create policy health_weight_logs_update_own
on public.health_weight_logs for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists health_weight_logs_delete_own on public.health_weight_logs;
create policy health_weight_logs_delete_own
on public.health_weight_logs for delete to authenticated
using (auth.uid() = user_id);

revoke all on table public.health_weight_logs from anon;
grant select, insert, update, delete on table public.health_weight_logs to authenticated;

create index if not exists health_weight_logs_user_date_idx
on public.health_weight_logs(user_id, measurement_date desc);


create table if not exists public.health_blood_pressure_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null,
  systolic smallint not null
    check (systolic >= 50 and systolic <= 300),
  diastolic smallint not null
    check (diastolic >= 30 and diastolic <= 200),
  pulse smallint
    check (pulse is null or (pulse >= 25 and pulse <= 250)),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.health_blood_pressure_logs enable row level security;

drop policy if exists health_blood_pressure_logs_select_own on public.health_blood_pressure_logs;
create policy health_blood_pressure_logs_select_own
on public.health_blood_pressure_logs for select to authenticated
using (auth.uid() = user_id);

drop policy if exists health_blood_pressure_logs_insert_own on public.health_blood_pressure_logs;
create policy health_blood_pressure_logs_insert_own
on public.health_blood_pressure_logs for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists health_blood_pressure_logs_update_own on public.health_blood_pressure_logs;
create policy health_blood_pressure_logs_update_own
on public.health_blood_pressure_logs for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists health_blood_pressure_logs_delete_own on public.health_blood_pressure_logs;
create policy health_blood_pressure_logs_delete_own
on public.health_blood_pressure_logs for delete to authenticated
using (auth.uid() = user_id);

revoke all on table public.health_blood_pressure_logs from anon;
grant select, insert, update, delete on table public.health_blood_pressure_logs to authenticated;

create index if not exists health_blood_pressure_logs_user_measured_idx
on public.health_blood_pressure_logs(user_id, measured_at desc);
