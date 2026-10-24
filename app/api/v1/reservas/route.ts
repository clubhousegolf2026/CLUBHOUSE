import { NextResponse } from "next/server";
import { autenticar, errorApi } from "@/lib/api/claves";
import { createServiceClient } from "@/lib/supabase/service";
import { ESTADOS_PAGO, limitar, paginacion } from "../_comun";
import { reservaApi, SELECT_RESERVA, type FilaReserva } from "./_forma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const bloqueo = limitar(req) ?? (await autenticar(req, "reservas:read"));
  if (bloqueo) return bloqueo;

  const url = new URL(req.url);
  const { limite, desplazamiento } = paginacion(url);
  const estado = url.searchParams.get("estado_pago");
  if (estado && !(ESTADOS_PAGO as readonly string[]).includes(estado)) {
    return errorApi(400, "estado_invalido", `El estado de pago debe ser uno de: ${ESTADOS_PAGO.join(", ")}.`);
  }

  let consulta = createServiceClient()!
    .from("reservas")
    .select(SELECT_RESERVA, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(desplazamiento, desplazamiento + limite - 1);
  if (estado) consulta = consulta.eq("estado_pago", estado as (typeof ESTADOS_PAGO)[number]);

  const { data, count, error } = await consulta;
  if (error) return errorApi(500, "error_interno", "No se pudieron consultar las reservas.");
  return NextResponse.json({
    datos: ((data ?? []) as unknown as FilaReserva[]).map(reservaApi),
    total: count ?? 0,
    limite,
    desplazamiento,
  });
}
