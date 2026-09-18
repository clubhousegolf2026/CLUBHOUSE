import { NextResponse } from "next/server";
import { calcularCotizacion } from "@/lib/pricing/engine";
import { seleccionSchema } from "@/lib/pricing/types";
import { getTarifas } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";
import { ipDe } from "@/lib/anti-spam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Fuente de verdad server-side del precio.
 * Fase 1 (hoy): lee tarifas mock vía getTarifas().
 * Producción: getTarifas() consulta Supabase; este handler no cambia.
 */
export async function POST(req: Request) {
  if (!rateLimit(`cotizacion:${ipDe(req)}`, 120, 60)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = seleccionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const tarifas = await getTarifas();
  const catalogo = new Map(tarifas.map((t) => [t.codigo, t]));

  return NextResponse.json(calcularCotizacion(parsed.data, catalogo), {
    headers: { "Cache-Control": "no-store" },
  });
}
