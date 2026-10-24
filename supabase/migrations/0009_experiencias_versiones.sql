-- ============================================================
-- CLUB HOUSE · Historial de versiones de experiencias · migración 0009 (idempotente)
-- Cada vez que se guarda una experiencia queda una copia para poder volver atrás.
-- ============================================================

create table if not exists experiencias_versiones (
  id         bigint generated always as identity primary key,
  slug       text not null,
  datos      jsonb not null,
  resumen    text,
  autor      uuid default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists idx_experiencias_versiones on experiencias_versiones (slug, created_at desc);

alter table experiencias_versiones enable row level security;
drop policy if exists experiencias_versiones_staff on experiencias_versiones;
create policy experiencias_versiones_staff on experiencias_versiones for all using (es_staff()) with check (es_staff());

notify pgrst, 'reload schema';
