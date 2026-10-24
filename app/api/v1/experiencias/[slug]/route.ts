import { NextResponse } from "next/server";
import { getExperiencia } from "@/lib/contenido/experiencias-editables";
import { errorApi } from "@/lib/api/claves";
import { experienciaApi } from "../_forma";
import { limitar } from "../../_comun";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const bloqueo = limitar(req);
  if (bloqueo) return bloqueo;
  const { slug } = await params;
  const e = await getExperiencia(slug);
  if (!e) return errorApi(404, "no_encontrado", "No existe una experiencia publicada con ese slug.");
  return NextResponse.json(experienciaApi(e), { headers: { "Access-Control-Allow-Origin": "*" } });
}
