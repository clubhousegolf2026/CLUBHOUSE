import { createServerSupabase } from "@/lib/supabase/server";
import { CrmWorkspace } from "@/components/admin/crm/crm-workspace";
import type { Lead } from "@/components/admin/crm/tipos";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const supabase = await createServerSupabase();

  const [contactos, cotizaciones, staff] = await Promise.all([
    supabase.from("contactos").select("*").order("updated_at", { ascending: false }),
    supabase.from("cotizaciones").select("contacto_id, total"),
    supabase.rpc("es_staff"),
  ]);

  // Una consulta bloqueada por RLS no da error: devuelve cero filas. Por eso
  // se pregunta aparte si el usuario cuenta como staff activo.
  let errorCarga: string | null = null;
  if (contactos.error) {
    errorCarga = `${contactos.error.message}${contactos.error.code ? ` (${contactos.error.code})` : ""}`;
  } else if (staff.data === false) {
    errorCarga =
      "Tu usuario no figura como staff activo en Supabase, por eso la base devuelve cero leads. Revisa la tabla `staff` (fila con tu user_id y activo = true).";
  }

  const resumen = new Map<string, { n: number; total: number }>();
  for (const c of cotizaciones.data ?? []) {
    const r = resumen.get(c.contacto_id) ?? { n: 0, total: 0 };
    r.n += 1;
    r.total += c.total ?? 0;
    resumen.set(c.contacto_id, r);
  }

  const leads: Lead[] = (contactos.data ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    email: c.email,
    telefono: c.telefono,
    estado: c.estado,
    origen: c.origen,
    valor_estimado_cop: c.valor_estimado_cop,
    notas: c.notas,
    mensaje: c.mensaje,
    fecha_tentativa: c.fecha_tentativa,
    created_at: c.created_at,
    updated_at: c.updated_at,
    proxima_accion: c.proxima_accion ?? null,
    proxima_fecha: c.proxima_fecha ?? null,
    etiquetas: c.etiquetas ?? [],
    cotizaciones: resumen.get(c.id)?.n ?? 0,
    total_cotizado: resumen.get(c.id)?.total ?? 0,
  }));

  return <CrmWorkspace inicial={leads} errorCarga={errorCarga} />;
}
