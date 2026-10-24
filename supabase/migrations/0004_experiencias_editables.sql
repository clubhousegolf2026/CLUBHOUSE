-- ============================================================
-- CLUB HOUSE · Experiencias editables · migración 0004 (idempotente)
-- Guarda los textos que el equipo edita de Tailandia y Utah (nombre, fechas,
-- precio, descripción…). El contenido base sigue en el código; esta tabla solo
-- guarda los cambios por encima. Ejecutar en el SQL Editor de Supabase.
-- ============================================================

create table if not exists experiencias_ajustes (
  slug       text primary key,
  datos      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table experiencias_ajustes enable row level security;

-- El sitio público lee los ajustes; solo el staff los escribe.
drop policy if exists experiencias_ajustes_lectura on experiencias_ajustes;
create policy experiencias_ajustes_lectura on experiencias_ajustes
  for select using (true);

drop policy if exists experiencias_ajustes_staff on experiencias_ajustes;
create policy experiencias_ajustes_staff on experiencias_ajustes
  for all using (es_staff()) with check (es_staff());

notify pgrst, 'reload schema';
