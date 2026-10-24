"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { programarEvento } from "@/lib/api/webhooks";
import { reservaApi, SELECT_RESERVA, type FilaReserva } from "@/app/api/v1/reservas/_forma";

export async function marcarReservaPagada(reservaId: string, pagada: boolean) {
  const supabase = await createServerSupabase();
  const db = supabase as unknown as SupabaseClient;
  const antes = await estadoPagoActual(db, reservaId);
  const { error } = await supabase.rpc("marcar_reserva_pagada", {
    p_reserva: reservaId,
    p_pagada: pagada,
  });
  if (error) throw new Error(error.message);
  await avisarPago(db, reservaId, antes);

  revalidatePath("/admin");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservaId}`);
}

type Res = { ok: true } | { ok: false; error: string };

async function reservaParaEvento(db: SupabaseClient, id: string) {
  const { data } = await db.from("reservas").select(SELECT_RESERVA).eq("id", id).maybeSingle();
  return data ? reservaApi(data as unknown as FilaReserva) : null;
}

/** Avisa a los webhooks si el estado de pago cambió. */
async function avisarPago(db: SupabaseClient, id: string, anterior: string | undefined) {
  const r = await reservaParaEvento(db, id);
  if (r && anterior && r.estado_pago !== anterior) {
    programarEvento("reserva.pago_cambiado", { ...r, estado_pago_anterior: anterior }, db);
  }
}

async function estadoPagoActual(db: SupabaseClient, id: string): Promise<string | undefined> {
  const { data } = await db.from("reservas").select("estado_pago").eq("id", id).maybeSingle();
  return data?.estado_pago as string | undefined;
}

export async function crearReserva(d: {
  contactoId: string;
  concepto: string;
  totalCop: number;
  anticipoCop: number;
  personas: number;
}): Promise<({ ok: true; id: string }) | { ok: false; error: string }> {
  if (!d.contactoId) return { ok: false, error: "Elige el cliente." };
  if (!d.concepto.trim()) return { ok: false, error: "Escribe qué se reservó." };
  if (!(d.totalCop > 0)) return { ok: false, error: "El total debe ser mayor a cero." };
  if (d.anticipoCop < 0 || d.anticipoCop > d.totalCop) return { ok: false, error: "El anticipo no puede ser mayor al total." };
  const personas = Math.max(1, Math.round(d.personas || 1));

  const supabase = await createServerSupabase();
  const { data: cot, error: e1 } = await supabase
    .from("cotizaciones")
    .insert({
      contacto_id: d.contactoId,
      tipo: "reserva",
      lineas: [
        { concepto: d.concepto.trim(), detalle: `${personas} persona(s) · reserva registrada por el equipo`, cantidad: 1, precioUnitario: d.totalCop, subtotal: d.totalCop },
      ],
      seleccion: { manual: true, numPax: personas },
      subtotal: d.totalCop,
      impuestos: 0,
      total: d.totalCop,
      por_persona: Math.round(d.totalCop / personas),
    })
    .select("id")
    .single();
  if (e1) return { ok: false, error: e1.message };

  const { data: res, error: e2 } = await supabase
    .from("reservas")
    .insert({ cotizacion_id: cot.id, monto_deposito_cop: d.anticipoCop })
    .select("id")
    .single();
  if (e2) {
    await supabase.from("cotizaciones").delete().eq("id", cot.id);
    return { ok: false, error: e2.message };
  }

  const nueva = await reservaParaEvento(supabase as unknown as SupabaseClient, res.id);
  if (nueva) programarEvento("reserva.creada", nueva, supabase as unknown as SupabaseClient);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  return { ok: true, id: res.id };
}

export async function actualizarReserva(
  id: string,
  d: {
    estadoPago: "pendiente" | "pagado" | "fallido" | "reembolsado";
    anticipoCop: number;
    pasarela: string;
    referencia: string;
  },
): Promise<Res> {
  const supabase = await createServerSupabase();
  const antes = await estadoPagoActual(supabase as unknown as SupabaseClient, id);
  const { error } = await supabase
    .from("reservas")
    .update({
      monto_deposito_cop: d.anticipoCop,
      pasarela: d.pasarela.trim() || null,
      referencia_pago: d.referencia.trim() || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Pagado / fallido pasan por la función que además avanza al lead en el CRM.
  if (d.estadoPago === "pagado" || d.estadoPago === "fallido") {
    const r = await supabase.rpc("marcar_reserva_pagada", { p_reserva: id, p_pagada: d.estadoPago === "pagado" });
    if (r.error) return { ok: false, error: r.error.message };
  } else {
    const r = await supabase.from("reservas").update({ estado_pago: d.estadoPago }).eq("id", id);
    if (r.error) return { ok: false, error: r.error.message };
  }
  await avisarPago(supabase as unknown as SupabaseClient, id, antes);

  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function eliminarReserva(id: string): Promise<Res> {
  const supabase = await createServerSupabase();
  const { data: r } = await supabase.from("reservas").select("cotizacion_id").eq("id", id).maybeSingle();
  const { error } = await supabase.from("reservas").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  // La cotización de tipo "reserva" no tiene sentido sin su reserva.
  if (r?.cotizacion_id) {
    await supabase.from("cotizaciones").delete().eq("id", r.cotizacion_id).eq("tipo", "reserva");
  }
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  return { ok: true };
}

/** Cambia solo el estado de pago (tablero Kanban). Pagado y fallido pasan por
 *  la función que además avanza al lead en el CRM. */
export async function moverReserva(
  id: string,
  estado: "pendiente" | "pagado" | "fallido" | "reembolsado",
): Promise<Res> {
  const supabase = await createServerSupabase();
  const antes = await estadoPagoActual(supabase as unknown as SupabaseClient, id);
  if (estado === "pagado" || estado === "fallido") {
    const r = await supabase.rpc("marcar_reserva_pagada", { p_reserva: id, p_pagada: estado === "pagado" });
    if (r.error) return { ok: false, error: r.error.message };
  } else {
    const r = await supabase.from("reservas").update({ estado_pago: estado }).eq("id", id);
    if (r.error) return { ok: false, error: r.error.message };
  }
  await avisarPago(supabase as unknown as SupabaseClient, id, antes);
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
  revalidatePath("/admin/crm");
  return { ok: true };
}
