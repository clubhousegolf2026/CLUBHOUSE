import { cn } from "@/lib/cn";
import type { Database } from "@/lib/data/database.types";

type EstadoContacto = Database["public"]["Enums"]["estado_contacto"];
type EstadoPago = Database["public"]["Enums"]["estado_pago"];

const ESTADOS_CONTACTO: Record<
  EstadoContacto,
  { etiqueta: string; className: string }
> = {
  nuevo: { etiqueta: "Nuevo", className: "bg-niebla/10 text-niebla" },
  contactado: { etiqueta: "Contactado", className: "bg-verde-golf/10 text-verde-golf" },
  cotizado: { etiqueta: "Cotizado", className: "bg-champagne/15 text-champagne" },
  confirmado: { etiqueta: "Confirmado", className: "bg-exito/10 text-exito" },
  viajo: { etiqueta: "Viajó", className: "bg-verde-calle/10 text-verde-calle" },
  perdido: { etiqueta: "Perdido", className: "bg-error/10 text-error" },
};

const ESTADOS_PAGO: Record<EstadoPago, { etiqueta: string; className: string }> = {
  pendiente: { etiqueta: "Pendiente", className: "bg-niebla/10 text-niebla" },
  pagado: { etiqueta: "Pagado", className: "bg-exito/10 text-exito" },
  fallido: { etiqueta: "Fallido", className: "bg-error/10 text-error" },
  reembolsado: { etiqueta: "Reembolsado", className: "bg-alerta/10 text-alerta" },
};

export function EstadoContactoBadge({ estado }: { estado: EstadoContacto }) {
  const { etiqueta, className } = ESTADOS_CONTACTO[estado];
  return <Badge className={className}>{etiqueta}</Badge>;
}

export function EstadoPagoBadge({ estado }: { estado: EstadoPago }) {
  const { etiqueta, className } = ESTADOS_PAGO[estado];
  return <Badge className={className}>{etiqueta}</Badge>;
}

function Badge({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export const ORDEN_ESTADOS_CONTACTO: EstadoContacto[] = [
  "nuevo",
  "contactado",
  "cotizado",
  "confirmado",
  "viajo",
  "perdido",
];

export const ETIQUETA_ESTADO_CONTACTO: Record<EstadoContacto, string> =
  Object.fromEntries(
    ORDEN_ESTADOS_CONTACTO.map((e) => [e, ESTADOS_CONTACTO[e].etiqueta]),
  ) as Record<EstadoContacto, string>;
