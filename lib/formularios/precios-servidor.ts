import { getExperiencias } from "@/lib/contenido/experiencias-editables";
import { planDeExperiencia } from "@/lib/precios";
import { obtenerTrm } from "@/lib/trm";
import { configVivo, type DetalleCobro } from "./plan";
import type { ConfigFormulario } from "./tipos";

/** El formulario con los datos de hoy: lee el plan relacionado (precios, tarifas,
 *  salidas) y la TRM del día. Se usa al mostrar el formulario y al recibir una inscripción. */
export async function resolverConfig(config: ConfigFormulario): Promise<{ config: ConfigFormulario; detalle: DetalleCobro }> {
  const slug = config.experiencia || config.pago.viajeSlug;
  let plan;
  if (slug) {
    const e = (await getExperiencias()).find((x) => x.slug === slug);
    plan = e ? planDeExperiencia(e) : undefined;
  }
  const necesitaTrm = config.pago.activo && (config.pago.moneda === "USD" || config.pago.fuente === "viaje") && config.pago.trmAuto;
  const trm = necesitaTrm ? (await obtenerTrm()).valor : 0;
  return configVivo(config, plan, trm);
}
