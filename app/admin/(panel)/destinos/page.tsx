import Link from "next/link";
import { Plus } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";
import { getExperiencias } from "@/lib/contenido/experiencias-editables";

export const dynamic = "force-dynamic";

export default async function DestinosAdminPage() {
  const EXPERIENCIAS = await getExperiencias();
  const supabase = await createServerSupabase();
  const { data: destinos } = await supabase
    .from("destinos")
    .select("id, nombre, pais, disponible")
    .order("orden");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-carbon">Destinos</h1>
          <p className="text-sm text-niebla">
            Banderines que aparecen en el globo del inicio.
          </p>
        </div>
        <ButtonLink href="/admin/destinos/nuevo">
          <Plus size={16} /> Nuevo destino
        </ButtonLink>
      </div>

      <section>
        <h2 className="font-serif text-lg text-carbon">Experiencias firmadas</h2>
        <p className="text-sm text-niebla">
          Tailandia y Utah siempre aparecen en el globo. Puedes editar sus textos, fechas y precio.
        </p>
        <ul className="mt-3 divide-y divide-arena overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
          {EXPERIENCIAS.map((e) => (
            <li key={e.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span>
                <span className="block font-medium text-carbon">
                  <span aria-hidden>{e.bandera}</span> {e.pais}
                </span>
                <span className="text-xs text-niebla">
                  {e.nombre} · {e.subtitulo}
                </span>
              </span>
              <span className="flex items-center gap-4">
                <span className="rounded-full bg-verde-golf/10 px-2 py-0.5 text-xs font-medium text-verde-golf">
                  Disponible
                </span>
                <Link href={`/experiencias/${e.slug}`} target="_blank" className="text-niebla hover:underline">
                  Ver en el sitio
                </Link>
                <Link href={`/admin/experiencias/${e.slug}`} className="text-verde-golf hover:underline">
                  Editar
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-lg text-carbon">Otros destinos</h2>
        <p className="text-sm text-niebla">Los que agregues aquí también se marcan en el globo.</p>
      </section>

      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">País</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(destinos ?? []).map((d) => (
              <tr key={d.id} className="border-b border-arena last:border-0">
                <td className="px-4 py-3 font-medium text-carbon">{d.nombre}</td>
                <td className="px-4 py-3 text-niebla">{d.pais}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.disponible
                        ? "bg-verde-golf/10 text-verde-golf"
                        : "bg-niebla/10 text-niebla"
                    }`}
                  >
                    {d.disponible ? "Disponible" : "Próximamente"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/destinos/${d.id}`}
                    className="text-verde-golf hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(destinos ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-niebla">
                  Todavía no hay destinos. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
