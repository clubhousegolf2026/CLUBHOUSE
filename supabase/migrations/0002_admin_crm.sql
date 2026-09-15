-- ============================================================
-- CLUB HOUSE · Admin + CRM · migración 0002
-- Extiende el esquema real (contactos/cotizaciones/reservas) con:
--   staff (quién es del equipo), pipeline de leads, bitácora,
--   y las RPC/RLS que usa el panel /admin.
-- Aplicar con el SQL Editor de Supabase o `supabase db push`.
-- ============================================================

-- ---------- Tipos enumerados ----------
create type staff_rol as enum ('admin', 'asesor');
create type estado_contacto as enum (
  'nuevo', 'contactado', 'cotizado', 'confirmado', 'viajo', 'perdido'
);

-- ============================================================
-- 1. STAFF — mapea usuarios de Supabase Auth a rol interno
-- ============================================================
create table staff (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  nombre     text,
  rol        staff_rol not null default 'admin',
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);
comment on table staff is 'Quién del equipo puede entrar a /admin. Un usuario de auth.users sin fila aquí no es staff.';

-- ============================================================
-- 2. CONTACTOS — se convierte en el lead del CRM (pipeline)
-- ============================================================
alter table contactos
  add column estado         estado_contacto not null default 'nuevo',
  add column propietario_id uuid references staff (user_id) on delete set null,
  add column valor_estimado_cop bigint check (valor_estimado_cop is null or valor_estimado_cop >= 0),
  add column notas          text,
  add column updated_at     timestamptz not null default now();

-- ============================================================
-- 3. CRM_EVENTOS — bitácora inmutable de cambios de estado
-- ============================================================
create table crm_eventos (
  id              bigint generated always as identity primary key,
  contacto_id     uuid not null references contactos (id) on delete cascade,
  estado_anterior estado_contacto,
  estado_nuevo    estado_contacto not null,
  nota            text,
  actor           uuid references staff (user_id) on delete set null,
  created_at      timestamptz not null default now()
);
comment on table crm_eventos is 'Historia de cada contacto: permite reconstruir el timeline de la ficha y medir tiempos por etapa.';

-- ============================================================
-- ÍNDICES
-- ============================================================
create extension if not exists "pg_trgm";

create index idx_contactos_estado      on contactos (estado, updated_at desc);
create index idx_contactos_propietario on contactos (propietario_id, estado) where propietario_id is not null;
create index idx_contactos_email_trgm  on contactos using gin (email gin_trgm_ops);
create index idx_contactos_nombre_trgm on contactos using gin (nombre gin_trgm_ops);
create index idx_crm_eventos_contacto  on crm_eventos (contacto_id, created_at desc);
create index idx_cotizaciones_contacto on cotizaciones (contacto_id);
create index idx_reservas_estado_pago  on reservas (estado_pago);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- ¿Es el usuario actual staff activo? (usada por las políticas RLS)
create or replace function es_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff s where s.user_id = auth.uid() and s.activo);
$$;

-- updated_at automático en contactos
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_contactos_updated_at before update on contactos
  for each row execute function set_updated_at();

-- Bitácora automática de cambios de estado del pipeline
create or replace function log_cambio_estado_contacto() returns trigger
language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into crm_eventos (contacto_id, estado_anterior, estado_nuevo)
    values (new.id, null, new.estado);
  elsif new.estado is distinct from old.estado then
    insert into crm_eventos (contacto_id, estado_anterior, estado_nuevo)
    values (new.id, old.estado, new.estado);
  end if;
  return new;
end $$;

create trigger trg_contactos_estado after insert or update of estado on contactos
  for each row execute function log_cambio_estado_contacto();

-- Avanzar estado del lead desde el panel (con nota opcional en el evento recién creado)
create or replace function avanzar_estado_contacto(
  p_contacto uuid, p_nuevo estado_contacto, p_nota text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not es_staff() then
    raise exception 'No autorizado';
  end if;

  update contactos set estado = p_nuevo where id = p_contacto;

  if p_nota is not null then
    update crm_eventos set nota = p_nota
     where id = (
       select max(id) from crm_eventos where contacto_id = p_contacto
     );
  end if;
end $$;
revoke all on function avanzar_estado_contacto(uuid, estado_contacto, text) from public, anon;

-- Marcar una reserva como pagada/fallida (Fase 1: sin pasarela integrada aún,
-- así que el staff confirma el pago manualmente desde el panel).
create or replace function marcar_reserva_pagada(
  p_reserva uuid, p_pagada boolean
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_contacto_id uuid;
begin
  if not es_staff() then
    raise exception 'No autorizado';
  end if;

  update reservas
     set estado_pago = case when p_pagada then 'pagado' else 'fallido' end,
         confirmada_at = case when p_pagada then now() else confirmada_at end
   where id = p_reserva;

  if p_pagada then
    select c.contacto_id into v_contacto_id
    from reservas r join cotizaciones c on c.id = r.cotizacion_id
    where r.id = p_reserva;

    if v_contacto_id is not null then
      update contactos
         set estado = 'confirmado'
       where id = v_contacto_id
         and estado not in ('confirmado', 'viajo');
    end if;
  end if;
end $$;
revoke all on function marcar_reserva_pagada(uuid, boolean) from public, anon;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table staff       enable row level security;
alter table crm_eventos enable row level security;
alter table contactos   enable row level security;
alter table cotizaciones enable row level security;
alter table reservas    enable row level security;

-- --- staff: cada quien se ve a sí mismo; el staff activo ve a todos ---
drop policy if exists staff_self on staff;
create policy staff_self on staff
  for select using (user_id = auth.uid() or es_staff());

-- --- crm_eventos: solo staff (se escribe por trigger/RPC, nunca directo) ---
drop policy if exists crm_eventos_staff on crm_eventos;
create policy crm_eventos_staff on crm_eventos
  for select using (es_staff());

-- --- contactos: el visitante anónimo puede CREAR un lead (formulario de
--     contacto con la clave anon) pero nunca leer/editar; el staff sí puede
--     todo. Son políticas acumulativas (OR), no se pisan entre sí. ---
drop policy if exists contactos_insert_publico on contactos;
create policy contactos_insert_publico on contactos
  for insert to anon, authenticated
  with check (true);

drop policy if exists contactos_staff_todo on contactos;
create policy contactos_staff_todo on contactos
  for all using (es_staff()) with check (es_staff());

-- --- cotizaciones / reservas: por ahora solo el panel las lee/edita ---
drop policy if exists cotizaciones_staff_todo on cotizaciones;
create policy cotizaciones_staff_todo on cotizaciones
  for all using (es_staff()) with check (es_staff());

drop policy if exists reservas_staff_todo on reservas;
create policy reservas_staff_todo on reservas
  for all using (es_staff()) with check (es_staff());

-- ============================================================
-- BOOTSTRAP DEL PRIMER ADMIN (manual, no se ejecuta solo)
-- ============================================================
-- 1) Crea el usuario en el dashboard de Supabase: Authentication → Users → Add user
--    (con el correo/clave de Juan Manuel).
-- 2) Copia su "User UID" y ejecuta:
--
-- insert into staff (user_id, nombre, rol)
-- values ('<uuid-del-usuario>', 'Juan Manuel Morales', 'admin');
