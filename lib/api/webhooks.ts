import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import type { EventoId } from "./catalogo";

export { EVENTOS, type EventoId } from "./catalogo";

export function generarSecreto(): string {
  return `whsec_${randomBytes(24).toString("base64url")}`;
}

export type Entrega = { ok: boolean; status: number | null; error: string | null; ms: number };

/** Firma estilo Stripe: `t=<unix>,v1=<hmac_sha256(secreto, "<t>.<cuerpo>")>`. */
export function firmar(secreto: string, cuerpo: string, t: number): string {
  const v1 = createHmac("sha256", secreto).update(`${t}.${cuerpo}`).digest("hex");
  return `t=${t},v1=${v1}`;
}

type Destino = { id: string; url: string; secreto: string };

/** Envía un evento a un destino y deja el resultado en la bitácora. */
export async function enviarEntrega(
  db: SupabaseClient,
  destino: Destino,
  evento: string,
  datos: unknown,
): Promise<Entrega> {
  const cuerpo = JSON.stringify({ id: randomUUID(), evento, creado: new Date().toISOString(), datos });
  const t = Math.floor(Date.now() / 1000);
  const inicio = Date.now();
  let resultado: Entrega;

  try {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), 8000);
    const res = await fetch(destino.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Clubhouse-Webhooks/1.0",
        "X-Clubhouse-Event": evento,
        "X-Clubhouse-Signature": firmar(destino.secreto, cuerpo, t),
      },
      body: cuerpo,
      signal: control.signal,
    });
    clearTimeout(temporizador);
    resultado = {
      ok: res.ok,
      status: res.status,
      error: res.ok ? null : `El destino respondió ${res.status}`,
      ms: Date.now() - inicio,
    };
  } catch (e) {
    resultado = {
      ok: false,
      status: null,
      error: e instanceof Error && e.name === "AbortError" ? "Tiempo de espera agotado (8 s)" : e instanceof Error ? e.message : "Error de red",
      ms: Date.now() - inicio,
    };
  }

  await db.from("webhook_entregas").insert({
    webhook_id: destino.id,
    evento,
    payload: JSON.parse(cuerpo),
    http_estado: resultado.status,
    ok: resultado.ok,
    error: resultado.error,
    duracion_ms: resultado.ms,
  });
  return resultado;
}

/** Avisa a todos los webhooks activos suscritos a este evento. Nunca lanza
 *  errores: un destino caído no debe romper la operación que lo originó. */
export async function emitirEvento(
  evento: EventoId,
  datos: unknown,
  clienteSesion?: SupabaseClient,
): Promise<void> {
  try {
    const db = createServiceClient() ?? clienteSesion;
    if (!db) return;
    const { data } = await db
      .from("webhooks")
      .select("id, url, secreto")
      .eq("activo", true)
      .contains("eventos", [evento]);
    if (!data || data.length === 0) return;
    await Promise.allSettled(data.map((d: Destino) => enviarEntrega(db, d, evento, datos)));
  } catch {
    // Silencioso a propósito.
  }
}

/** Programa el envío para después de responder al usuario. */
export function programarEvento(evento: EventoId, datos: unknown, clienteSesion?: SupabaseClient): void {
  try {
    after(() => emitirEvento(evento, datos, clienteSesion));
  } catch {
    void emitirEvento(evento, datos, clienteSesion);
  }
}
