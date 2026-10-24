import { NextResponse } from "next/server";
import type { Database } from "@/lib/data/database.types";
import { ipDe } from "@/lib/anti-spam";
import { rateLimit } from "@/lib/rate-limit";
import { errorApi } from "@/lib/api/claves";

export const ESTADOS_LEAD = ["nuevo", "contactado", "cotizado", "confirmado", "viajo", "perdido"] as const;
export const ESTADOS_PAGO = ["pendiente", "pagado", "fallido", "reembolsado"] as const;

type FilaContacto = Database["public"]["Tables"]["contactos"]["Row"];

/** Forma pública de un lead (nombres de campo estables para quien integra). */
export function leadApi(c: FilaContacto) {
  return {
    id: c.id,
    nombre: c.nombre,
    email: c.email,
    telefono: c.telefono,
    estado: c.estado,
    origen: c.origen,
    valor_estimado_cop: c.valor_estimado_cop,
    mensaje: c.mensaje,
    notas: c.notas,
    fecha_tentativa: c.fecha_tentativa,
    proxima_accion: c.proxima_accion ?? null,
    proxima_fecha: c.proxima_fecha ?? null,
    etiquetas: c.etiquetas ?? [],
    creado: c.created_at,
    actualizado: c.updated_at,
  };
}

/** 120 solicitudes por minuto y por IP. */
export function limitar(req: Request): NextResponse | null {
  if (!rateLimit(`api-v1:${ipDe(req)}`, 120, 60)) {
    return errorApi(429, "demasiadas_solicitudes", "Demasiadas solicitudes. Espera un minuto.");
  }
  return null;
}

export function paginacion(url: URL): { limite: number; desplazamiento: number } {
  const limite = Math.min(100, Math.max(1, Number(url.searchParams.get("limite")) || 50));
  const desplazamiento = Math.max(0, Number(url.searchParams.get("desplazamiento")) || 0);
  return { limite, desplazamiento };
}

export const esUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
