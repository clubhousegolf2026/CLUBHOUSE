import type { Database } from "@/lib/data/database.types";

export type Estado = Database["public"]["Enums"]["estado_contacto"];

export type Lead = {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  estado: Estado;
  origen: string;
  valor_estimado_cop: number | null;
  notas: string | null;
  mensaje: string | null;
  fecha_tentativa: string | null;
  created_at: string;
  updated_at: string;
  proxima_accion: string | null;
  proxima_fecha: string | null;
  etiquetas: string[];
  cotizaciones: number;
  total_cotizado: number;
};

export const COLOR_ESTADO: Record<Estado, string> = {
  nuevo: "#7a8599",
  contactado: "#2e7a5a",
  cotizado: "#b8913f",
  confirmado: "#1b8a5a",
  viajo: "#1f3b2f",
  perdido: "#9a2a2a",
};

export const ABIERTOS: Estado[] = ["nuevo", "contactado", "cotizado"];
export const GANADOS: Estado[] = ["confirmado", "viajo"];

export function diasDesde(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export function textoHace(iso: string): string {
  const d = diasDesde(iso);
  if (d === 0) return "hoy";
  if (d === 1) return "ayer";
  if (d < 30) return `hace ${d} d`;
  return `hace ${Math.floor(d / 30)} m`;
}

/** Fecha 'YYYY-MM-DD' ya pasada (zona local). */
export function vencida(fecha: string | null): boolean {
  if (!fecha) return false;
  const hoy = new Date();
  const iso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  return fecha < iso;
}

export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short" }).format(
    new Date(iso.length === 10 ? `${iso}T12:00:00` : iso),
  );
}

export function fechaHora(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Enlace de WhatsApp: con "+" se respeta el prefijo; con 10 dígitos se asume Colombia (57). */
export function enlaceWhatsApp(telefono: string | null): string | null {
  if (!telefono) return null;
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length < 7) return null;
  const completo = telefono.trim().startsWith("+") || digitos.length > 10 ? digitos : `57${digitos}`;
  return `https://wa.me/${completo}`;
}

export function iniciales(nombre: string): string {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}
