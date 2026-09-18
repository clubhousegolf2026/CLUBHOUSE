import Link from "next/link";
import { Flame, TrendingUp, UserPlus, Wallet, ArrowUpRight } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { KpiCard } from "@/components/admin/kpi-card";
import { cop } from "@/lib/format";
import { ETIQUETA_ESTADO_CONTACTO, ORDEN_ESTADOS_CONTACTO } from "@/components/admin/estado-badge";

export const dynamic = "force-dynamic";

function diasDesde(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const hace7dias = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const hace5dias = new Date(Date.now() - 5 * 86_400_000).toISOString();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: staff } = user
    ? await supabase.from("staff").select("nombre").eq("user_id", user.id).maybeSingle()
    : { data: null };
  const primerNombre = (staff?.nombre ?? user?.email ?? "equipo").split(/[\s@]/)[0];
  const hora = Number(
    new Intl.DateTimeFormat("es-CO", { hour: "numeric", hour12: false, timeZone: "America/Bogota" }).format(new Date()),
  );
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  const [
    { count: leadsNuevos },
    { count: cotizadosFrios },
    { count: reservasPendientes },
    { data: pipelineAbierto },
    { data: seguimiento },
    { data: todosLosEstados },
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
    supabase.from("contactos").select("estado"),
  ]);

  const porEstado = ORDEN_ESTADOS_CONTACTO.map((estado) => ({
    estado,
    total: (todosLosEstados ?? []).filter((c) => c.estado === estado).length,
  }));
  const maximo = Math.max(1, ...porEstado.map((e) => e.total));

  const valorPipeline = (pipelineAbierto ?? []).reduce(
    (suma, c) => suma + (c.valor_estimado_cop ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      <section
        className="entra admin-side relative overflow-hidden rounded-[var(--radius-panel)] px-7 py-8 text-crema shadow-[var(--shadow-elevada)] sm:px-10 sm:py-10"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">
          Resumen del embudo comercial
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight text-white sm:text-4xl">
          {saludo}, {primerNombre}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-crema/70">
          {(seguimiento ?? []).length > 0
            ? `Tienes ${(seguimiento ?? []).length} lead${(seguimiento ?? []).length === 1 ? "" : "s"} cotizado${(seguimiento ?? []).length === 1 ? "" : "s"} esperando seguimiento.`
            : "Todo al día: no hay leads esperando seguimiento."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/crm"
            className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-5 py-2.5 text-sm font-medium text-carbon transition hover:brightness-110"
          >
            Ir al CRM <ArrowUpRight size={15} />
          </Link>
          <Link
            href="/admin/reservas"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-5 py-2.5 text-sm text-white transition hover:bg-white/10"
          >
            Ver reservas
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard indice={1} icono={<UserPlus size={18} />} tono="verde" etiqueta="Leads nuevos (7 días)" valor={leadsNuevos ?? 0} />
        <KpiCard indice={2} icono={<Flame size={18} />} tono="rojo" etiqueta="Cotizados fríos" valor={cotizadosFrios ?? 0} detalle="Sin novedad hace más de 5 días" />
        <KpiCard indice={3} icono={<Wallet size={18} />} tono="dorado" etiqueta="Reservas por pagar" valor={reservasPendientes ?? 0} />
        <KpiCard indice={4} icono={<TrendingUp size={18} />} tono="azul" etiqueta="Valor en pipeline" formato="cop" valor={valorPipeline} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="entra" style={{ "--i": 5 } as React.CSSProperties}>
          <h2 className="font-serif text-xl text-carbon">Necesitan seguimiento</h2>
          <p className="text-sm text-niebla">
            Leads cotizados con más tiempo sin actualizarse
          </p>

          <div className="admin-tarjeta mt-4 overflow-x-auto rounded-[var(--radius-panel)] admin-fija">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left uppercase">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Correo</th>
                  <th className="px-5 py-3">Días sin novedad</th>
                </tr>
              </thead>
              <tbody>
                {(seguimiento ?? []).map((c) => {
                  const dias = diasDesde(c.updated_at);
                  return (
                    <tr key={c.id}>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/crm/${c.id}`}
                          className="font-medium text-verde-golf hover:underline"
                        >
                          {c.nombre}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-niebla">{c.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${
                            dias > 10 ? "bg-error/10 text-error" : "bg-champagne/15 text-champagne"
                          }`}
                        >
                          {dias} {dias === 1 ? "día" : "días"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {(seguimiento ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-niebla">
                      Nada pendiente por ahora. 
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="entra" style={{ "--i": 6 } as React.CSSProperties}>
          <h2 className="font-serif text-xl text-carbon">Embudo por estado</h2>
          <p className="text-sm text-niebla">Todos los contactos, según su etapa</p>
          <div className="admin-tarjeta mt-4 space-y-4 rounded-[var(--radius-panel)] p-5 admin-fija">
            {porEstado.map(({ estado, total }, i) => (
              <div key={estado}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon">{ETIQUETA_ESTADO_CONTACTO[estado]}</span>
                  <span className="font-medium tabular-nums text-carbon">{total}</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-arena/60">
                  <div
                    className="admin-barra h-full rounded-full bg-gradient-to-r from-verde-golf to-[#4bb389]"
                    style={{
                      width: `${(total / maximo) * 100}%`,
                      animationDelay: `${300 + i * 90}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
