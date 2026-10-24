/** Hoja de costeo de un viaje: costos reales → precio al público.
 *  Es información interna (nunca se publica en el sitio). */

export type Moneda = "USD" | "COP" | "EUR";
export type AplicaA = "persona" | "grupo";
export type ModoGanancia = "margen" | "recargo" | "ganancia";

export const CATEGORIAS_COSTO = [
  "Alojamiento",
  "Green fees y caddies",
  "Traslados y transporte",
  "Alimentación",
  "Actividades y tours",
  "Guía y staff",
  "Seguros",
  "Tiquetes aéreos",
  "Otros",
] as const;

export interface LineaCosto {
  id: string;
  categoria: string;
  concepto: string;
  /** Multiplicador: noches, rondas, días, unidades… */
  cantidad: number;
  costoUnitario: number;
  /** «persona»: se paga por cada viajero. «grupo»: costo fijo que se reparte entre todos. */
  aplicaA: AplicaA;
}

export interface Costeo {
  id: string;
  nombre: string;
  moneda: Moneda;
  /** Personas del grupo con las que se reparten los costos fijos. */
  pax: number;
  lineas: LineaCosto[];
  modo: ModoGanancia;
  /** margen: % de ganancia sobre el precio · recargo: % sobre el costo · ganancia: monto fijo por persona. */
  valorModo: number;
  /** Comisiones de pasarela o de agentes, como % del precio de venta. */
  comisionPct: number;
  /** IVA u otros impuestos que se pagan sobre la venta, como % del precio. */
  impuestosPct: number;
  /** Redondea el precio hacia arriba a este múltiplo (0 = sin redondeo). */
  redondeo: number;
}

export interface CostosExperiencia {
  costeos: Costeo[];
}

export interface Resultado {
  valido: boolean;
  error?: string;
  costoFijoGrupo: number;
  costoVariablePersona: number;
  /** Costo total por persona con el grupo base. */
  costoPersona: number;
  precio: number;
  ganancia: number;
  /** Ganancia como % del precio al público. */
  gananciaPct: number;
  comision: number;
  impuestos: number;
  porCategoria: { categoria: string; porPersona: number }[];
}

const redondear2 = (n: number) => Math.round(n * 100) / 100;

export function costeoVacio(nombre: string, moneda: Moneda = "USD"): Costeo {
  return {
    id: Math.random().toString(36).slice(2, 8),
    nombre,
    moneda,
    pax: 4,
    lineas: [],
    modo: "margen",
    valorModo: 20,
    comisionPct: 0,
    impuestosPct: 0,
    redondeo: 10,
  };
}

export function subtotalLinea(l: LineaCosto): number {
  return (l.cantidad || 0) * (l.costoUnitario || 0);
}

/** Precio al público y ganancia para un tamaño de grupo dado. */
export function calcular(c: Costeo, paxOverride?: number): Resultado {
  const pax = Math.max(1, Math.round(paxOverride ?? c.pax ?? 1));
  let fijo = 0;
  let variable = 0;
  const cat = new Map<string, number>();
  for (const l of c.lineas) {
    const st = subtotalLinea(l);
    if (l.aplicaA === "grupo") fijo += st;
    else variable += st;
    const porPersona = l.aplicaA === "grupo" ? st / pax : st;
    cat.set(l.categoria || "Otros", (cat.get(l.categoria || "Otros") ?? 0) + porPersona);
  }
  const costoPersona = variable + fijo / pax;
  const fees = (c.comisionPct + c.impuestosPct) / 100;

  const vacio: Resultado = {
    valido: false,
    costoFijoGrupo: fijo,
    costoVariablePersona: variable,
    costoPersona,
    precio: 0,
    ganancia: 0,
    gananciaPct: 0,
    comision: 0,
    impuestos: 0,
    porCategoria: [...cat.entries()].map(([categoria, porPersona]) => ({ categoria, porPersona })),
  };

  if (c.lineas.length === 0) return { ...vacio, error: "Agrega al menos un costo." };

  let precio: number;
  if (c.modo === "margen") {
    const denom = 1 - c.valorModo / 100 - fees;
    if (denom <= 0) return { ...vacio, error: "El margen más las comisiones e impuestos suman 100 % o más: no hay precio posible." };
    precio = costoPersona / denom;
  } else if (c.modo === "recargo") {
    if (1 - fees <= 0) return { ...vacio, error: "Las comisiones e impuestos suman 100 % o más." };
    precio = (costoPersona * (1 + c.valorModo / 100)) / (1 - fees);
  } else {
    if (1 - fees <= 0) return { ...vacio, error: "Las comisiones e impuestos suman 100 % o más." };
    precio = (costoPersona + c.valorModo) / (1 - fees);
  }

  precio = c.redondeo > 0 ? Math.ceil(precio / c.redondeo) * c.redondeo : redondear2(precio);
  const comision = precio * (c.comisionPct / 100);
  const impuestos = precio * (c.impuestosPct / 100);
  const ganancia = precio - costoPersona - comision - impuestos;

  return {
    ...vacio,
    valido: true,
    precio,
    ganancia,
    gananciaPct: precio > 0 ? (ganancia / precio) * 100 : 0,
    comision,
    impuestos,
  };
}

export function formatoDinero(n: number, moneda: Moneda): string {
  const cifra = new Intl.NumberFormat("es-CO", { maximumFractionDigits: moneda === "COP" ? 0 : 2 }).format(n);
  return `${moneda} ${cifra}`;
}
