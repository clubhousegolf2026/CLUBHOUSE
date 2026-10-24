-- ============================================================
-- CLUB HOUSE · CRM avanzado · migración 0003 (idempotente)
-- Seguimientos (próxima acción + fecha), etiquetas y notas por lead.
-- Aplicar en el SQL Editor de Supabase. Se puede ejecutar varias veces.
-- ============================================================

alter table contactos
  add column if not exists proxima_accion text,
  add column if not exists proxima_fecha  date,
  add column if not exists etiquetas      text[] not null default '{}';

create table if not exists crm_notas (
  id          bigint generated always as identity primary key,
  contacto_id uuid not null references contactos (id) on delete cascade,
  texto       text not null check (length(btrim(texto)) > 0),
  autor       uuid references staff (user_id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now()
);
comment on table crm_notas is 'Notas libres del equipo sobre un lead (llamadas, acuerdos, recordatorios).';

create index if not exists idx_crm_notas_contacto on crm_notas (contacto_id, created_at desc);
create index if not exists idx_contactos_proxima  on contactos (proxima_fecha) where proxima_fecha is not null;

alter table crm_notas enable row level security;

drop policy if exists crm_notas_staff on crm_notas;
create policy crm_notas_staff on crm_notas
  for all using (es_staff()) with check (es_staff());

-- Refresca el caché de esquema de la API para que vea las columnas nuevas.
notify pgrst, 'reload schema';
