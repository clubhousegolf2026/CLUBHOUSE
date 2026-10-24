import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/data/supabase";
import { EXPERIENCIAS, type Experiencia } from "./experiencias";

/** Campos de texto de la migración 0004 (ajustes parciales). Se siguen
 *  respetando para no perder cambios hechos antes de la 0005. */
const CAMPOS_AJUSTES = [
  "nombre",
  "subtitulo",
  "fechas",
  "duracion",
  "desde",
  "resumen",
  "titularLargo",
  "descripcionLarga",
] as const;
type AjustesExperiencia = Partial<Record<(typeof CAMPOS_AJUSTES)[number], string>>;

type FilaExperiencia = {
  slug: string;
  orden: number;
  publicada: boolean;
  destacada: boolean;
  lat: number | null;
  lng: number | null;
  datos: Partial<Experiencia>;
};

/** Completa lo que falte para que la ficha nunca rompa la página pública. */
export function normalizar(parcial: Partial<Experiencia> & { slug: string }): Experiencia {
  return {
    pais: "",
    bandera: "",
    coordenadas: [0, 0],
    nombre: parcial.slug,
    subtitulo: "",
    fechas: "",
    duracion: "",
    resumen: "",
    titularLargo: "",
    descripcionLarga: "",
    claves: [],
    cifras: [],
    desde: "",
    foto: "",
    fotoAlt: "",
    fotoSecundaria: "",
    programa: [],
    rondas: [],
    alojamiento: [],
    masAllaDelGolf: [],
    tarifas: [],
    incluye: [],
    noIncluye: [],
    ...parcial,
  };
}

function delCodigo(slug: string): Experiencia | undefined {
  return EXPERIENCIAS.find((e) => e.slug === slug);
}

function mezclarAjustes(base: Experiencia, a?: AjustesExperiencia | null): Experiencia {
  if (!a) return base;
  const salida: Experiencia = { ...base };
  for (const campo of CAMPOS_AJUSTES) {
    const v = a[campo];
    if (typeof v === "string" && v.trim()) salida[campo] = v.trim();
  }
  return salida;
}

function desdeFila(f: FilaExperiencia): Experiencia {
  const lng = f.lng ?? f.datos.coordenadas?.[0] ?? 0;
  const lat = f.lat ?? f.datos.coordenadas?.[1] ?? 0;
  return normalizar({
    ...f.datos,
    slug: f.slug,
    coordenadas: [lng, lat],
    publicada: f.publicada,
    destacada: f.destacada,
    orden: f.orden,
  });
}

/** Lee las experiencias con el cliente indicado (anon para el sitio público,
 *  sesión de staff para el admin). Combina Supabase con el contenido original
 *  del código: lo que está en Supabase manda; lo que no, se ve como estaba. */
async function leer(db: SupabaseClient, incluirBorradores: boolean): Promise<Experiencia[]> {
  let filas: FilaExperiencia[] = [];
  let ajustes = new Map<string, AjustesExperiencia>();
  try {
    const r = await db.from("experiencias").select("slug, orden, publicada, destacada, lat, lng, datos");
    if (!r.error && r.data) filas = r.data as FilaExperiencia[];
    const a = await db.from("experiencias_ajustes").select("slug, datos");
    if (!a.error && a.data) {
      ajustes = new Map(a.data.map((x: { slug: string; datos: AjustesExperiencia }) => [x.slug, x.datos]));
    }
  } catch {
    // Sin base: se muestra el contenido del código.
  }

  const enBase = new Set(filas.map((f) => f.slug));
  const lista: Experiencia[] = [
    ...filas.map(desdeFila),
    ...EXPERIENCIAS.filter((e) => !enBase.has(e.slug)).map((e, i) =>
      mezclarAjustes({ ...e, orden: e.orden ?? 1000 + i }, ajustes.get(e.slug)),
    ),
  ];

  return lista
    .filter((e) => incluirBorradores || e.publicada !== false)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}

/** Para el sitio público: solo publicadas. */
export async function getExperiencias(): Promise<Experiencia[]> {
  try {
    return await leer(getSupabase() as unknown as SupabaseClient, false);
  } catch {
    return EXPERIENCIAS;
  }
}

export async function getExperiencia(slug: string): Promise<Experiencia | null> {
  return (await getExperiencias()).find((e) => e.slug === slug) ?? null;
}

/** Para el admin: incluye borradores. Recibe el cliente con la sesión de staff. */
export async function getExperienciasAdmin(db: SupabaseClient): Promise<{
  experiencias: Experiencia[];
  enBase: Set<string>;
}> {
  let enBase = new Set<string>();
  try {
    const r = await db.from("experiencias").select("slug");
    if (!r.error && r.data) enBase = new Set(r.data.map((x: { slug: string }) => x.slug));
  } catch {}
  return { experiencias: await leer(db, true), enBase };
}

export { delCodigo };
