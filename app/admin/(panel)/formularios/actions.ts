"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  configPorDefecto,
  normalizarConfig,
  slugificar,
  type ConfigFormulario,
  type Plantilla,
} from "@/lib/formularios/tipos";

type Res<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const MIGRACION = "Falta aplicar la migración 0010 (supabase/migrations/0010_formularios_pagos.sql) en Supabase.";

function mensaje(error: { message: string; code?: string }): string {
  if (["42P01", "PGRST205"].includes(error.code ?? "")) return MIGRACION;
  if (error.code === "23505") return "Ya existe un formulario con esa dirección (slug).";
  if (error.code === "23514") return "La dirección solo puede tener minúsculas, números y guiones.";
  return error.message;
}

async function cliente(): Promise<SupabaseClient> {
  return (await createServerSupabase()) as unknown as SupabaseClient;
}

const refrescar = (id?: string) => {
  revalidatePath("/admin/formularios");
  if (id) revalidatePath(`/admin/formularios/${id}`);
};

async function slugLibre(db: SupabaseClient, nombre: string): Promise<string> {
  const base = slugificar(nombre) || "formulario";
  for (let n = 1; n < 100; n++) {
    const candidato = n === 1 ? base : `${base}-${n}`;
    const { data } = await db.from("formularios").select("id").eq("slug", candidato).maybeSingle();
    if (!data) return candidato;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function crearFormulario(d: { nombre: string; plantilla: Plantilla }): Promise<Res<{ id: string }>> {
  const nombre = d.nombre.trim();
  if (!nombre) return { ok: false, error: "Ponle un nombre al formulario." };
  const db = await cliente();
  const slug = await slugLibre(db, nombre);
  const { data, error } = await db
    .from("formularios")
    .insert({ slug, nombre, plantilla: d.plantilla, publicado: false, config: configPorDefecto(d.plantilla, nombre) })
    .select("id")
    .single();
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true, id: data.id as string };
}

export async function guardarFormulario(
  id: string,
  d: { nombre: string; slug: string; plantilla: Plantilla; publicado: boolean; config: ConfigFormulario },
): Promise<Res> {
  const nombre = d.nombre.trim();
  if (!nombre) return { ok: false, error: "Ponle un nombre al formulario." };
  const slug = slugificar(d.slug);
  if (!slug) return { ok: false, error: "La dirección del formulario no es válida." };

  const config = normalizarConfig(d.config, d.plantilla);
  // Se limpian los espacios y se descartan opciones vacías.
  config.campos = config.campos.map((c) => ({
    ...c,
    etiqueta: c.etiqueta.trim(),
    opciones: c.opciones?.map((o) => ({ ...o, etiqueta: o.etiqueta.trim() })).filter((o) => o.etiqueta),
  }));

  if (d.publicado) {
    if (!config.campos.some((c) => c.mapeo === "email")) {
      return { ok: false, error: "Para publicar, el formulario necesita un campo de correo (marcado como «Correo del contacto»)." };
    }
    if (config.pago.activo && !(config.pago.base > 0) && !config.campos.some((c) => (c.opciones ?? []).some((o) => (o.precio ?? 0) > 0))) {
      return { ok: false, error: "El pago está activado pero no hay un valor: define la tarifa base o precios en las opciones." };
    }
  }

  const db = await cliente();
  const { error } = await db
    .from("formularios")
    .update({ nombre, slug, plantilla: d.plantilla, publicado: d.publicado, config })
    .eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar(id);
  return { ok: true };
}

export async function eliminarFormulario(id: string): Promise<Res> {
  const db = await cliente();
  const { error } = await db.from("formularios").delete().eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true };
}

export async function duplicarFormulario(id: string): Promise<Res<{ id: string }>> {
  const db = await cliente();
  const { data: f, error: e1 } = await db.from("formularios").select("*").eq("id", id).single();
  if (e1 || !f) return { ok: false, error: e1 ? mensaje(e1) : "No se encontró el formulario." };
  const nombre = `${f.nombre} (copia)`;
  const slug = await slugLibre(db, nombre);
  const { data, error } = await db
    .from("formularios")
    .insert({ slug, nombre, plantilla: f.plantilla, publicado: false, config: f.config })
    .select("id")
    .single();
  if (error) return { ok: false, error: mensaje(error) };
  refrescar();
  return { ok: true, id: data.id as string };
}

export async function cambiarEstadoInscripcion(
  id: string,
  estado: "recibida" | "pendiente_pago" | "pagada" | "cancelada",
  formularioId: string,
): Promise<Res> {
  const db = await cliente();
  const { error } = await db.from("inscripciones").update({ estado }).eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  revalidatePath(`/admin/formularios/${formularioId}/respuestas`);
  return { ok: true };
}

export async function eliminarInscripcion(id: string, formularioId: string): Promise<Res> {
  const db = await cliente();
  const { error } = await db.from("inscripciones").delete().eq("id", id);
  if (error) return { ok: false, error: mensaje(error) };
  revalidatePath(`/admin/formularios/${formularioId}/respuestas`);
  revalidatePath("/admin/formularios");
  return { ok: true };
}
