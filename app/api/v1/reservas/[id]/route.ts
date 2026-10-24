import { NextResponse } from "next/server";
import { autenticar, errorApi } from "@/lib/api/claves";
import { createServiceClient } from "@/lib/supabase/service";
import { esUuid, limitar } from "../../_comun";
import { reservaApi, SELECT_RESERVA, type FilaReserva } from "../_forma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const bloqueo = limitar(req) ?? (await autenticar(req, "reservas:read"));
  if (bloqueo) return bloqueo;
  const { id } = await params;
  if (!esUuid(id)) return errorApi(400, "id_invalido", "El id debe ser un UUID.");

  const { data } = await createServiceClient()!.from("reservas").select(SELECT_RESERVA).eq("id", id).maybeSingle();
  if (!data) return errorApi(404, "no_encontrado", "No existe una reserva con ese id.");
  return NextResponse.json(reservaApi(data as unknown as FilaReserva));
}
