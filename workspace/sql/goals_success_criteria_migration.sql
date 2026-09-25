-- Migração — Metas: critério de conclusão
alter table public.goals
  add column if not exists success_criteria text;
