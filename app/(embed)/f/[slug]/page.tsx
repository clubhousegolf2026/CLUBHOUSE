import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/data/supabase";
import { leerFormularioPublico } from "@/lib/formularios/servidor";
import { FormularioPublico } from "@/components/formularios/formulario-publico";

export const dynamic = "force-dynamic";

async function cargar(slug: string) {
  try {
    return await leerFormularioPublico(getSupabase() as unknown as SupabaseClient, slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await cargar(slug);
  return { title: f?.config.titulo ?? "Inscripción" };
}

export default async function FormularioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await cargar(slug);
  if (!f) notFound();
  const cerrado = Boolean(f.config.cierre && new Date().toISOString().slice(0, 10) > f.config.cierre);
  return <FormularioPublico formulario={f} cerrado={cerrado} />;
}
