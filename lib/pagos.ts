import type { SupabaseClient } from "@supabase/supabase-js";
import { programarEvento } from "@/lib/api/webhooks";
import type { Transaccion } from "@/lib/wompi";

/** Aplica el resultado de una transacción de Wompi: actualiza el pago y, si se
 *  aprobó, la inscripción o la reserva de la que viene. Es idempotente: el
 *  evento «pago.aprobado» solo se emite la primera vez que pasa a aprobado. */
export async function aplicarTransaccion(db: SupabaseClient, tx: Transaccion): Promise<"actualizado" | "sin_pago"> {
  const { data: pago } = await db
    .from("pagos")
    .select("id, estado, origen, origen_id, monto_cop, concepto")
    .eq("referencia", tx.reference)
    .maybeSingle();
  if (!pago) return "sin_pago";

  const yaAprobado = pago.estado === "APPROVED";
  const nuevo = yaAprobado ? "APPROVED" : tx.status;

  await db
    .from("pagos")
    .update({
      estado: nuevo,
      wompi_id: tx.id,
      metodo: tx.payment_method_type ?? null,
      payload: tx,
      ...(nuevo === "APPROVED" && !yaAprobado ? { pagado_at: new Date().toISOString() } : {}),
    })
    .eq("id", pago.id);

  if (nuevo === "APPROVED" && !yaAprobado) {
    if (pago.origen === "inscripcion" && pago.origen_id) {
      await db.from("inscripciones").update({ estado: "pagada" }).eq("id", pago.origen_id);
    }
    if (pago.origen === "reserva" && pago.origen_id) {
      await db
        .from("reservas")
        .update({ estado_pago: "pagado", pasarela: "wompi", referencia_pago: tx.reference, confirmada_at: new Date().toISOString() })
        .eq("id", pago.origen_id);
    }
    programarEvento("pago.aprobado", {
      referencia: tx.reference,
      monto_cop: pago.monto_cop,
      concepto: pago.concepto,
      metodo: tx.payment_method_type ?? null,
      wompi_id: tx.id,
      origen: pago.origen,
    });
  }
  return "actualizado";
}
