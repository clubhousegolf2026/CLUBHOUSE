import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/data/database.types";

/** Cliente Supabase con sesión (cookies) para Server Components y
 *  Server Actions dentro de /admin. A diferencia de lib/data/supabase.ts
 *  (anon, sin sesión, usado por la vitrina pública), este cliente sí
 *  lleva el JWT del usuario logueado: la protección real la hacen las
 *  políticas RLS que dependen de es_staff(), no esta capa. */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Se llama desde un Server Component sin poder escribir cookies
          // (no hay respuesta que modificar); el middleware ya refresca
          // la sesión en cada request, así que esto es seguro de ignorar.
        }
      },
    },
  });
}
