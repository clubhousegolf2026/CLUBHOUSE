import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/data/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { esBot, ipDe } from "@/lib/anti-spam";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const leadSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  telefono: z.string().trim().max(40).optional(),
  mensaje: z.string().trim().max(2000).optional(),
  fechaTentativa: z.string().date().optional(),
});

export async function POST(req: Request) {
  if (!rateLimit(`leads:${ipDe(req)}`, 5, 60)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  // A los bots se les responde "ok" sin guardar nada, para no darles pista.
  if (esBot(body)) return NextResponse.json({ ok: true });

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { nombre, email, telefono, mensaje, fechaTentativa } = parsed.data;

  const { error } = await getSupabase()
    .from("contactos")
    .insert({
      nombre,
      email,
      telefono: telefono || null,
      mensaje: mensaje || null,
      fecha_tentativa: fechaTentativa || null,
      origen: "contacto",
    });

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
