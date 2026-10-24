-- ============================================================
-- CLUB HOUSE · Formularios de inscripción + pagos Wompi · migración 0010 (idempotente)
--   formularios    constructor de formularios (plantilla, campos, diseño y pago en `config`)
--   inscripciones  cada respuesta recibida
--   pagos          cobros con Wompi (de una inscripción, de una reserva o un enlace manual)
-- Las escrituras públicas (enviar un formulario, pagar) pasan por el servidor con
-- SUPABASE_SERVICE_ROLE_KEY; el público solo puede LEER formularios publicados.
-- ============================================================

create table if not exists formularios (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  nombre     text not null,
  plantilla  text not null default 'clasico'
             check (plantilla in ('clasico', 'pasos', 'portada', 'cristal', 'conversacional')),
  publicado  boolean not null default false,
  config     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pagos (
  id          uuid primary key default gen_random_uuid(),
  referencia  text not null unique,
  monto_cop   integer not null check (monto_cop > 0),
  concepto    text not null,
  estado      text not null default 'PENDING'
              check (estado in ('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR')),
  nombre      text,
  email       text,
  telefono    text,
  origen      text not null default 'manual' check (origen in ('inscripcion', 'reserva', 'manual')),
  origen_id   uuid,
  wompi_id    text,
  metodo      text,
  payload     jsonb,
  created_at  timestamptz not null default now(),
  pagado_at   timestamptz
);
create index if not exists idx_pagos_estado on pagos (estado, created_at desc);
create index if not exists idx_pagos_origen on pagos (origen, origen_id);

create table if not exists inscripciones (
  id              uuid primary key default gen_random_uuid(),
  formulario_id   uuid not null references formularios (id) on delete cascade,
  datos           jsonb not null default '{}'::jsonb,
  nombre          text,
  email           text,
  telefono        text,
  contacto_id     uuid,
  estado          text not null default 'recibida'
                  check (estado in ('recibida', 'pendiente_pago', 'pagada', 'cancelada')),
  monto_cop       integer,
  pago_referencia text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_inscripciones_formulario on inscripciones (formulario_id, created_at desc);

drop trigger if exists trg_formularios_updated on formularios;
create trigger trg_formularios_updated before update on formularios
  for each row execute function set_updated_at();

alter table formularios   enable row level security;
alter table pagos         enable row level security;
alter table inscripciones enable row level security;

drop policy if exists formularios_staff on formularios;
create policy formularios_staff on formularios for all using (es_staff()) with check (es_staff());
drop policy if exists formularios_publico on formularios;
create policy formularios_publico on formularios for select using (publicado);

drop policy if exists pagos_staff on pagos;
create policy pagos_staff on pagos for all using (es_staff()) with check (es_staff());

drop policy if exists inscripciones_staff on inscripciones;
create policy inscripciones_staff on inscripciones for all using (es_staff()) with check (es_staff());

notify pgrst, 'reload schema';
