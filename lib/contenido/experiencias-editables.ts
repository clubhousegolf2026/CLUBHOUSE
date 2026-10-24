import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/data/supabase";
import { EXPERIENCIAS, type Experiencia } from "./experiencias";

/** Campos de texto que el equipo puede cambiar desde el admin. El resto del
 *  contenido (programa, rondas, hoteles, tarifas) sigue en el código. */
export const CAMPOS_EDITABLES = [
  "nombre",
  "subtitulo",
  "fechas",
  "duracion",
  "desde",
  "resumen",
  "titularLargo",
  "descripcionLarga",
] as const;
export type CampoEditable = (typeof CAMPOS_EDITABLES)[number];
export type AjustesExperiencia = Partial<Record<CampoEditable, string>>;

export function mezclar(base: Experiencia, ajustes?: AjustesExperiencia | null): Experiencia {
  if (!ajustes) return base;
  const salida: Experiencia = { ...base };
  for (const campo of CAMPOS_EDITABLES) {
    const valor = ajustes[campo];
    if (typeof valor === "string" && valor.trim()) salida[campo] = valor.trim();
  }
  return salida;
}

/** Experiencias con los cambios del admin aplicados. Si la tabla no existe o
 *  la base falla, devuelve el contenido del código: el sitio nunca se rompe. */
export async function getExperiencias(): Promise<Experiencia[]> {
  try {
    const db = getSupabase() as unknown as SupabaseClient;
    const { data, error } = await db.from("experiencias_ajustes").select("slug, datos");
    if (error || !data) return EXPERIENCIAS;
    const porSlug = new Map<string, AjustesExperiencia>(
      data.map((f: { slug: string; datos: AjustesExperiencia }) => [f.slug, f.datos]),
    );
    return EXPERIENCIAS.map((e) => mezclar(e, porSlug.get(e.slug)));
  } catch {
    return EXPERIENCIAS;
  }
}

export async function getExperienciaEditable(slug: string): Promise<Experiencia | null> {
  return (await getExperiencias()).find((e) => e.slug === slug) ?? null;
}
