-- Lucas Workspace — módulo Hábitos

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  target_per_week integer not null default 7 check (target_per_week between 1 and 7),
  start_date date not null default current_date,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

drop policy if exists habits_select_own on public.habits;
create policy habits_select_own on public.habits for select to authenticated using (auth.uid() = user_id);
drop policy if exists habits_insert_own on public.habits;
create policy habits_insert_own on public.habits for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists habits_update_own on public.habits;
create policy habits_update_own on public.habits for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists habits_delete_own on public.habits;
create policy habits_delete_own on public.habits for delete to authenticated using (auth.uid() = user_id);

drop policy if exists habit_logs_select_own on public.habit_logs;
create policy habit_logs_select_own on public.habit_logs for select to authenticated using (auth.uid() = user_id);
drop policy if exists habit_logs_insert_own on public.habit_logs;
create policy habit_logs_insert_own on public.habit_logs for insert to authenticated with check (
  auth.uid() = user_id
  and exists (select 1 from public.habits h where h.id = habit_id and h.user_id = auth.uid())
);
drop policy if exists habit_logs_update_own on public.habit_logs;
create policy habit_logs_update_own on public.habit_logs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists habit_logs_delete_own on public.habit_logs;
create policy habit_logs_delete_own on public.habit_logs for delete to authenticated using (auth.uid() = user_id);

create index if not exists habits_user_idx on public.habits(user_id);
create index if not exists habit_logs_user_date_idx on public.habit_logs(user_id, log_date desc);

revoke all on table public.habits from anon;
revoke all on table public.habit_logs from anon;
grant select, insert, update, delete on table public.habits to authenticated;
grant select, insert, update, delete on table public.habit_logs to authenticated;
