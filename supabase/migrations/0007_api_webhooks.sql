-- ============================================================
-- CLUB HOUSE · APIs y webhooks · migración 0007 (idempotente)
--   api_keys          claves para que otros sistemas usen la API (solo se guarda el hash)
--   webhooks          destinos a los que Clubhouse avisa cuando pasa algo
--   webhook_entregas  bitácora de cada aviso enviado (para depurar)
-- Todo es confidencial: solo el staff puede leer o escribir. La API pública
-- accede con la clave de servicio (SUPABASE_SERVICE_ROLE_KEY) desde el servidor.
-- ============================================================

create table if not exists api_keys (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  prefijo     text not null,                         -- primeros caracteres, para reconocerla en la lista
  hash        text not null unique,                  -- sha256 de la clave completa
  scopes      text[] not null default '{}',
  activa      boolean not null default true,
  ultimo_uso  timestamptz,
  creada_por  uuid references staff (user_id) on delete set null default auth.uid(),
  created_at  timestamptz not null default now(),
  revocada_at timestamptz
);
comment on table api_keys is 'Claves de la API de Clubhouse. Solo se guarda el hash; la clave se muestra una vez al crearla.';

create table if not exists webhooks (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  url        text not null check (url ~* '^https?://'),
  eventos    text[] not null default '{}',
  secreto    text not null,                          -- firma HMAC de cada entrega
  activo     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists webhook_entregas (
  id          bigint generated always as identity primary key,
  webhook_id  uuid not null references webhooks (id) on delete cascade,
  evento      text not null,
  payload     jsonb not null,
  http_estado integer,
  ok          boolean not null default false,
  error       text,
  duracion_ms integer,
  created_at  timestamptz not null default now()
);

create index if not exists idx_webhook_entregas on webhook_entregas (webhook_id, created_at desc);

alter table api_keys         enable row level security;
alter table webhooks         enable row level security;
alter table webhook_entregas enable row level security;

drop policy if exists api_keys_staff on api_keys;
create policy api_keys_staff on api_keys for all using (es_staff()) with check (es_staff());

drop policy if exists webhooks_staff on webhooks;
create policy webhooks_staff on webhooks for all using (es_staff()) with check (es_staff());

drop policy if exists webhook_entregas_staff on webhook_entregas;
create policy webhook_entregas_staff on webhook_entregas for all using (es_staff()) with check (es_staff());

notify pgrst, 'reload schema';
