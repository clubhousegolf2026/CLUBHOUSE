import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/data/database.types";
import { EstadoContactoBadge, EstadoPagoBadge } from "@/components/admin/estado-badge";
import { EstadoSelect } from "@/components/admin/estado-select";
import { Timeline } from "@/components/admin/timeline";
import { FichaContactoForm } from "@/components/admin/ficha-contacto-form";
import { cop, fechaCo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function FichaLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: contacto } = await supabase
    .from("contactos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!contacto) notFound();

  const [{ data: cotizacionesRaw }, { data: eventos }] = await Promise.all([
    supabase
      .from("cotizaciones")
      .select(
        "id, tipo, estado, total, moneda, created_at, reservas(id, estado_pago, monto_deposito_cop)",
      )
      .eq("contacto_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_eventos")
      .select("id, estado_anterior, estado_nuevo, nota, created_at")
      .eq("contacto_id", id)
      .order("created_at", { ascending: false }),
  ]);

  // reservas.cotizacion_id es único (1 reserva por cotización), así que el
  // embed inverso desde cotizaciones trae un objeto, no un arreglo.
  type CotizacionConReserva = {
    id: string;
    tipo: Database["public"]["Enums"]["tipo_cotizacion"];
    estado: Database["public"]["Enums"]["estado_cotizacion"];
    total: number;
    moneda: string;
    created_at: string;
    reservas: {
      id: string;
      estado_pago: Database["public"]["Enums"]["estado_pago"];
      monto_deposito_cop: number;
    } | null;
  };
  const cotizaciones = (cotizacionesRaw ?? []) as unknown as CotizacionConReserva[];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/crm" className="text-sm text-niebla hover:text-carbon">
          ← Volver al CRM
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl text-carbon">{contacto.nombre}</h1>
          <EstadoContactoBadge estado={contacto.estado} />
        </div>
        <p className="text-sm text-niebla">
          {contacto.email} · {contacto.telefono ?? "sin teléfono"} · origen {contacto.origen}
        </p>
        <p className="text-xs text-niebla">
          Creado el {fechaCo(contacto.created_at)}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-lg text-carbon">Cotizaciones y reservas</h2>
            <div className="mt-3 space-y-3">
              {cotizaciones.map((c) => (
                <div
                  key={c.id}
                  className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-carbon">
                      {c.tipo === "reserva" ? "Reserva" : "Cotización"} ·{" "}
                      {cop(c.total)}
                    </span>
                    <span className="text-xs text-niebla">{fechaCo(c.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-niebla">Estado: {c.estado}</p>
                  {c.reservas && (
                    <div className="mt-2 flex items-center justify-between border-t border-arena pt-2">
                      <span className="text-xs text-niebla">
                        Anticipo {cop(c.reservas.monto_deposito_cop)}
                      </span>
                      <EstadoPagoBadge estado={c.reservas.estado_pago} />
                    </div>
                  )}
                </div>
              ))}
              {cotizaciones.length === 0 && (
                <p className="text-sm text-niebla">Todavía no tiene cotizaciones.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg text-carbon">Ficha</h2>
            <div className="mt-3 rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4">
              <FichaContactoForm
                contactoId={contacto.id}
                valorInicial={contacto.valor_estimado_cop}
                notasIniciales={contacto.notas}
              />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-lg text-carbon">Estado</h2>
            <div className="mt-3">
              <EstadoSelect contactoId={contacto.id} estadoActual={contacto.estado} />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg text-carbon">Historial</h2>
            <div className="mt-3">
              <Timeline eventos={eventos ?? []} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
