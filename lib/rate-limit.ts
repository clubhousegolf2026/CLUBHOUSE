const buckets = new Map<string, { count: number; reset: number }>();

/** Ventana fija en memoria — basta para 1 sola instancia (ver §B.3.4 del
 *  documento de arquitectura). Protege endpoints públicos de escritura
 *  como /api/leads sin necesitar Redis en Fase 1. */
export function rateLimit(key: string, limit: number, windowSec: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowSec * 1000 });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}
