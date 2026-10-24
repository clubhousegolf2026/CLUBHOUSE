-- ============================================================
-- CLUB HOUSE · Experiencias completas en Supabase · migración 0005 (idempotente)
-- Cada experiencia (viaje) vive en una fila: todo su contenido va en `datos`
-- (programa, campos de golf, hoteles, tarifas, salidas, fotos, políticas, FAQ)
-- y las columnas sueltas sirven para ordenar, publicar y ubicar en el globo.
-- Ejecutar en el SQL Editor de Supabase. Se puede correr varias veces.
-- ============================================================

create table if not exists experiencias (
  slug       text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  orden      integer not null default 0,
  publicada  boolean not null default true,
  destacada  boolean not null default false,
  lat        double precision,
  lng        double precision,
  datos      jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table experiencias is 'Viajes que vende la agencia. `datos` guarda el contenido completo de la ficha.';

create index if not exists idx_experiencias_orden on experiencias (publicada, orden);

alter table experiencias enable row level security;

-- El sitio público lee solo las publicadas; el staff ve todas y escribe.
drop policy if exists experiencias_lectura on experiencias;
create policy experiencias_lectura on experiencias
  for select using (publicada or es_staff());

drop policy if exists experiencias_staff on experiencias;
create policy experiencias_staff on experiencias
  for all using (es_staff()) with check (es_staff());

notify pgrst, 'reload schema';
