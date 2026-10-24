import Link from "next/link";
import { Plus } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { cop } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { getExperiencias } from "@/lib/contenido/experiencias-editables";
import { LimpiarDemo } from "@/components/admin/limpiar-demo";
import { contarDatosDemo } from "./demo-actions";

export const dynamic = "force-dynamic";

export default async function PaquetesAdminPage() {
  const EXPERIENCIAS = await getExperiencias();
  const supabase = await createServerSupabase();
  const conteosDemo = await contarDatosDemo();
  const { data: paquetes } = await supabase
    .from("paquetes")
    .select("id, nombre, slug, precio_desde_cop, destacado, activo")
    .order("nombre");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-carbon">Paquetes</h1>
          <p className="text-sm text-niebla">
            Lo que se publica en el sitio.
          </p>
        </div>
        <ButtonLink href="/admin/paquetes/nuevo">
          <Plus size={16} /> Nuevo paquete
        </ButtonLink>
      </div>

      <LimpiarDemo conteos={conteosDemo} />

      <section>
        <h2 className="font-serif text-lg text-carbon">Experiencias firmadas</h2>
        <p className="text-sm text-niebla">
          Los dos viajes que hoy se muestran en el inicio, en los planes y en el globo.
          Puedes editar sus textos, fechas y precio.
        </p>
        <ul className="mt-3 divide-y divide-arena overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
          {EXPERIENCIAS.map((e) => (
            <li key={e.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span>
                <span className="block font-medium text-carbon">
                  <span aria-hidden>{e.bandera}</span> {e.nombre}
                </span>
                <span className="text-xs text-niebla">
                  {e.subtitulo} · {e.fechas} · {e.duracion}
                </span>
              </span>
              <span className="flex items-center gap-4">
                <span className="tabular text-sm text-carbon">Desde {e.desde}</span>
                <Etiqueta tono="verde">Publicado</Etiqueta>
                <Link
                  href={`/experiencias/${e.slug}`}
                  target="_blank"
                  className="text-niebla hover:underline"
                >
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
        <h2 className="font-serif text-lg text-carbon">Paquetes en la base de datos</h2>
      </section>

      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Desde</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(paquetes ?? []).map((p) => (
              <tr key={p.id} className="border-b border-arena last:border-0">
                <td className="px-4 py-3">
                  <span className="block font-medium text-carbon">{p.nombre}</span>
                  <span className="text-xs text-niebla">/{p.slug}</span>
                </td>
                <td className="px-4 py-3 tabular">{cop(p.precio_desde_cop)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {p.destacado && <Etiqueta>Destacado</Etiqueta>}
                    <Etiqueta tono={p.activo ? "verde" : "gris"}>
                      {p.activo ? "Publicado" : "Oculto"}
                    </Etiqueta>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/paquetes/${p.id}`}
                    className="text-verde-golf hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(paquetes ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-niebla">
                  Todavía no hay paquetes. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Etiqueta({
  children,
  tono = "champagne",
}: {
  children: React.ReactNode;
  tono?: "champagne" | "verde" | "gris";
}) {
  const estilos = {
    champagne: "bg-champagne/15 text-[#8a6d1f]",
    verde: "bg-verde-golf/10 text-verde-golf",
    gris: "bg-niebla/10 text-niebla",
  } as const;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${estilos[tono]}`}
    >
      {children}
    </span>
  );
}
