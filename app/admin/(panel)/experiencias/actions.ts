"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { EXPERIENCIAS, type Experiencia } from "@/lib/contenido/experiencias";
import type { CostosExperiencia } from "@/lib/contenido/costeo";
import { slugificar } from "@/lib/contenido/fechas-viaje";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";

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
    seoTitulo: t(e.seoTitulo ?? ""),
    seoDescripcion: t(e.seoDescripcion ?? ""),
  };
}

/** Dirección web libre a partir del nombre: «Utah Experience» → utah-experience
 *  (y utah-experience-2 si ya existe). */
async function slugDisponible(db: SupabaseClient, nombre: string): Promise<string> {
  const base = slugificar(nombre) || "experiencia";
  for (let n = 1; n < 100; n++) {
    const candidato = n === 1 ? base : `${base}-${n}`;
    if (EXPERIENCIAS.some((x) => x.slug === candidato)) continue;
    const { data } = await db.from("experiencias").select("slug").eq("slug", candidato).maybeSingle();
    if (!data) return candidato;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function guardarExperiencia(
  experiencia: Experiencia,
  esNueva: boolean,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const e = limpiar(experiencia);
  if (!e.nombre) return { ok: false, error: "Escribe el nombre del viaje." };
  if (!e.pais) return { ok: false, error: "Escribe el país." };
  const salidasMalas = (e.salidas ?? []).some((s) => s.fin < s.inicio);
  if (salidasMalas) return { ok: false, error: "Una salida termina antes de empezar." };

  const db = await cliente();
  // Una experiencia nueva recibe su dirección web automáticamente.
  if (esNueva) e.slug = await slugDisponible(db, e.nombre);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) {
    return { ok: false, error: "No se pudo generar la dirección web: revisa el nombre del viaje." };
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

  await guardarVersion(db, e.slug, e);
  refrescar(e.slug);
  return { ok: true, slug: e.slug };
}

/* ───────────── Historial de versiones ───────────── */

const MAX_VERSIONES = 30;

/** Deja una copia de lo guardado. Es opcional: si la migración 0009 no está
 *  aplicada, simplemente no hay historial y el guardado sigue funcionando. */
async function guardarVersion(db: SupabaseClient, slug: string, datos: Experiencia) {
  try {
    const { error } = await db.from("experiencias_versiones").insert({
      slug,
      datos,
      resumen: `${datos.nombre} · ${datos.programa.length} días · ${datos.tarifas.length} tarifas`,
    });
    if (error) return;
    const { data } = await db
      .from("experiencias_versiones")
      .select("id")
      .eq("slug", slug)
      .order("created_at", { ascending: false })
      .range(MAX_VERSIONES, MAX_VERSIONES + 200);
    const sobran = (data ?? []).map((x: { id: number }) => x.id);
    if (sobran.length > 0) await db.from("experiencias_versiones").delete().in("id", sobran);
  } catch {}
}

export type VersionFila = { id: number; created_at: string; resumen: string | null };

export async function obtenerVersiones(
  slug: string,
): Promise<{ ok: true; versiones: VersionFila[] } | { ok: false; error: string }> {
  const db = await cliente();
  const { data, error } = await db
    .from("experiencias_versiones")
    .select("id, created_at, resumen")
    .eq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(MAX_VERSIONES);
  if (error) {
    if (["42P01", "PGRST205"].includes(error.code ?? "")) {
      return { ok: false, error: "Falta aplicar la migración 0009 (supabase/migrations/0009_experiencias_versiones.sql) para tener historial." };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, versiones: (data ?? []) as VersionFila[] };
}

export async function obtenerVersion(
  id: number,
): Promise<{ ok: true; datos: Experiencia } | { ok: false; error: string }> {
  const db = await cliente();
  const { data, error } = await db.from("experiencias_versiones").select("datos, slug").eq("id", id).single();
  if (error || !data) return { ok: false, error: error?.message ?? "No se encontró esa versión." };
  const datos = data.datos as Partial<Experiencia>;
  return { ok: true, datos: { ...datos, slug: data.slug } as Experiencia };
}

/** Crea una copia en borrador (con sus hojas de costos) y devuelve su dirección. */
export async function duplicarExperiencia(
  slug: string,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const db = await cliente();
  const { experiencias } = await getExperienciasAdmin(db);
  const origen = experiencias.find((x) => x.slug === slug);
  if (!origen) return { ok: false, error: "No se encontró la experiencia." };

  const nombre = `${origen.nombre} (copia)`;
  const nuevoSlug = await slugDisponible(db, nombre);
  const { coordenadas, publicada: _p, destacada: _d, orden, slug: _s, ...resto } = origen;
  void _p; void _d; void _s;
  const { error } = await db.from("experiencias").insert({
    slug: nuevoSlug,
    orden: (orden ?? 0) + 1,
    publicada: false,
    destacada: false,
    lng: coordenadas[0],
    lat: coordenadas[1],
    datos: { ...resto, nombre },
  });
  if (error) return { ok: false, error: mensaje(error) };

  try {
    const c = await db.from("experiencias_costos").select("datos").eq("slug", slug).maybeSingle();
    if (c.data?.datos) await db.from("experiencias_costos").insert({ slug: nuevoSlug, datos: c.data.datos });
  } catch {}

  refrescar(nuevoSlug);
  return { ok: true, slug: nuevoSlug };
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

/** Hojas de costeo: tabla aparte y solo para el staff (nunca se publican). */
export async function guardarCostos(slug: string, costos: CostosExperiencia): Promise<Res> {
  const db = await cliente();
  const { error } = await db
    .from("experiencias_costos")
    .upsert({ slug, datos: costos, updated_at: new Date().toISOString() });
  if (error) {
    if (["42P01", "PGRST205"].includes(error.code ?? "")) {
      return {
        ok: false,
        error: "Falta aplicar la migración 0006 (supabase/migrations/0006_experiencias_costos.sql) en Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/experiencias/${slug}`);
  return { ok: true };
}
