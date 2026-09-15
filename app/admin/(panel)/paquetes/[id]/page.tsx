import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { PaqueteForm } from "@/components/admin/paquete-form";
import type { DatosPaquete } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarPaquetePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const [{ data: paquete }, { data: campos }, { data: destinos }] = await Promise.all([
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

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/paquetes"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todos los paquetes
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Editar paquete</h1>

      <PaqueteForm paquete={datos} campos={campos ?? []} destinos={destinos ?? []} />
    </div>
  );
}
