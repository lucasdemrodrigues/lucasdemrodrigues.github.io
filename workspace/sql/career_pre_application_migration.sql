-- Migração — Carreira: oportunidades "Para candidatar"
alter table public.career_applications
  alter column applied_at drop not null;

alter table public.career_applications
  add column if not exists application_deadline date;

alter table public.career_applications
  drop constraint if exists career_applications_status_check;

alter table public.career_applications
  add constraint career_applications_status_check
  check (
    status in (
      'Para candidatar',
      'Candidatado',
      'Em análise',
      'Entrevista',
      'Case/Teste',
      'Oferta',
      'Reprovado',
      'Desistência'
    )
  );

create index if not exists career_applications_user_deadline_idx
on public.career_applications(user_id, application_deadline);
