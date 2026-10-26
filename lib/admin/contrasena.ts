/** Reglas de contraseña del panel. Sin dependencias de servidor: las usan el
 *  navegador (medidor y validación al escribir) y las acciones del servidor. */

export const MIN_CONTRASENA = 10;

export function validarContrasena(p: string): string | null {
  if (p.length < MIN_CONTRASENA) return `Usa al menos ${MIN_CONTRASENA} caracteres.`;
  if (p.length > 72) return "La contraseña es demasiado larga (máximo 72).";
  if (!/[A-Za-z]/.test(p)) return "Incluye al menos una letra.";
  if (!/\d/.test(p)) return "Incluye al menos un número.";
  return null;
}

/** 0 = vacía · 1 = débil · 2 = aceptable · 3 = buena · 4 = muy buena */
export function fortaleza(p: string): 0 | 1 | 2 | 3 | 4 {
  if (!p) return 0;
  let puntos = 0;
  if (p.length >= MIN_CONTRASENA) puntos++;
  if (p.length >= 14) puntos++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) puntos++;
  if (/\d/.test(p)) puntos++;
  if (/[^A-Za-z0-9]/.test(p)) puntos++;
  if (p.length < 6) return 1;
  return Math.max(1, Math.min(4, puntos - (p.length < MIN_CONTRASENA ? 1 : 0))) as 1 | 2 | 3 | 4;
}

export const ETIQUETA_FORTALEZA = ["", "Débil", "Aceptable", "Buena", "Muy buena"] as const;
