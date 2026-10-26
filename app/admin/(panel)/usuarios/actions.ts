"use server";

import { revalidatePath } from "next/cache";
import { SITE_URL } from "@/lib/site";
import { validarContrasena } from "@/lib/admin/contrasena";
import { clienteAdmin, generarContrasena, requerirAdmin, SIN_CLAVE_SERVICIO, type RolStaff } from "@/lib/admin/sesion";

type Res<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const refrescar = () => revalidatePath("/admin/usuarios");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const redireccionClave = `${SITE_URL}/admin/nueva-clave`;

function mensajeAuth(e: { message: string; code?: string; status?: number }): string {
  const m = e.message.toLowerCase();
  if (e.code === "email_exists" || m.includes("already") || m.includes("registered")) return "Ya existe una cuenta con ese correo.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos de Supabase.";
  if (m.includes("rate limit")) return "Demasiados correos enviados. Espera unos minutos e inténtalo de nuevo.";
  return e.message;
}

/** Cuántos administradores activos hay, sin contar al usuario indicado. */
async function otrosAdmins(db: NonNullable<ReturnType<typeof clienteAdmin>>, sinId: string): Promise<number> {
  const { count } = await db
    .from("staff")
    .select("user_id", { count: "exact", head: true })
    .eq("rol", "admin")
    .eq("activo", true)
    .neq("user_id", sinId);
  return count ?? 0;
}

/* ───────────── Crear ───────────── */

export async function crearUsuario(d: {
  nombre: string;
  email: string;
  rol: RolStaff;
  modo: "contrasena" | "invitacion";
  contrasena?: string;
}): Promise<Res<{ contrasenaTemporal?: string; invitado?: boolean }>> {
  const a = await requerirAdmin();
  if (!a.ok) return a;
  const db = clienteAdmin();
  if (!db) return { ok: false, error: SIN_CLAVE_SERVICIO };

  const nombre = d.nombre.trim();
  const email = d.email.trim().toLowerCase();
  if (!nombre) return { ok: false, error: "Escribe el nombre." };
  if (!EMAIL.test(email)) return { ok: false, error: "El correo no es válido." };
  if (!["admin", "asesor"].includes(d.rol)) return { ok: false, error: "Elige un rol." };

  let userId: string;
  let temporal: string | undefined;

  if (d.modo === "invitacion") {
    const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
      redirectTo: redireccionClave,
      data: { nombre },
    });
    if (error || !data.user) return { ok: false, error: error ? mensajeAuth(error) : "No se pudo enviar la invitación." };
    userId = data.user.id;
  } else {
    const contrasena = d.contrasena?.trim() || generarContrasena();
    const malo = validarContrasena(contrasena);
    if (malo) return { ok: false, error: malo };
    const { data, error } = await db.auth.admin.createUser({
      email,
      password: contrasena,
      email_confirm: true,
      user_metadata: { nombre, debe_cambiar_clave: true },
    });
    if (error || !data.user) return { ok: false, error: error ? mensajeAuth(error) : "No se pudo crear el usuario." };
    userId = data.user.id;
    temporal = contrasena;
  }

  const { error: eStaff } = await db.from("staff").upsert({ user_id: userId, nombre, rol: d.rol, activo: true });
  if (eStaff) {
    await db.auth.admin.deleteUser(userId); // no dejar una cuenta sin permisos a medias
    return { ok: false, error: `No se pudo dar acceso: ${eStaff.message}` };
  }
  refrescar();
  return { ok: true, contrasenaTemporal: temporal, invitado: d.modo === "invitacion" };
}

/** Da acceso al panel a una cuenta que ya existe en Supabase pero no es staff. */
export async function darAcceso(userId: string, rol: RolStaff, nombre: string): Promise<Res> {
  const a = await requerirAdmin();
  if (!a.ok) return a;
  const db = clienteAdmin();
  if (!db) return { ok: false, error: SIN_CLAVE_SERVICIO };
  const { error } = await db.from("staff").upsert({ user_id: userId, nombre: nombre.trim() || null, rol, activo: true });
  if (error) return { ok: false, error: error.message };
  refrescar();
  return { ok: true };
}

/* ───────────── Editar ───────────── */

