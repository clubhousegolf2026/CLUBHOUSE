import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { configWompi } from "@/lib/wompi";
import { filaAFormulario } from "@/lib/formularios/servidor";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import { obtenerTrm } from "@/lib/trm";
import { planDeExperiencia, type ViajeTarifas } from "@/lib/precios";
import { EditorFormulario } from "@/components/admin/formularios/editor-formulario";

export const dynamic = "force-dynamic";

export default async function EditarFormularioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { data } = await db.from("formularios").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const [{ count }, { experiencias }, trm] = await Promise.all([
    db.from("inscripciones").select("id", { count: "exact", head: true }).eq("formulario_id", id).neq("estado", "cancelada"),
    getExperienciasAdmin(db),
    obtenerTrm(),
  ]);

  const viajes: ViajeTarifas[] = experiencias
    .filter((e) => e.tarifas.length > 0)
    .map((e) => ({
      slug: e.slug,
      nombre: e.nombre,
      tarifas: e.tarifas.map((t) => ({ perfil: t.perfil, detalle: t.detalle, precio: t.precio, unidad: t.unidad })),
    }));

  return (
    <EditorFormulario
      key={id}
      inicial={filaAFormulario(data)}
      experiencias={experiencias.map((e) => ({ slug: e.slug, nombre: e.nombre }))}
      wompiListo={configWompi().listo}
      respuestas={count ?? 0}
      origen={SITE_URL}
      viajes={viajes}
      planes={experiencias.map(planDeExperiencia)}
      trm={trm}
    />
  );
}
