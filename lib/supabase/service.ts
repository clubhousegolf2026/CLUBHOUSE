import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Cliente con la clave de servicio (salta RLS). SOLO para código de servidor:
 *  la API pública con clave y el envío de webhooks. Nunca importarlo desde un
 *  componente de cliente. Devuelve null si falta la variable de entorno. */
export function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
