"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { EXPERIENCIAS, type Experiencia } from "@/lib/contenido/experiencias";

type Res = { ok: true } | { ok: false; error: string };

const MIGRACION =
  "Falta aplicar la migración 0005 (supabase/migrations/0005_experiencias_completas.sql) en Supabase.";

function mensaje(error: { message: string; code?: string }): string {
  if (["42P01", "PGRST205"].includes(error.code ?? "")) return MIGRACION;
  if (error.code === "23505") return "Ya existe una experiencia con esa dirección web (slug).";
  if (error.code === "23514") return "La dirección web solo puede tener minúsculas, números y guiones.";
  return error.message;
}

function refrescar(slug?: string) {
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/experiencias");
  revalidatePath("/admin/paquetes");
  if (slug) {
    revalidatePath(`/experiencias/${slug}`);
    revalidatePath(`/admin/experiencias/${slug}`);
  }
}

async function cliente(): Promise<SupabaseClient> {
  return (await createServerSupabase()) as unknown as SupabaseClient;
}

/** Quita lo vacío para que la ficha pública no muestre huecos. */
function limpiar(e: Experiencia): Experiencia {
  const t = (s: string) => s.trim();
  const lineas = (a: string[]) => a.map(t).filter(Boolean);
  return {
    ...e,
    nombre: t(e.nombre),
    subtitulo: t(e.subtitulo),
    pais: t(e.pais),
    bandera: t(e.bandera),
    fechas: t(e.fechas),
    duracion: t(e.duracion),
    desde: t(e.desde),
    resumen: t(e.resumen),
    titularLargo: t(e.titularLargo),
    descripcionLarga: t(e.descripcionLarga),
    incluye: lineas(e.incluye),
    noIncluye: lineas(e.noIncluye),
    claves: e.claves.filter((c) => t(c.titulo) || t(c.texto)),
    cifras: e.cifras.filter((c) => t(c.valor) || t(c.etiqueta)),
    programa: e.programa
      .filter((d) => t(d.titulo) || t(d.fecha))
      .map((d) => ({ ...d, detalle: lineas(d.detalle) })),
    rondas: e.rondas
      .filter((r) => t(r.nombre))
      .map((r) => ({ ...r, datos: lineas(r.datos) })),
    alojamiento: e.alojamiento.filter((a) => t(a.nombre)),
    masAllaDelGolf: e.masAllaDelGolf.filter((m) => t(m.titulo)),
    tarifas: e.tarifas
      .filter((x) => t(x.perfil) || t(x.precio))
      .map((x) => ({ ...x, incluye: lineas(x.incluye) })),
    galeria: (e.galeria ?? []).filter((g) => t(g.url)),
    salidas: (e.salidas ?? []).filter((s) => s.inicio && s.fin),
    politicas: (e.politicas ?? []).filter((p) => t(p.titulo) || t(p.texto)),
    faq: (e.faq ?? []).filter((p) => t(p.q)),
  };
}

export async function guardarExperiencia(
  experiencia: Experiencia,
  esNueva: boolean,
): Promise<Res> {
  const e = limpiar(experiencia);
  if (!e.nombre) return { ok: false, error: "Escribe el nombre del viaje." };
  if (!e.pais) return { ok: false, error: "Escribe el país." };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) {
    return { ok: false, error: "La dirección web solo puede tener minúsculas, números y guiones." };
  }
  const salidasMalas = (e.salidas ?? []).some((s) => s.fin < s.inicio);
  if (salidasMalas) return { ok: false, error: "Una salida termina antes de empezar." };

  const db = await cliente();
  if (esNueva) {
    const existe = await db.from("experiencias").select("slug").eq("slug", e.slug).maybeSingle();
    if (existe.data || EXPERIENCIAS.some((x) => x.slug === e.slug)) {
      return { ok: false, error: "Ya existe una experiencia con esa dirección web (slug)." };
    }
  }

  const { coordenadas, publicada, destacada, orden, ...resto } = e;
  const { error } = await db.from("experiencias").upsert({
    slug: e.slug,
    orden: orden ?? 0,
    publicada: publicada !== false,
    destacada: Boolean(destacada),
    lng: coordenadas[0],
    lat: coordenadas[1],
    datos: resto,
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: mensaje(error) };

  refrescar(e.slug);
  return { ok: true };
}

/** Borra la fila. Si es una de las originales (Tailandia, Utah) vuelve al contenido del código. */
export async function eliminarExperiencia(slug: string): Promise<Res> {
  const db = await cliente();
  const { error } = await db.from("experiencias").delete().eq("slug", slug);
  if (error) return { ok: false, error: mensaje(error) };
  // Tarifas viejas de la migración 0004, si existían.
  await db.from("experiencias_ajustes").delete().eq("slug", slug);
  refrescar(slug);
  return { ok: true };
}

export async function cambiarPublicacion(slug: string, publicada: boolean): Promise<Res> {
  const db = await cliente();
  const { error, data } = await db
    .from("experiencias")
    .update({ publicada, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select("slug");
  if (error) return { ok: false, error: mensaje(error) };
  if (!data || data.length === 0) {
    return { ok: false, error: "Primero guarda esta experiencia en Supabase (botón «Guardar en Supabase»)." };
  }
  refrescar(slug);
  return { ok: true };
}

/** Pasa a Supabase las experiencias que hoy solo existen en el código. */
export async function importarExperienciasDeCodigo(): Promise<
  { ok: true; importadas: number } | { ok: false; error: string }
> {
  const db = await cliente();
  const actuales = await db.from("experiencias").select("slug");
  if (actuales.error) return { ok: false, error: mensaje(actuales.error) };
  const ya = new Set((actuales.data ?? []).map((x: { slug: string }) => x.slug));

  const filas = EXPERIENCIAS.filter((e) => !ya.has(e.slug)).map((e, i) => {
    const { coordenadas, ...resto } = e;
    return {
      slug: e.slug,
      orden: i,
      publicada: true,
      destacada: false,
      lng: coordenadas[0],
      lat: coordenadas[1],
      datos: resto,
    };
  });
  if (filas.length > 0) {
    const { error } = await db.from("experiencias").insert(filas);
    if (error) return { ok: false, error: mensaje(error) };
  }
  refrescar();
  return { ok: true, importadas: filas.length };
}
