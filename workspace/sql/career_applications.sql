-- Lucas Workspace — módulo Carreira
-- Execute no SQL Editor do Supabase.

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  applied_at date not null,
  status text not null default 'Candidatado'
    check (status in ('Candidatado','Em análise','Entrevista','Case/Teste','Oferta','Reprovado','Desistência')),
  source text,
  work_model text check (work_model is null or work_model in ('Remoto','Híbrido','Presencial')),
  location text,
  salary text,
  job_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.career_applications enable row level security;

drop policy if exists career_select_own on public.career_applications;
create policy career_select_own on public.career_applications
for select to authenticated using (auth.uid() = user_id);

drop policy if exists career_insert_own on public.career_applications;
create policy career_insert_own on public.career_applications
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists career_update_own on public.career_applications;
create policy career_update_own on public.career_applications
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists career_delete_own on public.career_applications;
create policy career_delete_own on public.career_applications
for delete to authenticated using (auth.uid() = user_id);

create or replace function public.set_career_updated_at()
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

drop trigger if exists career_applications_set_updated_at on public.career_applications;
create trigger career_applications_set_updated_at
before update on public.career_applications
for each row execute function public.set_career_updated_at();

create index if not exists career_applications_user_date_idx
on public.career_applications(user_id, applied_at desc);

revoke all on table public.career_applications from anon;
grant select, insert, update, delete on table public.career_applications to authenticated;
