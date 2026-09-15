import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { TarifaForm } from "@/components/admin/tarifa-form";
import type { DatosTarifa } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarTarifaPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const supabase = await createServerSupabase();

  const [{ data: tarifa }, { data: destinos }] = await Promise.all([
    supabase.from("tarifas_componentes").select("*").eq("codigo", codigo).maybeSingle(),
    supabase.from("destinos").select("id, nombre").order("nombre"),
  ]);

  if (!tarifa) notFound();

  const datos: DatosTarifa = {
    codigo: tarifa.codigo,
    tipo: tarifa.tipo,
    nombre: tarifa.nombre,
    descripcion: tarifa.descripcion ?? "",
    precioUnitarioCop: tarifa.precio_unitario_cop,
    unidad: tarifa.unidad,
    temporadaAltaFactor: tarifa.temporada_alta_factor,
    destinoId: tarifa.destino_id,
    activo: tarifa.activo,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/tarifas"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todas las tarifas
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Editar tarifa</h1>
      <TarifaForm tarifa={datos} destinos={destinos ?? []} />
    </div>
  );
}
