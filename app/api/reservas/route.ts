import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { calcularCotizacion } from "@/lib/pricing/engine";
import { seleccionSchema } from "@/lib/pricing/types";
import { getTarifas } from "@/lib/data";
import { getSupabase } from "@/lib/data/supabase";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Porcentaje de anticipo para pasar de cotización a reserva — mismo valor
// que ya se muestra en la UI de /cotizador/resumen ("Reservar con 30%").
const PORCENTAJE_ANTICIPO = 0.3;

const bodySchema = z.object({
  tipo: z.enum(["cotizacion", "reserva"]),
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  telefono: z.string().trim().max(40).optional(),
  seleccion: seleccionSchema,
  // Presente solo cuando la reserva nace de un paquete predefinido (no de
  // un itinerario armado a mano) — cada paquete es su propio "universo":
  // su propio calendario y su propio libro de ventas.
  paqueteId: z.string().trim().min(1).optional(),
});

/**
 * Convierte una selección del cotizador en un registro real: valida contra
 * el precio recalculado en el servidor (nunca confía en el total que
 * mande el cliente), crea el contacto y la cotización, y si el tipo es
 * "reserva" también la fila de reserva con su anticipo del 30%.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`reservas:${ip}`, 5, 60)) {
    return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { tipo, nombre, email, telefono, seleccion, paqueteId } = parsed.data;

  const tarifas = await getTarifas();
  const catalogo = new Map(tarifas.map((t) => [t.codigo, t]));
  const cotizacionCalculada = calcularCotizacion(seleccion, catalogo);

  if (cotizacionCalculada.lineas.length === 0 || cotizacionCalculada.total <= 0) {
    return NextResponse.json(
      { error: "El itinerario está vacío, no hay nada que reservar." },
      { status: 400 },
    );
  }

  const supabase = getSupabase();

  // El rol anónimo puede INSERTAR en estas tablas pero no LEERLAS (RLS las
  // protege por ser datos de personas reales) — por eso los ids se generan
  // aquí mismo en vez de pedirlos de vuelta con `.select()`, que fallaría
  // al no poder hacer el SELECT posterior al insert.
  const contactoId = randomUUID();
  const cotizacionId = randomUUID();

  const { error: errorContacto } = await supabase.from("contactos").insert({
    id: contactoId,
    nombre,
    email,
    telefono: telefono || null,
    origen: "cotizador",
  });
  if (errorContacto) {
    return NextResponse.json({ error: "No se pudo guardar el contacto" }, { status: 502 });
  }

  const { error: errorCotizacion } = await supabase.from("cotizaciones").insert({
    id: cotizacionId,
    contacto_id: contactoId,
    paquete_id: paqueteId ?? null,
    tipo,
    seleccion: JSON.parse(JSON.stringify(seleccion)),
    lineas: JSON.parse(JSON.stringify(cotizacionCalculada.lineas)),
    subtotal: cotizacionCalculada.subtotal,
    impuestos: cotizacionCalculada.impuestos,
    total: cotizacionCalculada.total,
    por_persona: cotizacionCalculada.porPersona,
  });
  if (errorCotizacion) {
    return NextResponse.json({ error: "No se pudo guardar la cotización" }, { status: 502 });
  }

  let reservaId: string | null = null;
  if (tipo === "reserva") {
    reservaId = randomUUID();
    const montoDeposito = Math.round(cotizacionCalculada.total * PORCENTAJE_ANTICIPO);
    const { error: errorReserva } = await supabase.from("reservas").insert({
      id: reservaId,
      cotizacion_id: cotizacionId,
      monto_deposito_cop: montoDeposito,
    });
    if (errorReserva) {
      return NextResponse.json({ error: "No se pudo guardar la reserva" }, { status: 502 });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      contactoId,
      cotizacionId,
      reservaId,
      cotizacion: cotizacionCalculada,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
