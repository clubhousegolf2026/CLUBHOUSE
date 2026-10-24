import { getExperiencias } from "@/lib/contenido/experiencias-editables";
import { parsePrecio } from "@/lib/precios";
import { obtenerTrm } from "@/lib/trm";
import type { ConfigFormulario, ConfigPago } from "./tipos";

export interface PagoResuelto {
  pago: ConfigPago;
  /** Para el desglose del cobro. */
  detalle: { viaje: string | null; perfil: string | null; usd: number | null; trm: number | null; trmFecha: string | null };
}

/** Deja la configuración de pago con los valores de HOY: la tarifa actual del
 *  viaje (si se toma de uno) y la TRM del día (si la tarifa está en dólares). */
export async function resolverPago(config: ConfigFormulario): Promise<PagoResuelto> {
  const pago: ConfigPago = { ...config.pago };
  const detalle: PagoResuelto["detalle"] = { viaje: null, perfil: null, usd: null, trm: null, trmFecha: null };

  if (pago.fuente === "viaje" && pago.viajeSlug) {
    const viaje = (await getExperiencias()).find((e) => e.slug === pago.viajeSlug);
    const tarifa = viaje?.tarifas.find((t) => t.perfil === pago.viajePerfil) ?? viaje?.tarifas[0];
    const precio = tarifa ? parsePrecio(tarifa.precio) : null;
    if (viaje && tarifa && precio) {
      pago.base = precio.valor;
      pago.moneda = precio.moneda;
      detalle.viaje = viaje.nombre;
      detalle.perfil = tarifa.perfil;
    }
  }

  if (pago.moneda === "USD") {
    detalle.usd = pago.base;
    if (pago.trmAuto) {
      const t = await obtenerTrm();
      pago.tasaUsd = t.valor;
    }
    detalle.trm = pago.tasaUsd;
    detalle.trmFecha = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  }
  return { pago, detalle };
}
