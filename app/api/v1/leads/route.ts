import { NextResponse } from "next/server";
import { z } from "zod";
import { autenticar, errorApi } from "@/lib/api/claves";
import { programarEvento } from "@/lib/api/webhooks";
import { createServiceClient } from "@/lib/supabase/service";
import { ESTADOS_LEAD, leadApi, limitar, paginacion } from "../_comun";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const bloqueo = limitar(req) ?? (await autenticar(req, "leads:read"));
  if (bloqueo) return bloqueo;
  const db = createServiceClient()!;

  const url = new URL(req.url);
  const { limite, desplazamiento } = paginacion(url);
  const estado = url.searchParams.get("estado");
  const q = url.searchParams.get("q")?.trim();
  if (estado && !(ESTADOS_LEAD as readonly string[]).includes(estado)) {
    return errorApi(400, "estado_invalido", `El estado debe ser uno de: ${ESTADOS_LEAD.join(", ")}.`);
  }

  let consulta = db
    .from("contactos")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(desplazamiento, desplazamiento + limite - 1);
  if (estado) consulta = consulta.eq("estado", estado as (typeof ESTADOS_LEAD)[number]);
  if (q) {
    const limpio = q.replace(/[%,()]/g, " ");
    consulta = consulta.or(`nombre.ilike.%${limpio}%,email.ilike.%${limpio}%`);
  }

  const { data, count, error } = await consulta;
  if (error) return errorApi(500, "error_interno", "No se pudieron consultar los leads.");
  return NextResponse.json({ datos: (data ?? []).map(leadApi), total: count ?? 0, limite, desplazamiento });
}

const crearSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  telefono: z.string().trim().max(40).nullish(),
  mensaje: z.string().trim().max(2000).nullish(),
  fecha_tentativa: z.string().date().nullish(),
  valor_estimado_cop: z.number().int().min(0).nullish(),
  notas: z.string().trim().max(4000).nullish(),
  etiquetas: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});

export async function POST(req: Request) {
  const bloqueo = limitar(req) ?? (await autenticar(req, "leads:write"));
  if (bloqueo) return bloqueo;
  const db = createServiceClient()!;

  const parsed = crearSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return errorApi(400, "datos_invalidos", parsed.error.issues.map((i) => `${i.path.join(".") || "cuerpo"}: ${i.message}`).join("; "));
  }
  const d = parsed.data;

  const { data, error } = await db
    .from("contactos")
    .insert({
      nombre: d.nombre,
      email: d.email,
      telefono: d.telefono ?? null,
      mensaje: d.mensaje ?? null,
      fecha_tentativa: d.fecha_tentativa ?? null,
      valor_estimado_cop: d.valor_estimado_cop ?? null,
      notas: d.notas ?? null,
      ...(d.etiquetas ? { etiquetas: d.etiquetas } : {}),
      origen: "contacto",
    })
    .select("*")
    .single();
  if (error || !data) return errorApi(500, "error_interno", "No se pudo crear el lead.");

  const lead = leadApi(data);
  programarEvento("lead.creado", lead);
  return NextResponse.json(lead, { status: 201 });
}
