const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "8 – 16 mar 2027" o "28 jun – 5 jul 2027" → fechas ISO para los calendarios. */
export function leerFechas(texto: string): { inicio: string; fin: string } {
  const m = texto
    .toLowerCase()
    .match(/(\d{1,2})(?:\s+([a-zñ]{3}))?\s*[–-]\s*(\d{1,2})\s+([a-zñ]{3})\s+(\d{4})/);
  if (!m) return { inicio: "", fin: "" };
  const [, d1, m1, d2, m2, anio] = m;
  const mesFin = MESES.indexOf(m2);
  const mesIni = m1 ? MESES.indexOf(m1) : mesFin;
  if (mesFin < 0 || mesIni < 0) return { inicio: "", fin: "" };
  const iso = (a: string, mes: number, d: string) =>
    `${a}-${String(mes + 1).padStart(2, "0")}-${d.padStart(2, "0")}`;
  return { inicio: iso(anio, mesIni, d1), fin: iso(anio, mesFin, d2) };
}

function partes(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return { a, m: m - 1, d };
}

/** Dos fechas ISO → "8 – 16 mar 2027" (el formato que usa el sitio). */
export function escribirFechas(inicio: string, fin: string): string {
  if (!inicio || !fin) return "";
  const i = partes(inicio);
  const f = partes(fin);
  if (i.a === f.a && i.m === f.m) return `${i.d} – ${f.d} ${MESES[f.m]} ${f.a}`;
  if (i.a === f.a) return `${i.d} ${MESES[i.m]} – ${f.d} ${MESES[f.m]} ${f.a}`;
  return `${i.d} ${MESES[i.m]} ${i.a} – ${f.d} ${MESES[f.m]} ${f.a}`;
}

export function nochesEntre(inicio: string, fin: string): number {
  return Math.round((Date.parse(`${fin}T12:00:00Z`) - Date.parse(`${inicio}T12:00:00Z`)) / 86_400_000);
}

export function textoDuracion(noches: number): string {
  return `${noches} ${noches === 1 ? "noche" : "noches"} / ${noches + 1} días`;
}

export const slugificar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
