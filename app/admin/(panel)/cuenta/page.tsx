import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { staffActual } from "@/lib/admin/sesion";
import { CuentaWorkspace } from "@/components/admin/usuarios/cuenta-workspace";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const yo = await staffActual();
  if (!yo) redirect("/admin/login");
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <CuentaWorkspace nombre={yo.nombre} email={yo.email} rol={yo.rol} debeCambiar={user?.user_metadata?.debe_cambiar_clave === true} />;
}
