-- ============================================================
-- CLUB HOUSE · Calendarios múltiples · migración 0008 (idempotente)
--   calendarios                tantos calendarios como quieras (por viaje, por campo, operación…)
--   bloqueos_calendario.calendario_id   a qué calendario pertenece cada rango
-- Los rangos sin calendario siguen siendo el "Itinerario libre" que usa el cotizador.
-- ============================================================

create table if not exists calendarios (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  descripcion     text,
  color           text not null default '#2e5b45' check (color ~* '^#[0-9a-f]{6}$'),
  experiencia_slug text,
  orden           integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table bloqueos_calendario
  add column if not exists calendario_id uuid references calendarios (id) on delete cascade;

create index if not exists idx_bloqueos_calendario_id on bloqueos_calendario (calendario_id);

alter table calendarios enable row level security;
drop policy if exists calendarios_staff on calendarios;
create policy calendarios_staff on calendarios for all using (es_staff()) with check (es_staff());

notify pgrst, 'reload schema';
