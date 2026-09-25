-- Lucas Workspace — módulo Metas
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  period_type text not null check (period_type in ('Mensal','Anual')),
  category text,
  deadline date not null,
  status text not null default 'Em andamento'
    check (status in ('Em andamento','Concluída','Pausada')),
  progress integer not null default 0 check (progress between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

drop policy if exists goals_select_own on public.goals;
create policy goals_select_own on public.goals for select to authenticated using (auth.uid() = user_id);

drop policy if exists goals_insert_own on public.goals;
create policy goals_insert_own on public.goals for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists goals_update_own on public.goals;
create policy goals_update_own on public.goals for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists goals_delete_own on public.goals;
create policy goals_delete_own on public.goals for delete to authenticated using (auth.uid() = user_id);

create index if not exists goals_user_deadline_idx on public.goals(user_id, deadline);

revoke all on table public.goals from anon;
grant select, insert, update, delete on table public.goals to authenticated;
