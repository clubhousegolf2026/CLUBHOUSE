import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { KpiCard } from "@/components/admin/kpi-card";
import { cop } from "@/lib/format";

export const dynamic = "force-dynamic";

function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const hace7dias = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const hace5dias = new Date(Date.now() - 5 * 86_400_000).toISOString();

  const [
    { count: leadsNuevos },
    { count: cotizadosFrios },
    { count: reservasPendientes },
    { data: pipelineAbierto },
    { data: seguimiento },
  ] = await Promise.all([
    supabase
      .from("contactos")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hace7dias),
    supabase
      .from("contactos")
      .select("id", { count: "exact", head: true })
      .eq("estado", "cotizado")
      .lt("updated_at", hace5dias),
    supabase
      .from("reservas")
      .select("id", { count: "exact", head: true })
      .eq("estado_pago", "pendiente"),
    supabase
      .from("contactos")
      .select("valor_estimado_cop")
      .in("estado", ["nuevo", "contactado", "cotizado"]),
    supabase
      .from("contactos")
      .select("id, nombre, email, updated_at")
      .eq("estado", "cotizado")
      .order("updated_at", { ascending: true })
      .limit(10),
  ]);

  const valorPipeline = (pipelineAbierto ?? []).reduce(
    (suma, c) => suma + (c.valor_estimado_cop ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-carbon">Dashboard</h1>
        <p className="text-sm text-niebla">Resumen del embudo comercial</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard etiqueta="Leads nuevos (7 días)" valor={String(leadsNuevos ?? 0)} />
        <KpiCard
          etiqueta="Cotizados fríos"
          valor={String(cotizadosFrios ?? 0)}
          detalle="Sin novedad hace más de 5 días"
        />
        <KpiCard
          etiqueta="Reservas por pagar"
          valor={String(reservasPendientes ?? 0)}
        />
        <KpiCard etiqueta="Valor en pipeline" valor={cop(valorPipeline)} />
      </div>

      <div>
        <h2 className="font-serif text-lg text-carbon">Necesitan seguimiento</h2>
        <p className="text-sm text-niebla">
          Leads cotizados con más tiempo sin actualizarse
        </p>

        <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-arena bg-blanco-roto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Días sin novedad</th>
              </tr>
            </thead>
            <tbody>
              {(seguimiento ?? []).map((c) => (
                <tr key={c.id} className="border-b border-arena last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/crm/${c.id}`}
                      className="text-verde-golf hover:underline"
                    >
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-niebla">{c.email}</td>
                  <td className="px-4 py-3 tabular-nums">{diasDesde(c.updated_at)}</td>
                </tr>
              ))}
              {(seguimiento ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-niebla">
                    Nada pendiente por ahora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
