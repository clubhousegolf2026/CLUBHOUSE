"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { validarContrasena } from "@/lib/admin/contrasena";
import { clienteAdmin, staffActual } from "@/lib/admin/sesion";

type Res = { ok: true; aviso?: string } | { ok: false; error: string };

export async function actualizarMiNombre(nombre: string): Promise<Res> {
  const yo = await staffActual();
  if (!yo) return { ok: false, error: "Tu sesión no es válida. Vuelve a entrar." };
  const limpio = nombre.trim();
  if (!limpio) return { ok: false, error: "Escribe tu nombre." };

  const supabase = await createServerSupabase();
  await supabase.auth.updateUser({ data: { nombre: limpio } });

  const db = clienteAdmin();
  if (db) {
    const { error } = await db.from("staff").update({ nombre: limpio }).eq("user_id", yo.id);
    if (error) return { ok: false, error: error.message };
  } else {
    return { ok: true, aviso: "Se guardó tu perfil, pero el nombre del panel se verá igual hasta activar SUPABASE_SERVICE_ROLE_KEY." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Cambia la contraseña del usuario que tiene la sesión (pide la actual para confirmar). */
export async function cambiarMiContrasena(d: { actual: string; nueva: string }): Promise<Res> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, error: "Tu sesión no es válida. Vuelve a entrar." };

  const malo = validarContrasena(d.nueva);
  if (malo) return { ok: false, error: malo };
  if (d.actual === d.nueva) return { ok: false, error: "La contraseña nueva debe ser distinta de la actual." };

  const { error: eActual } = await supabase.auth.signInWithPassword({ email: user.email, password: d.actual });
  if (eActual) return { ok: false, error: "La contraseña actual no es correcta." };

  const { error } = await supabase.auth.updateUser({ password: d.nueva, data: { debe_cambiar_clave: false } });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}
