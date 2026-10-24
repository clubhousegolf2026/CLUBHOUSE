import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { configWompi } from "@/lib/wompi";
import { obtenerTrm } from "@/lib/trm";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import type { ViajeTarifas } from "@/lib/precios";
import { PagosWorkspace, type FilaPago, type ReservaPendiente } from "@/components/admin/pagos/pagos-workspace";

export const dynamic = "force-dynamic";

type FilaReserva = {
  id: string;
  monto_deposito_cop: number;
  cotizacion: { contacto: { nombre: string; email: string; telefono: string | null } | null } | null;
};

export default async function PagosPage() {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const [pagos, reservas, trm, { experiencias }] = await Promise.all([
    db
      .from("pagos")
      .select("id, referencia, monto_cop, concepto, estado, nombre, email, origen, metodo, created_at, pagado_at")
      .order("created_at", { ascending: false })
      .limit(200),
    db
      .from("reservas")
      .select("id, monto_deposito_cop, cotizacion:cotizaciones(contacto:contactos(nombre, email, telefono))")
      .eq("estado_pago", "pendiente")
      .order("created_at", { ascending: false }),
    obtenerTrm(),
    getExperienciasAdmin(db),
  ]);

  const viajes: ViajeTarifas[] = experiencias
    .filter((e) => e.tarifas.length > 0)
    .map((e) => ({
      slug: e.slug,
      nombre: e.nombre,
      tarifas: e.tarifas.map((t) => ({ perfil: t.perfil, detalle: t.detalle, precio: t.precio, unidad: t.unidad })),
    }));

  const migracionPendiente = Boolean(pagos.error && ["42P01", "PGRST205"].includes(pagos.error.code ?? ""));
  const w = configWompi();

  const pendientes: ReservaPendiente[] = ((reservas.data ?? []) as unknown as FilaReserva[]).map((r) => {
    const c = r.cotizacion?.contacto;
    return {
      id: r.id,
      etiqueta: c?.nombre ?? "Sin cliente",
      monto: r.monto_deposito_cop,
      nombre: c?.nombre ?? "",
      email: c?.email ?? "",
      telefono: c?.telefono ?? "",
    };
  });

  return (
    <PagosWorkspace
      pagos={(pagos.error ? [] : pagos.data ?? []) as FilaPago[]}
      reservas={pendientes}
      viajes={viajes}
      trmInicial={trm}
      conexion={{
        publica: Boolean(w.publica),
        integridad: Boolean(w.integridad),
        eventos: w.webhookListo,
        servicio: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        sandbox: w.sandbox,
      }}
      origen={SITE_URL}
      migracionPendiente={migracionPendiente}
    />
  );
}
