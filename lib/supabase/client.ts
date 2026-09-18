import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/data/database.types";

/** Cliente Supabase del navegador (usa la sesión de las cookies). Solo para
 *  el admin: subir fotos a Storage directo desde el navegador evita pasar
 *  el archivo por una función serverless (límite de ~4.5 MB en Vercel). */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
