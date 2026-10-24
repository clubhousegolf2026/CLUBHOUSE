"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function marcarReservaPagada(reservaId: string, pagada: boolean) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("marcar_reserva_pagada", {
    p_reserva: reservaId,
    p_pagada: pagada,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservaId}`);
}

type Res = { ok: true } | { ok: false; error: string };

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
