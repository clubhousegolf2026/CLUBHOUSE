import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { DestinoForm } from "@/components/admin/destino-form";
import type { DatosDestino } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditarDestinoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: destino } = await supabase
    .from("destinos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!destino) notFound();

  const datos: DatosDestino = {
    id: destino.id,
    nombre: destino.nombre,
    region: destino.region,
    pais: destino.pais,
    lat: destino.lat,
    lng: destino.lng,
    resumen: destino.resumen,
    disponible: destino.disponible,
    orden: destino.orden,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/destinos"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todos los destinos
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Editar destino</h1>
      <DestinoForm destino={datos} />
    </div>
  );
}
