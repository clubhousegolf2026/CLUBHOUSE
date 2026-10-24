"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { CAMPOS_EDITABLES, type AjustesExperiencia } from "@/lib/contenido/experiencias-editables";
import { EXPERIENCIAS } from "@/lib/contenido/experiencias";

type Res = { ok: true } | { ok: false; error: string };

function mensaje(error: { message: string; code?: string }): string {
  if (["42P01", "PGRST205"].includes(error.code ?? "")) {
    return "Falta aplicar la migración 0004 (supabase/migrations/0004_experiencias_editables.sql) en Supabase.";
  }
  return error.message;
}

function refrescar(slug: string) {
  revalidatePath("/");
  revalidatePath(`/experiencias/${slug}`);
  revalidatePath("/admin/destinos");
  revalidatePath("/admin/paquetes");
  revalidatePath(`/admin/experiencias/${slug}`);
}

export async function guardarExperiencia(slug: string, datos: AjustesExperiencia): Promise<Res> {
  if (!EXPERIENCIAS.some((e) => e.slug === slug)) return { ok: false, error: "Experiencia desconocida." };
  const limpio: AjustesExperiencia = {};
  for (const campo of CAMPOS_EDITABLES) {
    const v = datos[campo]?.trim();
    if (v) limpio[campo] = v;
  }
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { error } = await db
    .from("experiencias_ajustes")
    .upsert({ slug, datos: limpio, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: mensaje(error) };
  refrescar(slug);
  return { ok: true };
}

export async function restablecerExperiencia(slug: string): Promise<Res> {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { error } = await db.from("experiencias_ajustes").delete().eq("slug", slug);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar(slug);
  return { ok: true };
}
