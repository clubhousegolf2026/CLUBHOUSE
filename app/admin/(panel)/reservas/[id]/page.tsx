import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { EstadoPagoBadge } from "@/components/admin/estado-badge";
import { MarcarPagoForm } from "@/components/admin/marcar-pago-form";
import { cop, fechaCo } from "@/lib/format";
import type { Database } from "@/lib/data/database.types";

export const dynamic = "force-dynamic";

type ReservaDetalle = {
  id: string;
  estado_pago: Database["public"]["Enums"]["estado_pago"];
  monto_deposito_cop: number;
  pasarela: string | null;
  referencia_pago: string | null;
  created_at: string;
  confirmada_at: string | null;
  cotizacion: {
    id: string;
    total: number;
    subtotal: number;
    impuestos: number;
    por_persona: number;
    lineas: { concepto: string; detalle: string; subtotal: number }[];
    contacto: { id: string; nombre: string; email: string; telefono: string | null } | null;
  } | null;
};

export default async function ReservaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("reservas")
    .select(
      "id, estado_pago, monto_deposito_cop, pasarela, referencia_pago, created_at, confirmada_at, cotizacion:cotizaciones(id, total, subtotal, impuestos, por_persona, lineas, contacto:contactos(id, nombre, email, telefono))",
    )
    .eq("id", id)
    .maybeSingle();

  const reserva = data as unknown as ReservaDetalle | null;
  if (!reserva) notFound();

  const contacto = reserva.cotizacion?.contacto;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/reservas" className="text-sm text-niebla hover:text-carbon">
          ← Volver a reservas
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl text-carbon">
            {contacto?.nombre ?? "Reserva"}
          </h1>
          <EstadoPagoBadge estado={reserva.estado_pago} />
        </div>
        {contacto && (
          <p className="text-sm text-niebla">
            <Link href={`/admin/crm/${contacto.id}`} className="hover:underline">
              {contacto.email}
            </Link>
            {contacto.telefono ? ` · ${contacto.telefono}` : ""}
          </p>
        )}
        <p className="text-xs text-niebla">Creada el {fechaCo(reserva.created_at)}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <section>
          <h2 className="font-serif text-lg text-carbon">Itinerario</h2>
          <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-arena bg-blanco-roto">
            <table className="w-full text-sm">
              <tbody>
                {(reserva.cotizacion?.lineas ?? []).map((l, i) => (
                  <tr key={i} className="border-b border-arena last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-carbon">{l.concepto}</p>
                      <p className="text-xs text-niebla">{l.detalle}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {cop(l.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reserva.cotizacion && (
            <div className="mt-3 space-y-1 text-sm">
              <Row label="Subtotal" value={cop(reserva.cotizacion.subtotal)} />
              <Row label="Impuestos" value={cop(reserva.cotizacion.impuestos)} />
              <Row label="Total" value={cop(reserva.cotizacion.total)} destacado />
              <Row label="Por persona" value={cop(reserva.cotizacion.por_persona)} />
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4">
            <Row label="Anticipo" value={cop(reserva.monto_deposito_cop)} />
            <Row label="Pasarela" value={reserva.pasarela ?? "—"} />
            <Row label="Referencia" value={reserva.referencia_pago ?? "—"} />
            {reserva.confirmada_at && (
              <Row label="Confirmada" value={fechaCo(reserva.confirmada_at)} />
            )}
          </div>

          <MarcarPagoForm reservaId={reserva.id} estadoActual={reserva.estado_pago} />
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  destacado,
}: {
  label: string;
  value: string;
  destacado?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-niebla">{label}</span>
      <span className={destacado ? "font-medium text-carbon" : "text-carbon"}>
        {value}
      </span>
    </div>
  );
}
