import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarRange } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { PaqueteForm } from "@/components/admin/paquete-form";
import { cop } from "@/lib/format";
import type { DatosPaquete } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarPaquetePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const [{ data: paquete }, { data: campos }, { data: destinos }, { data: ventas }] =
    await Promise.all([
      supabase
        .from("paquetes")
        .select(
          "*, paquete_campos(tarifa_codigo, orden), destino_paquetes(destino_id)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("tarifas_componentes")
        .select("codigo, nombre")
        .eq("tipo", "campo_golf")
        .order("nombre"),
      supabase.from("destinos").select("id, nombre").order("nombre"),
      supabase
        .from("cotizaciones")
        .select("tipo, total, reservas(estado_pago)")
        .eq("paquete_id", id),
    ]);

  if (!paquete) notFound();

  type ConRelaciones = typeof paquete & {
    paquete_campos: { tarifa_codigo: string; orden: number }[];
    destino_paquetes: { destino_id: string }[];
  };
  const conRel = paquete as ConRelaciones;

  const datos: DatosPaquete = {
    id: paquete.id,
    slug: paquete.slug,
    nombre: paquete.nombre,
    descripcion: paquete.descripcion,
    noches: paquete.noches,
    dias: paquete.dias,
    precioDesdeCop: paquete.precio_desde_cop,
    destacado: paquete.destacado,
    activo: paquete.activo,
    incluye: paquete.incluye ?? [],
    noIncluye: paquete.no_incluye ?? [],
    galeria: (paquete.galeria as { url: string; alt: string }[]) ?? [],
    camposIds: [...conRel.paquete_campos]
      .sort((a, b) => a.orden - b.orden)
      .map((c) => c.tarifa_codigo),
    destinosIds: conRel.destino_paquetes.map((d) => d.destino_id),
  };

  type FilaVenta = { tipo: string; total: number; reservas: { estado_pago: string } | { estado_pago: string }[] | null };
  const filasVenta = (ventas ?? []) as FilaVenta[];
  const estaPagada = (r: FilaVenta["reservas"]) =>
    Array.isArray(r) ? r.some((x) => x.estado_pago === "pagado") : r?.estado_pago === "pagado";

  const stats = {
    cotizaciones: filasVenta.length,
    reservas: filasVenta.filter((v) => v.tipo === "reserva").length,
    vendido: filasVenta
      .filter((v) => estaPagada(v.reservas))
      .reduce((acc, v) => acc + v.total, 0),
  };

  return (
    <div className="max-w-6xl space-y-6">
      <Link
        href="/admin/paquetes"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todos los paquetes
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Editar paquete</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard etiqueta="Cotizaciones" valor={stats.cotizaciones.toString()} />
        <StatCard etiqueta="Reservas" valor={stats.reservas.toString()} />
        <StatCard etiqueta="Vendido (confirmado)" valor={cop(stats.vendido)} />
      </div>
      <Link
        href={`/admin/calendario?paquete=${datos.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-verde-golf hover:underline"
      >
        <CalendarRange size={15} /> Calendario propio de este paquete
      </Link>

      <PaqueteForm paquete={datos} campos={campos ?? []} destinos={destinos ?? []} />
    </div>
  );
}

function StatCard({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-4">
      <p className="text-xs uppercase tracking-wide text-niebla">{etiqueta}</p>
      <p className="mt-1 font-serif text-xl text-carbon tabular">{valor}</p>
    </div>
  );
}
