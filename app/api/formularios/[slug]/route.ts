import { NextResponse } from "next/server";
import { esBot, ipDe } from "@/lib/anti-spam";
import { rateLimit } from "@/lib/rate-limit";
import { procesarInscripcion } from "@/lib/formularios/servidor";
import type { Valores } from "@/lib/formularios/esquema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!rateLimit(`formulario:${ipDe(req)}`, 8, 60)) {
    return NextResponse.json({ ok: false, error: "Demasiadas solicitudes. Espere un minuto." }, { status: 429 });
  }
  const { slug } = await params;
  const body = (await req.json().catch(() => null)) as { valores?: Valores } | null;
  // A los bots se les responde que todo salió bien, sin guardar nada.
  if (esBot(body)) return NextResponse.json({ ok: true, pago: null, exito: null });
  if (!body?.valores || typeof body.valores !== "object") {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
  }

  const r = await procesarInscripcion(slug, body.valores);
  if (!r.ok) {
    return NextResponse.json({ ok: false, error: r.error, errores: r.errores }, { status: r.status });
  }
  return NextResponse.json({ ok: true, pago: r.pago, exito: r.exito }, { headers: { "Cache-Control": "no-store" } });
}
