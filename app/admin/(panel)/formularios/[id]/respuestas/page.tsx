import Link from "next/link";
import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { filaAFormulario } from "@/lib/formularios/servidor";
import { RespuestasTabla, type FilaRespuesta } from "@/components/admin/formularios/respuestas-tabla";

export const dynamic = "force-dynamic";

export default async function RespuestasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { data } = await db.from("formularios").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const f = filaAFormulario(data);

  const { data: filas } = await db
    .from("inscripciones")
    .select("id, datos, nombre, email, telefono, estado, monto_cop, pago_referencia, created_at")
    .eq("formulario_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/formularios/${id}`} className="text-sm text-niebla hover:text-carbon">← Volver al formulario</Link>
        <h1 className="mt-2 font-serif text-3xl text-carbon">Respuestas · {f.nombre}</h1>
        <p className="text-sm text-niebla">Cada respuesta también creó un lead en el CRM.</p>
      </div>
      <RespuestasTabla formularioId={id} nombreFormulario={f.nombre} campos={f.config.campos} filas={(filas ?? []) as FilaRespuesta[]} />
    </div>
  );
}
