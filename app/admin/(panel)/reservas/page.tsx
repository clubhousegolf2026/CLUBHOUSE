import { createServerSupabase } from "@/lib/supabase/server";
import { ReservasWorkspace, type ReservaFila } from "@/components/admin/reservas/reservas-workspace";

export const dynamic = "force-dynamic";

type Fila = {
  id: string;
  estado_pago: ReservaFila["estado_pago"];
  monto_deposito_cop: number;
  pasarela: string | null;
  created_at: string;
  cotizacion: {
    total: number;
    contacto: { nombre: string; email: string } | null;
  } | null;
};

export default async function ReservasPage() {
  const supabase = await createServerSupabase();
  const [{ data, error }, staff] = await Promise.all([
    supabase
      .from("reservas")
      .select(
        "id, estado_pago, monto_deposito_cop, pasarela, created_at, cotizacion:cotizaciones(total, contacto:contactos(nombre, email))",
      )
      .order("created_at", { ascending: false }),
    supabase.rpc("es_staff"),
  ]);

  let errorCarga: string | null = null;
  if (error) errorCarga = `${error.message}${error.code ? ` (${error.code})` : ""}`;
  else if (staff.data === false) {
    errorCarga = "Tu usuario no figura como staff activo en Supabase, por eso la base devuelve cero reservas.";
  }

  const reservas: ReservaFila[] = ((data ?? []) as unknown as Fila[]).map((r) => ({
    id: r.id,
    estado_pago: r.estado_pago,
    monto_deposito_cop: r.monto_deposito_cop,
    pasarela: r.pasarela,
    created_at: r.created_at,
    total: r.cotizacion?.total ?? 0,
    nombre: r.cotizacion?.contacto?.nombre ?? "Sin cliente",
    email: r.cotizacion?.contacto?.email ?? "",
  }));

  return <ReservasWorkspace inicial={reservas} errorCarga={errorCarga} />;
}
