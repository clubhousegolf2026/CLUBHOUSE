/** TRM (tasa representativa del mercado, dólar → peso colombiano) del día.
 *  Fuente oficial: Superintendencia Financiera, publicada en datos.gov.co. */

export type Trm = {
  valor: number;
  /** Día desde el que rige (YYYY-MM-DD). */
  fecha: string;
  fuente: "superfinanciera" | "mercado" | "respaldo";
};

const hoyBogota = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

async function desdeSuperfinanciera(fresco: boolean): Promise<Trm | null> {
  const q = new URLSearchParams({
    $select: "valor,vigenciadesde",
    $where: `vigenciadesde <= '${hoyBogota()}T00:00:00.000'`,
    $order: "vigenciadesde DESC",
    $limit: "1",
  });
  const r = await fetch(`https://www.datos.gov.co/resource/32sa-8pi3.json?${q.toString()}`, fresco ? { cache: "no-store" } : { next: { revalidate: 3600 } });
  if (!r.ok) return null;
  const [fila] = (await r.json()) as { valor: string; vigenciadesde: string }[];
  const valor = Number(fila?.valor);
  if (!Number.isFinite(valor) || valor < 500) return null;
  return { valor, fecha: fila.vigenciadesde.slice(0, 10), fuente: "superfinanciera" };
}

async function desdeMercado(fresco: boolean): Promise<Trm | null> {
  const r = await fetch("https://open.er-api.com/v6/latest/USD", fresco ? { cache: "no-store" } : { next: { revalidate: 3600 } });
  if (!r.ok) return null;
  const j = (await r.json()) as { rates?: { COP?: number } };
  const valor = Number(j.rates?.COP);
  return Number.isFinite(valor) && valor > 500 ? { valor, fecha: hoyBogota(), fuente: "mercado" } : null;
}

/** La TRM de hoy. Si la fuente oficial no responde usa el mercado y, por último,
 *  un valor de respaldo (variable TRM_RESPALDO, 4.000 por defecto). */
export async function obtenerTrm(opciones: { fresco?: boolean } = {}): Promise<Trm> {
  const fresco = Boolean(opciones.fresco);
  try {
    const t = await desdeSuperfinanciera(fresco);
    if (t) return t;
  } catch {}
  try {
    const t = await desdeMercado(fresco);
    if (t) return t;
  } catch {}
  return { valor: Number(process.env.TRM_RESPALDO) || 4000, fecha: hoyBogota(), fuente: "respaldo" };
}
