import Link from "next/link";
import { Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import { ImportarExperiencias } from "@/components/admin/experiencias/importar";
import { ListaExperiencias } from "@/components/admin/experiencias/lista-experiencias";
import { LimpiarDemo } from "@/components/admin/limpiar-demo";
import { contarDatosDemo } from "@/app/admin/(panel)/paquetes/demo-actions";

export const dynamic = "force-dynamic";

export default async function ExperienciasAdminPage() {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { experiencias, enBase } = await getExperienciasAdmin(db);
  const conteosDemo = await contarDatosDemo();
  const soloCodigo = experiencias.filter((e) => !enBase.has(e.slug)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-carbon">Experiencias</h1>
          <p className="text-sm text-niebla">
            Los viajes que vende la agencia: fechas, tarifas, programa, campos, fotos y políticas.
          </p>
        </div>
        <Link
          href="/admin/experiencias/nueva"
          className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-3 text-sm font-semibold text-crema hover:bg-verde-calle"
        >
          <Plus size={16} /> Nueva experiencia
        </Link>
      </div>

      <LimpiarDemo conteos={conteosDemo} />

      {soloCodigo > 0 && <ImportarExperiencias pendientes={soloCodigo} />}

      <ListaExperiencias
        items={experiencias.map((e) => ({
          slug: e.slug,
          nombre: e.nombre,
          pais: e.pais,
          bandera: e.bandera,
          fechas: e.fechas,
          duracion: e.duracion,
          desde: e.desde,
          foto: e.foto,
          fotoAlt: e.fotoAlt,
          publicada: e.publicada !== false,
          destacada: Boolean(e.destacada),
          enBase: enBase.has(e.slug),
          salidas: (e.salidas ?? []).length,
        }))}
      />
    </div>
  );
}
