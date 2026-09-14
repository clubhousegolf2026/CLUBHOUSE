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

/* ============================================================
   Capa de acceso a datos.
   Hoy: devuelve datos mock.
   Mañana: reemplazar el cuerpo de cada función por una consulta
   a Supabase (createServerClient / service client). Las firmas y
   los tipos de retorno NO cambian, así que el resto de la app
   (páginas, componentes, motor de precios) queda intacto.
   ============================================================ */

const FUENTE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";

export async function getTarifas(): Promise<Tarifa[]> {
  if (FUENTE === "mock") return TARIFAS_MOCK;
  // TODO Supabase:
  // const supabase = createServiceClient();
  // const { data } = await supabase.from("tarifas_componentes")
  //   .select("...").eq("activo", true);
  // return (data ?? []).map(mapTarifa);
  return TARIFAS_MOCK;
}

export async function getPaquetes(): Promise<PaquetePredefinido[]> {
  if (FUENTE === "mock") return PAQUETES_MOCK;
  return PAQUETES_MOCK;
}

export async function getPaquetesDestacados(): Promise<PaquetePredefinido[]> {
  return (await getPaquetes()).filter((p) => p.destacado);
}

export async function getPaquetePorSlug(
  slug: string,
): Promise<PaquetePredefinido | null> {
  return (await getPaquetes()).find((p) => p.slug === slug) ?? null;
}

export async function getTestimonios(): Promise<Testimonio[]> {
  return TESTIMONIOS_MOCK;
}

export async function getDestinos(): Promise<Destino[]> {
  return DESTINOS_MOCK;
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
  return BLOQUEOS_MOCK;
}
