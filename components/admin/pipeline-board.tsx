import { LeadCard } from "@/components/admin/lead-card";
import { ORDEN_ESTADOS_CONTACTO, ETIQUETA_ESTADO_CONTACTO } from "@/components/admin/estado-badge";
import type { Database } from "@/lib/data/database.types";

type Contacto = {
  id: string;
  nombre: string;
  email: string;
  estado: Database["public"]["Enums"]["estado_contacto"];
  valor_estimado_cop: number | null;
  updated_at: string;
  origen: string;
};

export function PipelineBoard({ contactos }: { contactos: Contacto[] }) {
  return (
    <div className="grid grid-flow-col auto-cols-[260px] gap-4 overflow-x-auto pb-4">
      {ORDEN_ESTADOS_CONTACTO.map((estado) => {
        const columna = contactos.filter((c) => c.estado === estado);
        return (
          <div key={estado} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-carbon">
                {ETIQUETA_ESTADO_CONTACTO[estado]}
              </h3>
              <span className="text-xs text-niebla">{columna.length}</span>
            </div>
            <div className="flex flex-col gap-3">
              {columna.map((contacto) => (
                <LeadCard key={contacto.id} contacto={contacto} />
              ))}
              {columna.length === 0 && (
                <p className="rounded-[var(--radius-card)] border border-dashed border-arena p-3 text-center text-xs text-niebla">
                  Vacío
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
