"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { MIN_PAGO_COP } from "@/lib/formularios/tipos";
import { nuevaReferencia } from "@/lib/wompi";

type Res<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Crea un enlace de pago manual (para cobrar un anticipo por WhatsApp, por ejemplo). */
export async function crearEnlacePago(d: {
  concepto: string;
  montoCop: number;
  nombre: string;
  email: string;
  telefono: string;
  reservaId?: string | null;
}): Promise<Res<{ referencia: string }>> {
  const concepto = d.concepto.trim();
  if (!concepto) return { ok: false, error: "Escribe el concepto del cobro." };
  const monto = Math.round(d.montoCop);
  if (!Number.isFinite(monto) || monto < MIN_PAGO_COP) {
    return { ok: false, error: `El valor mínimo es ${MIN_PAGO_COP.toLocaleString("es-CO")} COP.` };
  }
  const referencia = nuevaReferencia();
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { error } = await db.from("pagos").insert({
    referencia,
    monto_cop: monto,
    concepto,
    nombre: d.nombre.trim() || null,
    email: d.email.trim() || null,
    telefono: d.telefono.trim() || null,
    origen: d.reservaId ? "reserva" : "manual",
    origen_id: d.reservaId || null,
  });
  if (error) {
    const falta = ["42P01", "PGRST205"].includes(error.code ?? "");
    return { ok: false, error: falta ? "Falta aplicar la migración 0010 en Supabase." : error.message };
  }
  revalidatePath("/admin/pagos");
  return { ok: true, referencia };
}

export async function eliminarPago(id: string): Promise<Res> {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { error } = await db.from("pagos").delete().eq("id", id).neq("estado", "APPROVED");
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/pagos");
  return { ok: true };
}
