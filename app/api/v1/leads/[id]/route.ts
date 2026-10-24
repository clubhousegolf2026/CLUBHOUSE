import { NextResponse } from "next/server";
import { z } from "zod";
import { autenticar, errorApi } from "@/lib/api/claves";
import { programarEvento } from "@/lib/api/webhooks";
import { createServiceClient } from "@/lib/supabase/service";
import { ESTADOS_LEAD, esUuid, leadApi, limitar } from "../../_comun";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const bloqueo = limitar(req) ?? (await autenticar(req, "leads:read"));
  if (bloqueo) return bloqueo;
  const { id } = await params;
  if (!esUuid(id)) return errorApi(400, "id_invalido", "El id debe ser un UUID.");

  const { data } = await createServiceClient()!.from("contactos").select("*").eq("id", id).maybeSingle();
  if (!data) return errorApi(404, "no_encontrado", "No existe un lead con ese id.");
  return NextResponse.json(leadApi(data));
}

const editarSchema = z
  .object({
    nombre: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(160),
    telefono: z.string().trim().max(40).nullable(),
    notas: z.string().trim().max(4000).nullable(),
    estado: z.enum(ESTADOS_LEAD),
    valor_estimado_cop: z.number().int().min(0).nullable(),
    proxima_accion: z.string().trim().max(300).nullable(),
    proxima_fecha: z.string().date().nullable(),
    etiquetas: z.array(z.string().trim().min(1).max(40)).max(20),
  })
  .partial();

export async function PATCH(req: Request, { params }: Ctx) {
  const bloqueo = limitar(req) ?? (await autenticar(req, "leads:write"));
  if (bloqueo) return bloqueo;
  const { id } = await params;
  if (!esUuid(id)) return errorApi(400, "id_invalido", "El id debe ser un UUID.");

  const parsed = editarSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return errorApi(400, "datos_invalidos", parsed.error.issues.map((i) => `${i.path.join(".") || "cuerpo"}: ${i.message}`).join("; "));
  }
  if (Object.keys(parsed.data).length === 0) return errorApi(400, "sin_cambios", "Envía al menos un campo para actualizar.");

  const db = createServiceClient()!;
  const { data: antes } = await db.from("contactos").select("estado").eq("id", id).maybeSingle();
  if (!antes) return errorApi(404, "no_encontrado", "No existe un lead con ese id.");

  const { data, error } = await db.from("contactos").update(parsed.data).eq("id", id).select("*").single();
  if (error || !data) return errorApi(500, "error_interno", "No se pudo actualizar el lead.");

  const lead = leadApi(data);
  if (parsed.data.estado && parsed.data.estado !== antes.estado) {
    programarEvento("lead.etapa_cambiada", { lead, etapa_anterior: antes.estado, etapa_nueva: parsed.data.estado });
  }
  return NextResponse.json(lead);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const bloqueo = limitar(req) ?? (await autenticar(req, "leads:write"));
  if (bloqueo) return bloqueo;
  const { id } = await params;
  if (!esUuid(id)) return errorApi(400, "id_invalido", "El id debe ser un UUID.");

  const { data, error } = await createServiceClient()!.from("contactos").delete().eq("id", id).select("id");
  if (error) return errorApi(500, "error_interno", "No se pudo eliminar el lead.");
  if (!data || data.length === 0) return errorApi(404, "no_encontrado", "No existe un lead con ese id.");
  return new NextResponse(null, { status: 204 });
}