export async function actualizarUsuario(id: string, d: { nombre: string; rol: RolStaff }): Promise<Res> {
  const a = await requerirAdmin();
  if (!a.ok) return a;
  const db = clienteAdmin();
  if (!db) return { ok: false, error: SIN_CLAVE_SERVICIO };
  const nombre = d.nombre.trim();
  if (!nombre) return { ok: false, error: "Escribe el nombre." };

  if (id === a.yo.id && d.rol !== "admin") return { ok: false, error: "No puedes quitarte a ti mismo el rol de administrador." };
  if (d.rol !== "admin" && (await otrosAdmins(db, id)) === 0) return { ok: false, error: "Debe quedar al menos un administrador activo." };

  const { error } = await db.from("staff").update({ nombre, rol: d.rol }).eq("user_id", id);
  if (error) return { ok: false, error: error.message };
  await db.auth.admin.updateUserById(id, { user_metadata: { nombre } });
  refrescar();
  return { ok: true };
}

export async function cambiarEstadoUsuario(id: string, activo: boolean): Promise<Res> {
  const a = await requerirAdmin();
  if (!a.ok) return a;
  const db = clienteAdmin();
  if (!db) return { ok: false, error: SIN_CLAVE_SERVICIO };
  if (!activo) {
    if (id === a.yo.id) return { ok: false, error: "No puedes desactivar tu propia cuenta." };
    if ((await otrosAdmins(db, id)) === 0) {
      const { data } = await db.from("staff").select("rol").eq("user_id", id).maybeSingle();
      if (data?.rol === "admin") return { ok: false, error: "Debe quedar al menos un administrador activo." };
    }
  }
  const { error } = await db.from("staff").update({ activo }).eq("user_id", id);
  if (error) return { ok: false, error: error.message };
  // Además se bloquea el inicio de sesión en Supabase (si falla, el panel ya lo impide).
  await db.auth.admin.updateUserById(id, { ban_duration: activo ? "none" : "876000h" });
  refrescar();
  return { ok: true };
}

export async function eliminarUsuario(id: string): Promise<Res> {
  const a = await requerirAdmin();
  if (!a.ok) return a;
  const db = clienteAdmin();
  if (!db) return { ok: false, error: SIN_CLAVE_SERVICIO };
  if (id === a.yo.id) return { ok: false, error: "No puedes eliminar tu propia cuenta." };
  const { data } = await db.from("staff").select("rol").eq("user_id", id).maybeSingle();
  if (data?.rol === "admin" && (await otrosAdmins(db, id)) === 0) return { ok: false, error: "Debe quedar al menos un administrador activo." };

  await db.from("staff").delete().eq("user_id", id);
  const { error } = await db.auth.admin.deleteUser(id);
  if (error) return { ok: false, error: mensajeAuth(error) };
  refrescar();
  return { ok: true };
}

/* ───────────── Restablecer contraseña ───────────── */

/** - temporal: pone una contraseña nueva (que verá el admin una sola vez) y pide cambiarla al entrar.
 *  - correo:   envía el correo de restablecimiento.
 *  - enlace:   genera el enlace para mandarlo por WhatsApp u otro medio. */
export async function restablecerContrasena(
  id: string,
  email: string,
  modo: "temporal" | "correo" | "enlace",
): Promise<Res<{ contrasenaTemporal?: string; enlace?: string }>> {
  const a = await requerirAdmin();
  if (!a.ok) return a;
  const db = clienteAdmin();
  if (!db) return { ok: false, error: SIN_CLAVE_SERVICIO };

  if (modo === "temporal") {
    const contrasena = generarContrasena();
    const { error } = await db.auth.admin.updateUserById(id, { password: contrasena, user_metadata: { debe_cambiar_clave: true } });
    if (error) return { ok: false, error: mensajeAuth(error) };
    refrescar();
    return { ok: true, contrasenaTemporal: contrasena };
  }

  if (modo === "correo") {
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: redireccionClave });
    if (error) return { ok: false, error: mensajeAuth(error) };
    return { ok: true };
  }

  const { data, error } = await db.auth.admin.generateLink({ type: "recovery", email, options: { redirectTo: redireccionClave } });
  if (error || !data?.properties?.action_link) return { ok: false, error: error ? mensajeAuth(error) : "No se pudo generar el enlace." };
  return { ok: true, enlace: data.properties.action_link };
}
