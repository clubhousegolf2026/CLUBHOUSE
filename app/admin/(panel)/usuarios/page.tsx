import { ShieldAlert } from "lucide-react";
import { SITE_URL } from "@/lib/site";
import { clienteAdmin, staffActual } from "@/lib/admin/sesion";
import { UsuariosWorkspace, type UsuarioFila } from "@/components/admin/usuarios/usuarios-workspace";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const yo = await staffActual();
  if (!yo || yo.rol !== "admin") {
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-10 text-center">
        <ShieldAlert size={30} className="mx-auto text-alerta" />
        <h1 className="mt-4 font-serif text-2xl text-carbon">Solo para administradores</h1>
        <p className="mt-1 text-sm text-niebla">Pídele a un administrador que te dé ese permiso si necesitas gestionar usuarios.</p>
      </div>
    );
  }

  const db = clienteAdmin();
  let filas: UsuarioFila[] = [];
  let sinAcceso: UsuarioFila[] = [];
  let error: string | null = null;

  if (db) {
    const [staff, lista] = await Promise.all([db.from("staff").select("user_id, nombre, rol, activo, created_at"), db.auth.admin.listUsers({ page: 1, perPage: 200 })]);
    if (staff.error) error = staff.error.message;
    if (lista.error) error = lista.error.message;
    const usuarios = lista.data?.users ?? [];
    const porId = new Map(usuarios.map((u) => [u.id, u]));
    const staffRows = (staff.data ?? []) as { user_id: string; nombre: string | null; rol: "admin" | "asesor"; activo: boolean; created_at: string }[];

    filas = staffRows
      .map((s) => {
        const u = porId.get(s.user_id);
        return {
          id: s.user_id,
          email: u?.email ?? "(sin correo)",
          nombre: s.nombre ?? u?.email ?? "Sin nombre",
          rol: s.rol,
          activo: s.activo,
          creado: u?.created_at ?? s.created_at,
          ultimoAcceso: u?.last_sign_in_at ?? null,
          debeCambiar: Boolean(u?.user_metadata?.debe_cambiar_clave),
          invitacionPendiente: Boolean(u && !u.last_sign_in_at && !u.user_metadata?.debe_cambiar_clave),
        } satisfies UsuarioFila;
      })
      .sort((a, b) => Number(b.rol === "admin") - Number(a.rol === "admin") || a.nombre.localeCompare(b.nombre, "es"));

    const idsStaff = new Set(staffRows.map((s) => s.user_id));
    sinAcceso = usuarios
      .filter((u) => !idsStaff.has(u.id))
      .map((u) => ({
        id: u.id,
        email: u.email ?? "(sin correo)",
        nombre: String(u.user_metadata?.nombre ?? u.email ?? "Sin nombre"),
        rol: "asesor" as const,
        activo: false,
        creado: u.created_at,
        ultimoAcceso: u.last_sign_in_at ?? null,
        debeCambiar: false,
        invitacionPendiente: false,
      }));
  }

  return <UsuariosWorkspace usuarios={filas} sinAcceso={sinAcceso} yoId={yo.id} servicioActivo={Boolean(db)} errorCarga={error} origen={SITE_URL} />;
}
