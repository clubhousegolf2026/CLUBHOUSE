import { NextResponse } from "next/server";
import { especificacionOpenApi } from "@/lib/api/openapi";

export const dynamic = "force-static";

/** La especificación OpenAPI es pública: sirve para importarla en Postman,
 *  Insomnia, n8n o para generar un cliente. */
export function GET(req: Request) {
  const origen = new URL(req.url).origin;
  return NextResponse.json(especificacionOpenApi(origen), {
    headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" },
  });
}
