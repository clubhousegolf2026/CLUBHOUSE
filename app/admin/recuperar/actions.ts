"use server";

import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";

/** Siempre responde lo mismo, exista o no el correo, para no revelar quién tiene cuenta. */
export async function solicitarRecuperacion(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`recuperar:${ip}`, 5, 600)) return { ok: false, error: "Demasiados intentos. Espera unos minutos." };
  const correo = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) return { ok: false, error: "Escribe un correo válido." };
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.resetPasswordForEmail(correo, { redirectTo: `${SITE_URL}/admin/nueva-clave` });
  } catch {}
  return { ok: true };
}
