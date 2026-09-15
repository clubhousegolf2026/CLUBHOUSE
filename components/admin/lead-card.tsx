import Link from "next/link";
import { EstadoSelect } from "@/components/admin/estado-select";
import { cop } from "@/lib/format";
import type { Database } from "@/lib/data/database.types";

type EstadoContacto = Database["public"]["Enums"]["estado_contacto"];

export function LeadCard({
  contacto,
}: {
  contacto: {
    id: string;
    nombre: string;
    email: string;
    estado: EstadoContacto;
    valor_estimado_cop: number | null;
    updated_at: string;
    origen: string;
  };
}) {
  const dias = Math.floor(
    (Date.now() - new Date(contacto.updated_at).getTime()) / 86_400_000,
  );

  return (
    <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-3">
      <Link
        href={`/admin/crm/${contacto.id}`}
        className="block truncate font-medium text-carbon hover:text-verde-golf"
      >
        {contacto.nombre}
      </Link>
      <p className="truncate text-xs text-niebla">{contacto.email}</p>

      <div className="mt-2 flex items-center justify-between text-xs text-niebla">
        <span>{contacto.valor_estimado_cop ? cop(contacto.valor_estimado_cop) : "—"}</span>
        <span>{dias === 0 ? "hoy" : `hace ${dias} d`}</span>
      </div>

      <div className="mt-3">
        <EstadoSelect contactoId={contacto.id} estadoActual={contacto.estado} />
      </div>
    </div>
  );
}
