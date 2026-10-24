"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/data/database.types";

type EstadoContacto = Database["public"]["Enums"]["estado_contacto"];

export async function cambiarEstadoContacto(
  contactoId: string,
  nuevoEstado: EstadoContacto,
  nota?: string,
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("avanzar_estado_contacto", {
    p_contacto: contactoId,
    p_nuevo: nuevoEstado,
    p_nota: nota ?? null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/crm");
  revalidatePath(`/admin/crm/${contactoId}`);
}

export async function actualizarFichaContacto(
  contactoId: string,
  cambios: { valorEstimadoCop?: number | null; notas?: string | null },
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("contactos")
    .update({
      valor_estimado_cop: cambios.valorEstimadoCop,
      notas: cambios.notas,
    })
    .eq("id", contactoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/crm/${contactoId}`);
}

/* ============================================================
   CRM avanzado — todas devuelven { ok, error } para poder mostrar
   el motivo en pantalla en vez de fallar en silencio.
   ============================================================ */

type Resultado<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const MIGRACION_0003 =
  "Falta aplicar la migración 0003 (supabase/migrations/0003_crm_avanzado.sql) en Supabase.";

function mensaje(error: { message: string; code?: string }): string {
  // 42703 = columna inexistente, 42P01 = tabla inexistente, PGRST204/205 = caché de esquema
  if (["42703", "42P01", "PGRST204", "PGRST205"].includes(error.code ?? "")) {
    return MIGRACION_0003;
  }
  return error.message;
}

export async function crearContacto(datos: {
  nombre: string;
  email: string;
  telefono?: string;
  valorEstimadoCop?: number | null;
  notas?: string;
  fechaTentativa?: string | null;
}): Promise<Resultado<{ id: string }>> {
  const nombre = datos.nombre.trim();
  const email = datos.email.trim();
  if (!nombre) return { ok: false, error: "Escribe el nombre." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "El correo no es válido." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("contactos")
    .insert({
      nombre,
      email,
      telefono: datos.telefono?.trim() || null,
      valor_estimado_cop: datos.valorEstimadoCop ?? null,
      notas: datos.notas?.trim() || null,
      fecha_tentativa: datos.fechaTentativa || null,
      origen: "contacto",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: mensaje(error) };

  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  return { ok: true, id: data.id };
}

export async function actualizarContacto(
  id: string,
  campos: {
    nombre?: string;
    email?: string;
    telefono?: string | null;
    valorEstimadoCop?: number | null;
    notas?: string | null;
    proximaAccion?: string | null;
    proximaFecha?: string | null;
    etiquetas?: string[];
  },
): Promise<Resultado> {
  const cambios: Database["public"]["Tables"]["contactos"]["Update"] = {};
  if (campos.nombre !== undefined) cambios.nombre = campos.nombre.trim();
  if (campos.email !== undefined) cambios.email = campos.email.trim();
  if (campos.telefono !== undefined) cambios.telefono = campos.telefono?.trim() || null;
  if (campos.valorEstimadoCop !== undefined) cambios.valor_estimado_cop = campos.valorEstimadoCop;
  if (campos.notas !== undefined) cambios.notas = campos.notas?.trim() || null;
  if (campos.proximaAccion !== undefined) cambios.proxima_accion = campos.proximaAccion?.trim() || null;
  if (campos.proximaFecha !== undefined) cambios.proxima_fecha = campos.proximaFecha || null;
  if (campos.etiquetas !== undefined) cambios.etiquetas = campos.etiquetas;

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("contactos").update(cambios).eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };

  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  return { ok: true };
}

export async function moverContacto(
  id: string,
  estado: EstadoContacto,
): Promise<Resultado> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("avanzar_estado_contacto", {
    p_contacto: id,
    p_nuevo: estado,
    p_nota: null,
  });
  if (error) return { ok: false, error: mensaje(error) };
  revalidatePath("/admin");
  return { ok: true };
}

export async function agregarNota(id: string, texto: string): Promise<Resultado> {
  if (!texto.trim()) return { ok: false, error: "Escribe la nota." };
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("crm_notas")
    .insert({ contacto_id: id, texto: texto.trim() });
  if (error) return { ok: false, error: mensaje(error) };

  // Una nota cuenta como actividad: sube el lead en "última actividad".
  await supabase.from("contactos").update({ updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/crm");
  return { ok: true };
}

export type ItemActividad = {
  clave: string;
  tipo: "estado" | "nota";
  texto: string;
  detalle?: string | null;
  fecha: string;
};

export async function obtenerActividad(
  id: string,
): Promise<Resultado<{ items: ItemActividad[]; notasDisponibles: boolean }>> {
  const supabase = await createServerSupabase();
  const [eventos, notas] = await Promise.all([
    supabase
      .from("crm_eventos")
      .select("id, estado_anterior, estado_nuevo, nota, created_at")
      .eq("contacto_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_notas")
      .select("id, texto, created_at")
      .eq("contacto_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (eventos.error) return { ok: false, error: mensaje(eventos.error) };

  const items: ItemActividad[] = [
    ...(eventos.data ?? []).map((e) => ({
      clave: `e${e.id}`,
      tipo: "estado" as const,
      texto: e.estado_anterior
        ? `${e.estado_anterior} → ${e.estado_nuevo}`
        : `Creado como ${e.estado_nuevo}`,
      detalle: e.nota,
      fecha: e.created_at,
    })),
    ...(notas.data ?? []).map((n) => ({
      clave: `n${n.id}`,
      tipo: "nota" as const,
      texto: n.texto,
      fecha: n.created_at,
    })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return { ok: true, items, notasDisponibles: !notas.error };
}

export async function eliminarContacto(id: string): Promise<Resultado> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("contactos").delete().eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
  return { ok: true };
}
