import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { DestinoForm } from "@/components/admin/destino-form";

export const dynamic = "force-dynamic";

export default async function NuevoDestinoPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("destinos").select("id, nombre, lat, lng");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/destinos"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todos los destinos
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Nuevo destino</h1>
      <DestinoForm ciudades={data ?? []} />
    </div>
  );
}
