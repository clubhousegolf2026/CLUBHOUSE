import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import { filaAFormulario } from "@/lib/formularios/servidor";
import { ListaFormularios, type ItemFormulario } from "@/components/admin/formularios/lista-formularios";

export const dynamic = "force-dynamic";

export default async function FormulariosPage() {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const [formularios, inscripciones] = await Promise.all([
    db.from("formularios").select("*").order("created_at", { ascending: false }),
    db.from("inscripciones").select("formulario_id, estado"),
  ]);

  const migracionPendiente = Boolean(formularios.error && ["42P01", "PGRST205"].includes(formularios.error.code ?? ""));
  const filas = formularios.error ? [] : formularios.data ?? [];
  const resp = (inscripciones.error ? [] : inscripciones.data ?? []) as { formulario_id: string; estado: string }[];

  const items: ItemFormulario[] = filas.map((raw) => {
    const f = filaAFormulario(raw);
    const mias = resp.filter((r) => r.formulario_id === f.id);
    return {
      id: f.id,
      slug: f.slug,
      nombre: f.nombre,
      plantilla: f.plantilla,
      publicado: f.publicado,
      acento: f.config.diseno.acento,
      respuestas: mias.filter((r) => r.estado !== "cancelada").length,
      pagadas: mias.filter((r) => r.estado === "pagada").length,
      cobra: f.config.pago.activo,
      updated_at: f.updated_at,
    };
  });

  return <ListaFormularios items={items} origen={SITE_URL} migracionPendiente={migracionPendiente} />;
}
