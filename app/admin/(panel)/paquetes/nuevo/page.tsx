import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { PaqueteForm } from "@/components/admin/paquete-form";

export const dynamic = "force-dynamic";

export default async function NuevoPaquetePage() {
  const supabase = await createServerSupabase();
  const [{ data: campos }, { data: destinos }] = await Promise.all([
    supabase
      .from("tarifas_componentes")
      .select("codigo, nombre")
      .eq("tipo", "campo_golf")
      .order("nombre"),
    supabase.from("destinos").select("id, nombre").order("nombre"),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/paquetes"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todos los paquetes
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Nuevo paquete</h1>

      <PaqueteForm campos={campos ?? []} destinos={destinos ?? []} />
    </div>
  );
}
