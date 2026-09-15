import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { TarifaForm } from "@/components/admin/tarifa-form";

export const dynamic = "force-dynamic";

export default async function NuevaTarifaPage() {
  const supabase = await createServerSupabase();
  const { data: destinos } = await supabase.from("destinos").select("id, nombre").order("nombre");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/tarifas"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todas las tarifas
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Nueva tarifa</h1>
      <TarifaForm destinos={destinos ?? []} />
    </div>
  );
}
