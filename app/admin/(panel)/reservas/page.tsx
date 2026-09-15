import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { EstadoPagoBadge } from "@/components/admin/estado-badge";
import { cop, fechaCo } from "@/lib/format";
import type { Database } from "@/lib/data/database.types";

export const dynamic = "force-dynamic";

type EstadoPago = Database["public"]["Enums"]["estado_pago"];
const FILTROS: { valor: EstadoPago | "todas"; etiqueta: string }[] = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "pagado", etiqueta: "Pagadas" },
  { valor: "fallido", etiqueta: "Fallidas" },
  { valor: "reembolsado", etiqueta: "Reembolsadas" },
];

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const supabase = await createServerSupabase();

  let query = supabase
    .from("reservas")
    .select(
      "id, estado_pago, monto_deposito_cop, pasarela, created_at, cotizacion:cotizaciones(total, contacto:contactos(nombre, email))",
    )
    .order("created_at", { ascending: false });

  if (estado && estado !== "todas") {
    query = query.eq("estado_pago", estado as EstadoPago);
  }

  const { data: reservasRaw } = await query;

  type ReservaConCliente = {
    id: string;
    estado_pago: EstadoPago;
    monto_deposito_cop: number;
    pasarela: string | null;
    created_at: string;
    cotizacion: {
      total: number;
      contacto: { nombre: string; email: string } | null;
    } | null;
  };
  const reservas = (reservasRaw ?? []) as unknown as ReservaConCliente[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-carbon">Reservas</h1>
        <p className="text-sm text-niebla">Estado de pago y anticipos</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={f.valor === "todas" ? "/admin/reservas" : `/admin/reservas?estado=${f.valor}`}
            className={`rounded-full px-3 py-1 text-xs ${
              (estado ?? "todas") === f.valor
                ? "bg-verde-golf text-crema"
                : "bg-arena/40 text-niebla"
            }`}
          >
            {f.etiqueta}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-arena bg-blanco-roto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Anticipo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(reservas ?? []).map((r) => (
              <tr key={r.id} className="border-b border-arena last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reservas/${r.id}`}
                    className="text-verde-golf hover:underline"
                  >
                    {r.cotizacion?.contacto?.nombre ?? "—"}
                  </Link>
                  <p className="text-xs text-niebla">{r.cotizacion?.contacto?.email}</p>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {r.cotizacion ? cop(r.cotizacion.total) : "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">{cop(r.monto_deposito_cop)}</td>
                <td className="px-4 py-3">
                  <EstadoPagoBadge estado={r.estado_pago} />
                </td>
                <td className="px-4 py-3 text-niebla">{fechaCo(r.created_at)}</td>
              </tr>
            ))}
            {(reservas ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-niebla">
                  No hay reservas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
