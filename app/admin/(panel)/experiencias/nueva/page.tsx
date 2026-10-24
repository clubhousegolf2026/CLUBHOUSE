import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getExperienciasAdmin, normalizar } from "@/lib/contenido/experiencias-editables";
import { ExperienciaEditor } from "@/components/admin/experiencias/editor";

export const dynamic = "force-dynamic";

export default async function NuevaExperienciaPage() {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { experiencias } = await getExperienciasAdmin(db);
  const ciudades = experiencias.map((x) => ({
    id: x.slug,
    nombre: x.pais || x.nombre,
    lat: x.coordenadas[1],
    lng: x.coordenadas[0],
  }));

  const vacia = normalizar({
    slug: "",
    nombre: "",
    coordenadas: [-74.07, 4.71],
    publicada: false,
    orden: experiencias.length,
    incluye: [""],
    noIncluye: [""],
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/experiencias" className="text-sm text-niebla hover:text-carbon">← Todas las experiencias</Link>
        <h1 className="mt-2 font-serif text-2xl text-carbon">Nueva experiencia</h1>
        <p className="text-sm text-niebla">Se crea como borrador: publícala cuando esté lista.</p>
      </div>
      <ExperienciaEditor inicial={vacia} esNueva enBase={false} esDelCodigo={false} ciudades={ciudades} costosIniciales={{ costeos: [] }} />
    </div>
  );
}
