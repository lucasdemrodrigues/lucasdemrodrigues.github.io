-- Lucas Workspace — Insight semanal de IA

create table if not exists public.weekly_ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  week_start date not null,
  insight text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table public.weekly_ai_insights enable row level security;

drop policy if exists weekly_ai_insights_select_own on public.weekly_ai_insights;
create policy weekly_ai_insights_select_own
on public.weekly_ai_insights
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists weekly_ai_insights_insert_own on public.weekly_ai_insights;
create policy weekly_ai_insights_insert_own
on public.weekly_ai_insights
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists weekly_ai_insights_update_own on public.weekly_ai_insights;
create policy weekly_ai_insights_update_own
on public.weekly_ai_insights
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists weekly_ai_insights_delete_own on public.weekly_ai_insights;
create policy weekly_ai_insights_delete_own
on public.weekly_ai_insights
for delete to authenticated
using (auth.uid() = user_id);

revoke all on table public.weekly_ai_insights from anon;
grant select, insert, update, delete on table public.weekly_ai_insights to authenticated;

create index if not exists weekly_ai_insights_user_week_idx
on public.weekly_ai_insights(user_id, week_start desc);
