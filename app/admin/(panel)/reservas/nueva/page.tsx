import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { ReservaNuevaForm } from "@/components/admin/reservas/reserva-nueva-form";

export const dynamic = "force-dynamic";

export default async function NuevaReservaPage() {
  const supabase = await createServerSupabase();
  const { data: contactos } = await supabase
    .from("contactos")
    .select("id, nombre, email")
    .order("nombre");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/reservas" className="text-sm text-niebla hover:text-carbon">← Volver a reservas</Link>
        <h1 className="mt-2 font-serif text-2xl text-carbon">Nueva reserva</h1>
        <p className="text-sm text-niebla">Para reservas cerradas por WhatsApp, teléfono o en persona.</p>
      </div>
      <ReservaNuevaForm contactos={contactos ?? []} />
    </div>
  );
}
