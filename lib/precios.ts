import type { Experiencia } from "@/lib/contenido/experiencias";
import { escribirFechas } from "@/lib/contenido/fechas-viaje";

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

/** Todo lo que un formulario necesita saber de un viaje (plan). */
export interface PlanInfo {
  slug: string;
  nombre: string;
  pais: string;
  bandera: string;
  subtitulo: string;
  resumen: string;
  descripcion: string;
  foto: string;
  fechas: string;
  duracion: string;
  desde: string;
  publicada: boolean;
  salidas: { id: string; inicio: string; fin: string; cupos: number | null; estado: string; nota: string }[];
  tarifas: { perfil: string; detalle: string; precio: string; unidad: string }[];
  incluye: string[];
  noIncluye: string[];
  politicas: { titulo: string; texto: string }[];
  grupoMax: number | null;
  anticipoPct: number | null;
}

export function planDeExperiencia(e: Experiencia): PlanInfo {
  return {
    slug: e.slug,
    nombre: e.nombre,
    pais: e.pais,
    bandera: e.bandera,
    subtitulo: e.subtitulo,
    resumen: e.resumen,
    descripcion: e.descripcionLarga,
    foto: e.foto,
    fechas: e.fechas,
    duracion: e.duracion,
    desde: e.desde,
    publicada: e.publicada !== false,
    salidas: (e.salidas ?? []).map((s) => ({ id: s.id, inicio: s.inicio, fin: s.fin, cupos: s.cupos, estado: s.estado, nota: s.nota ?? "" })),
    tarifas: e.tarifas.map((t) => ({ perfil: t.perfil, detalle: t.detalle, precio: t.precio, unidad: t.unidad })),
    incluye: e.incluye.filter((x) => x.trim()),
    noIncluye: e.noIncluye.filter((x) => x.trim()),
    politicas: (e.politicas ?? []).map((p) => ({ titulo: p.titulo, texto: p.texto })),
    grupoMax: e.grupo?.max ?? null,
    anticipoPct: e.anticipoPct ?? null,
  };
}

/** Texto de una tarifa como opción de formulario: «Golfista · Habitación doble · USD 3.580». */
export const etiquetaTarifa = (t: { perfil: string; detalle: string; precio: string }) =>
  [t.perfil, t.detalle, t.precio].filter((x) => x && x.trim()).join(" · ");

/** Texto de una salida como opción de formulario: «28 jun – 5 jul 2027 · 8 cupos». */
export const etiquetaSalida = (s: { inicio: string; fin: string; cupos: number | null }) =>
  `${escribirFechas(s.inicio, s.fin)}${s.cupos != null ? ` · ${s.cupos} cupos` : ""}`;

export const salidasAbiertas = (p: PlanInfo) =>
  p.salidas.filter((s) => s.inicio && s.fin && (s.estado === "abierta" || s.estado === "ultimos"));
