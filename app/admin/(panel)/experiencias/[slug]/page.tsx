import Link from "next/link";
import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import { EXPERIENCIAS } from "@/lib/contenido/experiencias";
import { ExperienciaEditor } from "@/components/admin/experiencias/editor";

export const dynamic = "force-dynamic";

export default async function EditarExperienciaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { experiencias, enBase } = await getExperienciasAdmin(db);
  const e = experiencias.find((x) => x.slug === slug);
  if (!e) notFound();

  const ciudades = experiencias
    .filter((x) => x.slug !== slug)
    .map((x) => ({ id: x.slug, nombre: x.pais || x.nombre, lat: x.coordenadas[1], lng: x.coordenadas[0] }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/experiencias" className="text-sm text-niebla hover:text-carbon">← Todas las experiencias</Link>
        <h1 className="mt-2 font-serif text-2xl text-carbon">
          <span aria-hidden>{e.bandera}</span> {e.nombre}
        </h1>
        <p className="text-sm text-niebla">Todo lo que guardes aquí queda en Supabase y se actualiza en el sitio.</p>
      </div>
      <ExperienciaEditor
        key={e.slug}
        inicial={e}
        esNueva={false}
        enBase={enBase.has(e.slug)}
        esDelCodigo={EXPERIENCIAS.some((x) => x.slug === e.slug)}
        ciudades={ciudades}
      />
    </div>
  );
}
