import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { PREFIJO_CLAVE, type Scope } from "./catalogo";

export { SCOPES, PREFIJO_CLAVE, type Scope } from "./catalogo";

export function hashClave(clave: string): string {
  return createHash("sha256").update(clave).digest("hex");
}

/** Clave nueva: ch_live_ + 40 caracteres aleatorios. */
export function generarClave(): { clave: string; prefijo: string; hash: string } {
  const aleatorio = randomBytes(30).toString("base64url").slice(0, 40);
  const clave = `${PREFIJO_CLAVE}${aleatorio}`;
  return { clave, prefijo: clave.slice(0, PREFIJO_CLAVE.length + 6), hash: hashClave(clave) };
}

export function errorApi(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Valida el encabezado `Authorization: Bearer ch_live_…` y el permiso pedido.
 *  Devuelve null si todo está bien, o la respuesta de error para devolver tal cual. */
export async function autenticar(req: Request, scope: Scope): Promise<NextResponse | null> {
  const db = createServiceClient();
  if (!db) {
    return errorApi(503, "api_no_configurada", "La API no está activada en el servidor (falta SUPABASE_SERVICE_ROLE_KEY).");
  }
  const cabecera = req.headers.get("authorization") ?? "";
  const clave = cabecera.startsWith("Bearer ") ? cabecera.slice(7).trim() : "";
  if (!clave.startsWith(PREFIJO_CLAVE)) {
    return errorApi(401, "clave_requerida", "Envía tu clave en el encabezado Authorization: Bearer ch_live_…");
  }

  const { data } = await db
    .from("api_keys")
    .select("id, scopes, activa, revocada_at")
    .eq("hash", hashClave(clave))
    .maybeSingle();

  if (!data || !data.activa || data.revocada_at) {
    return errorApi(401, "clave_invalida", "La clave no existe o fue revocada.");
  }
  if (!(data.scopes as string[]).includes(scope)) {
    return errorApi(403, "permiso_insuficiente", `Esta clave no tiene el permiso «${scope}».`);
  }

  // No esperamos: el registro del último uso no debe demorar la respuesta.
  void db.from("api_keys").update({ ultimo_uso: new Date().toISOString() }).eq("id", data.id);
  return null;
}
