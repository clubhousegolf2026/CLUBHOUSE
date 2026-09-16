import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DestinoForm } from "@/components/admin/destino-form";

export default function NuevoDestinoPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/destinos"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Todos los destinos
      </Link>
      <h1 className="font-serif text-2xl text-carbon">Nuevo destino</h1>
      <DestinoForm />
    </div>
  );
}
