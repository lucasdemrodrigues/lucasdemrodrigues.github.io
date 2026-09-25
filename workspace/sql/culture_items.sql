-- Lucas Workspace — módulo Cultura
create table if not exists public.culture_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('Filme','Livro')),
  title text not null,
  creator text,
  completed_at date not null,
  genre text,
  rating numeric(3,1) check (rating is null or (rating >= 1 and rating <= 10)),
  platform text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.culture_items enable row level security;

drop policy if exists culture_select_own on public.culture_items;
create policy culture_select_own on public.culture_items for select to authenticated using (auth.uid() = user_id);

drop policy if exists culture_insert_own on public.culture_items;
create policy culture_insert_own on public.culture_items for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists culture_update_own on public.culture_items;
create policy culture_update_own on public.culture_items for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists culture_delete_own on public.culture_items;
create policy culture_delete_own on public.culture_items for delete to authenticated using (auth.uid() = user_id);

create index if not exists culture_items_user_date_idx on public.culture_items(user_id, completed_at desc);

revoke all on table public.culture_items from anon;
grant select, insert, update, delete on table public.culture_items to authenticated;
