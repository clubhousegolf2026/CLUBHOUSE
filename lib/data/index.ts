import type { Tarifa } from "@/lib/pricing/types";
import type {
  PaquetePredefinido,
  Testimonio,
  BloqueoCalendario,
  Destino,
} from "./types";
import {
  TARIFAS_MOCK,
  PAQUETES_MOCK,
  TESTIMONIOS_MOCK,
  BLOQUEOS_MOCK,
  DESTINOS_MOCK,
} from "./mock";
import { getSupabase } from "./supabase";
import type { Database } from "./database.types";

/* ============================================================
   Capa de acceso a datos.
   NEXT_PUBLIC_DATA_SOURCE=mock      -> arreglos en memoria (mock.ts)
   NEXT_PUBLIC_DATA_SOURCE=supabase  -> tablas reales (proyecto "CLUB HOUSE")
   Las firmas y los tipos de retorno son idénticos en ambos casos, así
   que el resto de la app (páginas, componentes, motor de precios)
   no sabe ni le importa cuál está activa.
   ============================================================ */

const FUENTE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

type FilaTarifa = Database["public"]["Tables"]["tarifas_componentes"]["Row"];
type FilaPaquete = Database["public"]["Tables"]["paquetes"]["Row"];
type FilaDestino = Database["public"]["Tables"]["destinos"]["Row"];
type FilaTestimonio = Database["public"]["Tables"]["testimonios"]["Row"];
type FilaBloqueo = Database["public"]["Tables"]["bloqueos_calendario"]["Row"];

function mapTarifa(fila: FilaTarifa): Tarifa {
  return {
    codigo: fila.codigo,
    tipo: fila.tipo,
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? undefined,
    precioUnitarioCop: fila.precio_unitario_cop,
    unidad: fila.unidad,
    temporadaAltaFactor: fila.temporada_alta_factor,
    metadata: (fila.metadata as Record<string, unknown>) ?? undefined,
  };
}

function mapPaquete(
  fila: FilaPaquete,
  camposIncluidos: string[],
): PaquetePredefinido {
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    camposIncluidos,
    noches: fila.noches,
    dias: fila.dias,
    precioDesdeCop: fila.precio_desde_cop,
    galeria: (fila.galeria as { url: string; alt: string }[]) ?? [],
    incluye: fila.incluye ?? [],
    noIncluye: fila.no_incluye ?? [],
    destacado: fila.destacado,
  };
}

function mapDestino(
  fila: FilaDestino,
  campos: string[],
  slugsPaquetes: string[],
): Destino {
  return {
    id: fila.id,
    nombre: fila.nombre,
    region: fila.region,
    pais: fila.pais,
    coordenadas: [fila.lng, fila.lat],
    resumen: fila.resumen,
    campos,
    slugsPaquetes,
    disponible: fila.disponible,
  };
}

function mapTestimonio(fila: FilaTestimonio): Testimonio {
  return {
    id: fila.id,
    nombre: fila.nombre,
    origen: fila.origen,
    texto: fila.texto,
    handicap: fila.handicap ?? undefined,
  };
}

function mapBloqueo(fila: FilaBloqueo): BloqueoCalendario {
  return {
    id: fila.id,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    tipo: fila.tipo,
    nota: fila.nota ?? undefined,
    factorPrecio: fila.factor_precio ?? undefined,
  };
}

export async function getTarifas(): Promise<Tarifa[]> {
  if (FUENTE === "mock") return TARIFAS_MOCK;

  const { data, error } = await getSupabase()
    .from("tarifas_componentes")
    .select("*")
    .eq("activo", true)
    .order("tipo")
    .order("nombre");
  if (error) throw new Error(`getTarifas: ${error.message}`);
  return (data ?? []).map(mapTarifa);
}

export async function getPaquetes(): Promise<PaquetePredefinido[]> {
  if (FUENTE === "mock") return PAQUETES_MOCK;

  const { data, error } = await getSupabase()
    .from("paquetes")
    .select(
      "*, paquete_campos(orden, tarifa:tarifas_componentes(nombre))",
    )
    .eq("activo", true)
    .order("destacado", { ascending: false })
    .order("precio_desde_cop");
  if (error) throw new Error(`getPaquetes: ${error.message}`);

  return (data ?? []).map((fila) => {
    type ConCampos = FilaPaquete & {
      paquete_campos: { orden: number; tarifa: { nombre: string } | null }[];
    };
    const conCampos = fila as unknown as ConCampos;
    const camposIncluidos = [...conCampos.paquete_campos]
      .sort((a, b) => a.orden - b.orden)
      .map((c) => c.tarifa?.nombre)
      .filter((n): n is string => Boolean(n));
    return mapPaquete(fila, camposIncluidos);
  });
}

export async function getPaquetesDestacados(): Promise<PaquetePredefinido[]> {
  return (await getPaquetes()).filter((p) => p.destacado);
}

export async function getPaquetePorSlug(
  slug: string,
): Promise<PaquetePredefinido | null> {
  if (FUENTE === "mock") {
    return PAQUETES_MOCK.find((p) => p.slug === slug) ?? null;
  }
  return (await getPaquetes()).find((p) => p.slug === slug) ?? null;
}

export async function getTestimonios(): Promise<Testimonio[]> {
  if (FUENTE === "mock") return TESTIMONIOS_MOCK;

  const { data, error } = await getSupabase()
    .from("testimonios")
    .select("*")
    .order("orden");
  if (error) throw new Error(`getTestimonios: ${error.message}`);
  return (data ?? []).map(mapTestimonio);
}

export async function getDestinos(): Promise<Destino[]> {
  if (FUENTE === "mock") return DESTINOS_MOCK;

  const { data, error } = await getSupabase()
    .from("destinos")
    .select(
      "*, campos:tarifas_componentes!destino_id(nombre), destino_paquetes(paquete:paquetes(slug))",
    )
    .order("orden");
  if (error) throw new Error(`getDestinos: ${error.message}`);

  return (data ?? []).map((fila) => {
    type ConRelaciones = FilaDestino & {
      campos: { nombre: string }[];
      destino_paquetes: { paquete: { slug: string } | null }[];
    };
    const conRel = fila as unknown as ConRelaciones;
    const campos = conRel.campos.map((c) => c.nombre);
    const slugsPaquetes = conRel.destino_paquetes
      .map((dp) => dp.paquete?.slug)
      .filter((s): s is string => Boolean(s));
    return mapDestino(fila, campos, slugsPaquetes);
  });
}

/** Destinos con sus paquetes ya resueltos, para el mapa de la landing. */
export async function getDestinosConPaquetes(): Promise<
  (Destino & { paquetes: PaquetePredefinido[] })[]
> {
  const [destinos, paquetes] = await Promise.all([getDestinos(), getPaquetes()]);
  return destinos.map((d) => ({
    ...d,
    paquetes: paquetes.filter((p) => d.slugsPaquetes.includes(p.slug)),
  }));
}

export async function getBloqueos(): Promise<BloqueoCalendario[]> {
  if (FUENTE === "mock") return BLOQUEOS_MOCK;

  const { data, error } = await getSupabase()
    .from("bloqueos_calendario")
    .select("*")
    .order("fecha_inicio");
  if (error) throw new Error(`getBloqueos: ${error.message}`);
  return (data ?? []).map(mapBloqueo);
}
