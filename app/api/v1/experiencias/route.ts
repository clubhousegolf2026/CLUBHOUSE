import { NextResponse } from "next/server";
import { getExperiencias } from "@/lib/contenido/experiencias-editables";
import { experienciaApi } from "./_forma";
import { limitar } from "../_comun";

export const dynamic = "force-dynamic";

/** Catálogo público: las experiencias publicadas. No requiere clave. */
export async function GET(req: Request) {
  const bloqueo = limitar(req);
  if (bloqueo) return bloqueo;
  const lista = await getExperiencias();
  return NextResponse.json(
    { datos: lista.map(experienciaApi), total: lista.length },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
