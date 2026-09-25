-- Lucas Workspace — IA: apenas a análise mais recente por área

create table if not exists public.workspace_ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    default auth.uid()
    references auth.users(id)
    on delete cascade,
  scope text not null
    check (scope in ('weekly', 'career', 'goals', 'habits', 'health')),
  insight text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, scope)
);

alter table public.workspace_ai_insights enable row level security;

drop policy if exists workspace_ai_insights_select_own on public.workspace_ai_insights;
create policy workspace_ai_insights_select_own
on public.workspace_ai_insights
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists workspace_ai_insights_insert_own on public.workspace_ai_insights;
create policy workspace_ai_insights_insert_own
on public.workspace_ai_insights
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists workspace_ai_insights_update_own on public.workspace_ai_insights;
create policy workspace_ai_insights_update_own
on public.workspace_ai_insights
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists workspace_ai_insights_delete_own on public.workspace_ai_insights;
create policy workspace_ai_insights_delete_own
on public.workspace_ai_insights
for delete to authenticated
using (auth.uid() = user_id);

revoke all on table public.workspace_ai_insights from anon;
grant select, insert, update, delete
on table public.workspace_ai_insights to authenticated;

create index if not exists workspace_ai_insights_user_scope_idx
on public.workspace_ai_insights(user_id, scope);
