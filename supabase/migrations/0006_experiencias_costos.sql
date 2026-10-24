-- ============================================================
-- CLUB HOUSE · Costos y precios de las experiencias · migración 0006 (idempotente)
-- Hojas de costeo (costos reales, margen deseado, comisiones) por viaje.
-- SOLO el staff puede leer y escribir: esta tabla nunca es pública, a diferencia
-- de `experiencias`, que el sitio lee con la clave anónima.
-- ============================================================

create table if not exists experiencias_costos (
  slug       text primary key,
  datos      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
comment on table experiencias_costos is 'Costeo interno de cada viaje. Confidencial: solo staff.';

alter table experiencias_costos enable row level security;

drop policy if exists experiencias_costos_staff on experiencias_costos;
create policy experiencias_costos_staff on experiencias_costos
  for all using (es_staff()) with check (es_staff());

notify pgrst, 'reload schema';
