import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { eventoValido, type Transaccion } from "@/lib/wompi";
import { aplicarTransaccion } from "@/lib/pagos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** URL de eventos de Wompi: se configura en el panel de Wompi (Desarrolladores → URL de eventos). */
export async function POST(req: Request) {
  const evento = await req.json().catch(() => null);
  if (!evento || typeof evento !== "object") return NextResponse.json({ ok: false }, { status: 400 });

  if (!eventoValido(evento, req.headers.get("x-event-checksum"))) {
    return NextResponse.json({ ok: false, error: "Firma no válida." }, { status: 401 });
  }

  const tx = evento.data?.transaction as Transaccion | undefined;
  if (evento.event !== "transaction.updated" || !tx?.reference) return NextResponse.json({ ok: true });

  const db = createServiceClient();
  if (!db) return NextResponse.json({ ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });

  await aplicarTransaccion(db, tx);
  return NextResponse.json({ ok: true });
}
