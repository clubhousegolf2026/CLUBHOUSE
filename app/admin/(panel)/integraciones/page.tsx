import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  IntegracionesWorkspace,
  type ClaveFila,
  type WebhookFila,
} from "@/components/admin/integraciones/integraciones-workspace";

export const dynamic = "force-dynamic";

export default async function IntegracionesPage() {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const [claves, webhooks] = await Promise.all([
    db
      .from("api_keys")
      .select("id, nombre, prefijo, scopes, activa, ultimo_uso, created_at, revocada_at")
      .order("created_at", { ascending: false }),
    db
      .from("webhooks")
      .select("id, nombre, url, eventos, secreto, activo, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const falta = [claves.error, webhooks.error].find((e) => e && ["42P01", "PGRST205"].includes(e.code ?? ""));
  const otro = [claves.error, webhooks.error].find((e) => e && !["42P01", "PGRST205"].includes(e.code ?? ""));

  return (
    <IntegracionesWorkspace
      claves={(claves.data ?? []) as ClaveFila[]}
      webhooks={(webhooks.data ?? []) as WebhookFila[]}
      migracionPendiente={Boolean(falta)}
      errorCarga={otro ? otro.message : null}
      servicioActivo={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}
    />
  );
}
