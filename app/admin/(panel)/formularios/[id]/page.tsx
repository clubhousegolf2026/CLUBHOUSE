import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { configWompi } from "@/lib/wompi";
import { filaAFormulario } from "@/lib/formularios/servidor";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import { EditorFormulario } from "@/components/admin/formularios/editor-formulario";

export const dynamic = "force-dynamic";

export default async function EditarFormularioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { data } = await db.from("formularios").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  const [{ count }, { experiencias }] = await Promise.all([
    db.from("inscripciones").select("id", { count: "exact", head: true }).eq("formulario_id", id).neq("estado", "cancelada"),
    getExperienciasAdmin(db),
  ]);

  return (
    <EditorFormulario
      key={id}
      inicial={filaAFormulario(data)}
      experiencias={experiencias.map((e) => ({ slug: e.slug, nombre: e.nombre }))}
      wompiListo={configWompi().listo}
      respuestas={count ?? 0}
      origen={SITE_URL}
    />
  );
}
