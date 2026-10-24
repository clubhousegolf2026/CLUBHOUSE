"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { generarClave, SCOPES } from "@/lib/api/claves";
import { enviarEntrega, EVENTOS, generarSecreto } from "@/lib/api/webhooks";

type Res = { ok: true } | { ok: false; error: string };

const MIGRACION =
  "Falta aplicar la migración 0007 (supabase/migrations/0007_api_webhooks.sql) en Supabase.";

function mensaje(error: { message: string; code?: string }): string {
  if (["42P01", "PGRST205"].includes(error.code ?? "")) return MIGRACION;
  if (error.code === "23514") return "La dirección debe empezar por http:// o https://.";
  return error.message;
}

async function cliente(): Promise<SupabaseClient> {
  return (await createServerSupabase()) as unknown as SupabaseClient;
}

const refrescar = () => revalidatePath("/admin/integraciones");

/* ───────────── Claves de API ───────────── */

/** Crea una clave. La clave completa se devuelve UNA sola vez: en la base solo queda el hash. */
export async function crearClaveApi(d: {
  nombre: string;
  scopes: string[];
}): Promise<{ ok: true; clave: string } | { ok: false; error: string }> {
  const nombre = d.nombre.trim();
  if (!nombre) return { ok: false, error: "Ponle un nombre a la clave (p. ej. «n8n» o «Contabilidad»)." };
  const validos = new Set<string>(SCOPES.map((s) => s.id));
  const scopes = d.scopes.filter((s) => validos.has(s));
  if (scopes.length === 0) return { ok: false, error: "Elige al menos un permiso." };

  const { clave, prefijo, hash } = generarClave();
  const db = await cliente();
  const { error } = await db.from("api_keys").insert({ nombre, prefijo, hash, scopes });
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true, clave };
}

export async function revocarClaveApi(id: string): Promise<Res> {
  const db = await cliente();
  const { error } = await db
    .from("api_keys")
    .update({ activa: false, revocada_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true };
}

export async function eliminarClaveApi(id: string): Promise<Res> {
  const db = await cliente();
  const { error } = await db.from("api_keys").delete().eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true };
}

/* ───────────── Webhooks ───────────── */

function validarWebhook(d: { nombre: string; url: string; eventos: string[] }): string | null {
  if (!d.nombre.trim()) return "Ponle un nombre al webhook.";
  try {
    const u = new URL(d.url.trim());
    if (u.protocol !== "https:" && u.protocol !== "http:") return "La dirección debe empezar por http:// o https://.";
  } catch {
    return "La dirección (URL) no es válida.";
  }
  if (d.eventos.length === 0) return "Elige al menos un evento.";
  return null;
}

function eventosValidos(eventos: string[]): string[] {
  const ok = new Set<string>(EVENTOS.map((e) => e.id));
  return eventos.filter((e) => ok.has(e));
}

export async function crearWebhook(d: {
  nombre: string;
  url: string;
  eventos: string[];
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const eventos = eventosValidos(d.eventos);
  const malo = validarWebhook({ ...d, eventos });
  if (malo) return { ok: false, error: malo };

  const db = await cliente();
  const { data, error } = await db
    .from("webhooks")
    .insert({ nombre: d.nombre.trim(), url: d.url.trim(), eventos, secreto: generarSecreto() })
    .select("id")
    .single();
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true, id: data.id as string };
}

export async function actualizarWebhook(
  id: string,
  d: { nombre: string; url: string; eventos: string[]; activo: boolean },
): Promise<Res> {
  const eventos = eventosValidos(d.eventos);
  const malo = validarWebhook({ ...d, eventos });
  if (malo) return { ok: false, error: malo };

  const db = await cliente();
  const { error } = await db
    .from("webhooks")
    .update({
      nombre: d.nombre.trim(),
      url: d.url.trim(),
      eventos,
      activo: d.activo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true };
}

export async function eliminarWebhook(id: string): Promise<Res> {
  const db = await cliente();
  const { error } = await db.from("webhooks").delete().eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true };
}

export async function regenerarSecretoWebhook(id: string): Promise<Res> {
  const db = await cliente();
  const { error } = await db
    .from("webhooks")
    .update({ secreto: generarSecreto(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true };
}

/** Manda un evento de prueba al destino y devuelve lo que respondió. */
export async function probarWebhook(
  id: string,
): Promise<{ ok: true; status: number | null; exito: boolean; error: string | null; ms: number } | { ok: false; error: string }> {
  const db = await cliente();
  const { data, error } = await db.from("webhooks").select("id, url, secreto").eq("id", id).single();
  if (error || !data) return { ok: false, error: error ? mensaje(error) : "No se encontró el webhook." };

  const r = await enviarEntrega(db, data, "prueba.ping", {
    mensaje: "Evento de prueba enviado desde el panel de Clubhouse.",
  });
  refrescar();
  return { ok: true, status: r.status, exito: r.ok, error: r.error, ms: r.ms };
}

export type EntregaFila = {
  id: number;
  evento: string;
  ok: boolean;
  http_estado: number | null;
  error: string | null;
  duracion_ms: number | null;
  created_at: string;
  payload: unknown;
};

export async function obtenerEntregas(
  webhookId: string,
): Promise<{ ok: true; entregas: EntregaFila[] } | { ok: false; error: string }> {
  const db = await cliente();
  const { data, error } = await db
    .from("webhook_entregas")
    .select("id, evento, ok, http_estado, error, duracion_ms, created_at, payload")
    .eq("webhook_id", webhookId)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) return { ok: false, error: mensaje(error) };
  return { ok: true, entregas: (data ?? []) as EntregaFila[] };
}
