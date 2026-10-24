import {
  MIN_PAGO_COP,
  TIPOS_CON_OPCIONES,
  TIPOS_SIN_DATO,
  type CampoFormulario,
  type ConfigFormulario,
} from "./tipos";

/** Respuestas: texto, lista de textos (casillas) o "si" (aceptación). */
export type Valores = Record<string, string | string[]>;

export const esCampoDeDato = (c: CampoFormulario) => !TIPOS_SIN_DATO.includes(c.tipo);

/** ¿Debe mostrarse este campo con las respuestas actuales? */
export function esVisible(c: CampoFormulario, v: Valores): boolean {
  if (!c.condicion?.campo) return true;
  const x = v[c.condicion.campo];
  return Array.isArray(x) ? x.includes(c.condicion.valor) : x === c.condicion.valor;
}

export function vacio(valor: string | string[] | undefined): boolean {
  if (valor === undefined) return true;
  return Array.isArray(valor) ? valor.length === 0 : valor.trim() === "";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarCampo(c: CampoFormulario, valor: string | string[] | undefined): string | null {
  if (c.requerido && vacio(valor)) {
    return c.tipo === "consentimiento" ? "Debe aceptar para continuar." : "Este campo es obligatorio.";
  }
  if (vacio(valor)) return null;
  const t = Array.isArray(valor) ? "" : (valor ?? "").trim();
  switch (c.tipo) {
    case "email":
      return EMAIL.test(t) ? null : "Escriba un correo válido.";
    case "telefono":
      return t.replace(/\D/g, "").length >= 7 ? null : "Escriba un teléfono válido.";
    case "numero": {
      const n = Number(t);
      if (!Number.isFinite(n)) return "Escriba un número.";
      if (c.min != null && n < c.min) return `El mínimo es ${c.min}.`;
      if (c.max != null && n > c.max) return `El máximo es ${c.max}.`;
      return null;
    }
    case "fecha":
      return /^\d{4}-\d{2}-\d{2}$/.test(t) ? null : "Elija una fecha.";
    case "lista":
    case "opciones":
      return (c.opciones ?? []).some((o) => o.etiqueta === t) ? null : "Elija una de las opciones.";
    case "casillas": {
      const elegidas = Array.isArray(valor) ? valor : [];
      const validas = new Set((c.opciones ?? []).map((o) => o.etiqueta));
      return elegidas.every((e) => validas.has(e)) ? null : "Hay una opción no válida.";
    }
    case "texto":
    case "parrafo":
      return t.length <= (c.tipo === "texto" ? 300 : 2000) ? null : "El texto es demasiado largo.";
    default:
      return null;
  }
}

/** Valida solo los campos visibles y devuelve las respuestas ya limpias. */
export function validar(config: ConfigFormulario, valores: Valores): { errores: Record<string, string>; limpio: Valores } {
  const errores: Record<string, string> = {};
  const limpio: Valores = {};
  for (const c of config.campos) {
    if (!esCampoDeDato(c) || !esVisible(c, valores)) continue;
    const v = valores[c.id];
    const e = validarCampo(c, v);
    if (e) errores[c.id] = e;
    else if (!vacio(v)) limpio[c.id] = Array.isArray(v) ? v : (v ?? "").trim();
  }
  return { errores, limpio };
}

export interface Cobro {
  /** Valor completo del servicio (COP). */
  totalCop: number;
  /** Lo que se cobra ahora (COP): el total o su anticipo. */
  cobrarCop: number;
  personas: number;
}

/** Cuánto cuesta lo que eligió la persona: tarifa × personas + extras de las opciones. */
export function calcularCobro(config: ConfigFormulario, valores: Valores): Cobro {
  const p = config.pago;
  const campoPersonas = config.campos.find((c) => c.personas && c.tipo === "numero");
  const n = campoPersonas ? Math.floor(Number(valores[campoPersonas.id])) : 1;
  const personas = Number.isFinite(n) && n >= 1 ? n : 1;

  const baseCop = p.moneda === "USD" ? p.base * (p.tasaUsd || 0) : p.base;
  let total = Math.max(0, baseCop) * personas;

  for (const c of config.campos) {
    if (!TIPOS_CON_OPCIONES.includes(c.tipo) || !esVisible(c, valores)) continue;
    const v = valores[c.id];
    const elegidas = Array.isArray(v) ? v : v ? [v] : [];
    for (const e of elegidas) total += (c.opciones ?? []).find((o) => o.etiqueta === e)?.precio ?? 0;
  }
  total = Math.round(total);

  const pct = p.anticipoPct && p.anticipoPct > 0 && p.anticipoPct < 100 ? p.anticipoPct : null;
  const cobrar = pct ? Math.round((total * pct) / 100) : total;
  return { totalCop: total, cobrarCop: cobrar, personas };
}

export const cobraAlgo = (config: ConfigFormulario, c: Cobro) => config.pago.activo && c.cobrarCop >= MIN_PAGO_COP;

/** Pasos del formulario (los separa cada campo de tipo «paso»). */
export function pasosDe(config: ConfigFormulario, valores: Valores): { titulo: string; campos: CampoFormulario[] }[] {
  const pasos: { titulo: string; campos: CampoFormulario[] }[] = [];
  let actual: { titulo: string; campos: CampoFormulario[] } = { titulo: "", campos: [] };
  for (const c of config.campos) {
    if (c.tipo === "paso") {
      if (actual.campos.length > 0) pasos.push(actual);
      actual = { titulo: c.etiqueta, campos: [] };
    } else if (esVisible(c, valores)) actual.campos.push(c);
  }
  if (actual.campos.length > 0) pasos.push(actual);
  return pasos.filter((p) => p.campos.some(esCampoDeDato) || p.campos.length > 0);
}

/** Texto plano con las respuestas (para el CRM y los correos). */
export function resumenTexto(config: ConfigFormulario, valores: Valores): string {
  return config.campos
    .filter((c) => esCampoDeDato(c) && !vacio(valores[c.id]))
    .map((c) => {
      const v = valores[c.id];
      return `${c.etiqueta}: ${Array.isArray(v) ? v.join(", ") : v === "si" ? "Sí" : v}`;
    })
    .join("\n");
}

export const pesos = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
