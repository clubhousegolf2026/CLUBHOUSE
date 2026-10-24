import Link from "next/link";
import { Plus } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import { ImportarExperiencias } from "@/components/admin/experiencias/importar";

export const dynamic = "force-dynamic";

export default async function ExperienciasAdminPage() {
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { experiencias, enBase } = await getExperienciasAdmin(db);
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

      {soloCodigo > 0 && <ImportarExperiencias pendientes={soloCodigo} />}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {experiencias.map((e) => (
          <li key={e.slug} className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
            <div className="relative aspect-[16/9] bg-arena">
              {e.foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.foto} alt={e.fotoAlt || e.nombre} className="h-full w-full object-cover" />
              )}
              <span
                className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                  e.publicada === false ? "bg-carbon/80 text-crema" : "bg-verde-golf text-crema"
                }`}
              >
                {e.publicada === false ? "Borrador" : "Publicada"}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-carbon">
                {enBase.has(e.slug) ? "En Supabase" : "Solo en código"}
              </span>
            </div>
            <div className="space-y-1 p-4">
              <p className="text-xs text-niebla">
                <span aria-hidden>{e.bandera}</span> {e.pais}
              </p>
              <h2 className="font-serif text-lg leading-tight text-carbon">{e.nombre}</h2>
              <p className="text-sm text-niebla">
                {e.fechas || "Sin fechas"} · {e.duracion || "—"}
              </p>
              <p className="text-sm text-carbon">{e.desde ? `Desde ${e.desde}` : "Sin precio"}</p>
              <div className="flex items-center gap-4 pt-3 text-sm">
                <Link href={`/admin/experiencias/${e.slug}`} className="font-medium text-verde-golf hover:underline">
                  Editar
                </Link>
                <Link href={`/experiencias/${e.slug}`} target="_blank" className="text-niebla hover:underline">
                  Ver en el sitio
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
