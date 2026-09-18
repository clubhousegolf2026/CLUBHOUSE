/** Trampas contra bots en formularios públicos: un campo señuelo
 *  (`website`, invisible para personas) y un mínimo de tiempo desde que se
 *  pintó el formulario (`t`, marca en ms). Los bots suelen llenar todo al
 *  instante; una persona tarda más de unos segundos. */
export const MIN_MS_FORMULARIO = 3000;
const MAX_MS_FORMULARIO = 24 * 60 * 60 * 1000;

export function esBot(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const { website, t } = body as { website?: unknown; t?: unknown };
  if (typeof website === "string" && website.trim() !== "") return true;
  const edad = Date.now() - Number(t);
  return !Number.isFinite(edad) || edad < MIN_MS_FORMULARIO || edad > MAX_MS_FORMULARIO;
}

export function ipDe(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
}
