/** URL pública del sitio. Se puede cambiar con NEXT_PUBLIC_SITE_URL (p. ej.
 *  al conectar un dominio propio) sin tocar el código. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://clubhouse-lac.vercel.app"
).replace(/\/$/, "");

export const SITE_NOMBRE = "Clubhouse";
