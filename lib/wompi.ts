import { createHash, randomBytes } from "node:crypto";
import { SITE_URL } from "@/lib/site";

/** Integración con Wompi (pasarela de Colombia). Las claves viven en variables
 *  de entorno del servidor y nunca se guardan en la base de datos. */

export function configWompi() {
  const publica = process.env.WOMPI_PUBLIC_KEY ?? "";
  const integridad = process.env.WOMPI_INTEGRITY_SECRET ?? "";
  const eventos = process.env.WOMPI_EVENTS_SECRET ?? "";
  return {
    publica,
    integridad,
    eventos,
    /** Las llaves de prueba empiezan por pub_test_. */
    sandbox: !publica.startsWith("pub_prod_"),
    listo: Boolean(publica && integridad),
    webhookListo: Boolean(eventos),
  };
}

export const apiWompi = (sandbox: boolean) =>
  sandbox ? "https://sandbox.wompi.co/v1" : "https://production.wompi.co/v1";

export const sha256 = (t: string) => createHash("sha256").update(t).digest("hex");

export function nuevaReferencia(): string {
  return `CH-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/** Dirección del checkout de Wompi con la firma de integridad. null si faltan claves. */
export function urlCheckout(d: {
  referencia: string;
  montoCop: number;
  email?: string | null;
  nombre?: string | null;
  telefono?: string | null;
}): string | null {
  const c = configWompi();
  if (!c.listo) return null;
  const centavos = Math.round(d.montoCop * 100);
  const q = new URLSearchParams({
    "public-key": c.publica,
    currency: "COP",
    "amount-in-cents": String(centavos),
    reference: d.referencia,
    "signature:integrity": sha256(`${d.referencia}${centavos}COP${c.integridad}`),
    "redirect-url": `${SITE_URL}/pagar/resultado`,
  });
  if (d.email) q.set("customer-data:email", d.email);
  if (d.nombre) q.set("customer-data:full-name", d.nombre.slice(0, 80));
  const tel = (d.telefono ?? "").replace(/\D/g, "").replace(/^57(?=\d{10}$)/, "");
  if (tel.length === 10) {
    q.set("customer-data:phone-number", tel);
    q.set("customer-data:phone-number-prefix", "+57");
  }
  return `https://checkout.wompi.co/p/?${q.toString()}`;
}

export type Transaccion = {
  id: string;
  reference: string;
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  amount_in_cents: number;
  payment_method_type?: string;
  status_message?: string | null;
};

/** Consulta una transacción en Wompi (endpoint público, sin clave). */
export async function consultarTransaccion(id: string): Promise<Transaccion | null> {
  try {
    const { sandbox } = configWompi();
    const r = await fetch(`${apiWompi(sandbox)}/transactions/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { data?: Transaccion };
    return j.data ?? null;
  } catch {
    return null;
  }
}

type EventoWompi = {
  event?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
  signature?: { properties?: string[]; checksum?: string };
};

const leer = (obj: unknown, ruta: string): unknown =>
  ruta.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);

/** Comprueba la firma de un evento: SHA256 de las propiedades indicadas + marca de tiempo + secreto de eventos. */
export function eventoValido(evento: EventoWompi, checksumCabecera?: string | null): boolean {
  const { eventos } = configWompi();
  if (!eventos) return false;
  const props = evento.signature?.properties;
  const esperado = (evento.signature?.checksum ?? checksumCabecera ?? "").toLowerCase();
  if (!props || !esperado || evento.timestamp === undefined) return false;
  const cadena = props.map((p) => String(leer(evento.data, p) ?? "")).join("") + String(evento.timestamp) + eventos;
  return sha256(cadena) === esperado;
}
