import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { randomInt } from "node:crypto";

export type RolStaff = "admin" | "asesor";

export interface StaffActual {
  id: string;
  email: string;
  nombre: string;
  rol: RolStaff;
}

/** El usuario del panel con la sesión actual (null si no es staff activo). */
export async function staffActual(): Promise<StaffActual | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("staff").select("nombre, rol, activo").eq("user_id", user.id).maybeSingle();
  if (!data || !data.activo) return null;
  return { id: user.id, email: user.email ?? "", nombre: data.nombre ?? user.email ?? "Staff", rol: data.rol as RolStaff };
}

/** Para las acciones que solo puede hacer un administrador. */
export async function requerirAdmin(): Promise<{ ok: true; yo: StaffActual } | { ok: false; error: string }> {
  const yo = await staffActual();
  if (!yo) return { ok: false, error: "Tu sesión no es válida. Vuelve a entrar." };
  if (yo.rol !== "admin") return { ok: false, error: "Solo un administrador puede hacer esto." };
  return { ok: true, yo };
}

export const clienteAdmin = () => createServiceClient();

export const SIN_CLAVE_SERVICIO =
  "Falta la variable SUPABASE_SERVICE_ROLE_KEY en Vercel: sin ella no se pueden crear ni cambiar usuarios.";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; // sin 0 O 1 l I

/** Contraseña temporal legible, con la forma Xxxx-xxxx-xxxx (aprox. 70 bits de azar). */
export function generarContrasena(): string {
  const pick = () => ALFABETO[randomInt(ALFABETO.length)];
  const letras = Array.from({ length: 12 }, pick);
  // Garantiza al menos un número, una mayúscula y una minúscula.
  letras[randomInt(12)] = "23456789"[randomInt(8)];
  letras[0] = "ABCDEFGHJKLMNPQRSTUVWXYZ"[randomInt(24)];
  letras[11] = "abcdefghijkmnpqrstuvwxyz"[randomInt(24)];
  const t = letras.join("");
  return `${t.slice(0, 4)}-${t.slice(4, 8)}-${t.slice(8)}`;
}
