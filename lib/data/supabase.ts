import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** Cliente único con la clave pública (anon) — toda la protección real
 *  vive en las políticas RLS de cada tabla (lectura pública en el
 *  catálogo, solo-inserción en contactos/cotizaciones/reservas). No hay
 *  sesión de usuario en este sitio, así que un solo cliente basta tanto
 *  para Server como para Client Components. */
let cliente: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
  }

  cliente = createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });
  return cliente;
}
