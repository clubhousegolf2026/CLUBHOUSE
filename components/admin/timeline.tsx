import { ETIQUETA_ESTADO_CONTACTO } from "@/components/admin/estado-badge";
import type { Database } from "@/lib/data/database.types";

const fechaHora = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

type Evento = {
  id: number;
  estado_anterior: Database["public"]["Enums"]["estado_contacto"] | null;
  estado_nuevo: Database["public"]["Enums"]["estado_contacto"];
  nota: string | null;
  created_at: string;
};

export function Timeline({ eventos }: { eventos: Evento[] }) {
  if (eventos.length === 0) {
    return <p className="text-sm text-niebla">Sin actividad todavía.</p>;
  }

  return (
    <ol className="space-y-4 border-l border-arena pl-4">
      {eventos.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-verde-golf" />
          <p className="text-sm text-carbon">
            {e.estado_anterior
              ? `${ETIQUETA_ESTADO_CONTACTO[e.estado_anterior]} → ${ETIQUETA_ESTADO_CONTACTO[e.estado_nuevo]}`
              : `Creado como ${ETIQUETA_ESTADO_CONTACTO[e.estado_nuevo]}`}
          </p>
          {e.nota && <p className="mt-0.5 text-sm text-niebla">{e.nota}</p>}
          <p className="mt-0.5 text-xs text-niebla">
            {fechaHora.format(new Date(e.created_at))}
          </p>
        </li>
      ))}
    </ol>
  );
}
