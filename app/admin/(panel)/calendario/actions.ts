"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

function revalidarTodo() {
  revalidatePath("/admin/calendario");
  revalidatePath("/cotizador");
}

export async function crearBloqueo(datos: {
  fechaInicio: string;
  fechaFin: string;
  tipo: "bloqueo" | "temporada_alta" | "cupo";
  nota: string | null;
  factorPrecio: number | null;
  paqueteId: string | null;
  calendarioId?: string | null;
}) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("bloqueos_calendario").insert({
    fecha_inicio: datos.fechaInicio,
    fecha_fin: datos.fechaFin,
    tipo: datos.tipo,
    nota: datos.nota,
    factor_precio: datos.tipo === "temporada_alta" ? datos.factorPrecio : null,
    paquete_id: datos.paqueteId,
    calendario_id: datos.calendarioId ?? null,
  });
  if (error) throw new Error(error.message);
  revalidarTodo();
}

export async function eliminarBloqueo(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("bloqueos_calendario").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarTodo();
}

export async function actualizarBloqueo(
  id: string,
  datos: {
    fechaInicio: string;
    fechaFin: string;
    tipo: "bloqueo" | "temporada_alta" | "cupo";
    nota: string | null;
    factorPrecio: number | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!datos.fechaInicio || !datos.fechaFin) return { ok: false, error: "Escribe la fecha de inicio y fin." };
  if (datos.fechaFin < datos.fechaInicio) return { ok: false, error: "La fecha de fin no puede ser anterior a la de inicio." };
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("bloqueos_calendario")
    .update({
      fecha_inicio: datos.fechaInicio,
      fecha_fin: datos.fechaFin,
      tipo: datos.tipo,
      nota: datos.nota,
      factor_precio: datos.tipo === "temporada_alta" ? datos.factorPrecio : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidarTodo();
  return { ok: true };
}

/* ───────────── Calendarios propios ───────────── */

type Res<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const MIGRACION =
  "Falta aplicar la migración 0008 (supabase/migrations/0008_calendarios.sql) en Supabase.";

function mensajeCal(error: { message: string; code?: string }): string {
  if (["42P01", "42703", "PGRST204", "PGRST205"].includes(error.code ?? "")) return MIGRACION;
  if (error.code === "23514") return "El color debe ser un valor hexadecimal, p. ej. #2e5b45.";
  return error.message;
}

type DatosCalendario = { nombre: string; color: string; descripcion: string; experienciaSlug: string | null };

export async function crearCalendario(d: DatosCalendario): Promise<Res<{ id: string }>> {
  const nombre = d.nombre.trim();
  if (!nombre) return { ok: false, error: "Ponle un nombre al calendario." };
  const supabase = (await createServerSupabase()) as unknown as SupabaseClient;
  const { data, error } = await supabase
    .from("calendarios")
    .insert({
      nombre,
      color: d.color,
      descripcion: d.descripcion.trim() || null,
      experiencia_slug: d.experienciaSlug || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: mensajeCal(error) };
  revalidarTodo();
  return { ok: true, id: data.id as string };
}

export async function actualizarCalendario(id: string, d: DatosCalendario): Promise<Res> {
  const nombre = d.nombre.trim();
  if (!nombre) return { ok: false, error: "Ponle un nombre al calendario." };
  const supabase = (await createServerSupabase()) as unknown as SupabaseClient;
  const { error } = await supabase
    .from("calendarios")
    .update({
      nombre,
      color: d.color,
      descripcion: d.descripcion.trim() || null,
      experiencia_slug: d.experienciaSlug || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: mensajeCal(error) };
  revalidarTodo();
  return { ok: true };
}

/** Borra el calendario y todos sus rangos (cascada). */
export async function eliminarCalendario(id: string): Promise<Res> {
  const supabase = (await createServerSupabase()) as unknown as SupabaseClient;
  const { error } = await supabase.from("calendarios").delete().eq("id", id);
  if (error) return { ok: false, error: mensajeCal(error) };
  revalidarTodo();
  return { ok: true };
}
