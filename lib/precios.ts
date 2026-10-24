/** Interpretar precios escritos como texto («USD 3.580», «$ 4.500.000») y el
 *  catálogo de tarifas de los viajes. Sin dependencias de servidor. */

export interface PrecioInterpretado {
  moneda: "COP" | "USD";
  valor: number;
}

export function parsePrecio(texto: string): PrecioInterpretado | null {
  const t = (texto ?? "").trim();
  const m = t.match(/\d[\d.,]*/);
  if (!m) return null;
  let n = m[0];
  // «3.580,50» → decimales con coma; «3.580» / «4.500.000» → miles con punto.
  n = /,\d{1,2}$/.test(n) ? n.replace(/\./g, "").replace(",", ".") : n.replace(/[.,]/g, "");
  const valor = parseFloat(n);
  if (!Number.isFinite(valor) || valor <= 0) return null;
  const moneda = /usd|us\$/i.test(t) ? "USD" : /cop|\$/.test(t.toLowerCase()) ? "COP" : valor < 50_000 ? "USD" : "COP";
  return { moneda, valor };
}

export interface ViajeTarifas {
  slug: string;
  nombre: string;
  tarifas: { perfil: string; detalle: string; precio: string; unidad: string }[];
}

export const usd = (n: number) => `USD ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(n)}`;
export const trmTexto = (n: number) => `$${new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
