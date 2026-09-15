import Link from "next/link";
import { Plus } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { cop } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const ETIQUETA_TIPO: Record<string, string> = {
  campo_golf: "Campo de golf",
  hotel: "Hotel",
  transporte: "Transporte",
  actividad: "Actividad",
  fee_servicio: "Fee de servicio",
};

export default async function TarifasAdminPage() {
  const supabase = await createServerSupabase();
  const { data: tarifas } = await supabase
    .from("tarifas_componentes")
    .select("codigo, tipo, nombre, precio_unitario_cop, unidad, activo")
    .order("tipo")
    .order("nombre");

  const grupos = Object.entries(ETIQUETA_TIPO).map(([tipo, etiqueta]) => ({
    tipo,
    etiqueta,
    filas: (tarifas ?? []).filter((t) => t.tipo === tipo),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-carbon">Tarifas</h1>
          <p className="text-sm text-niebla">
            Campos, hoteles, transporte y actividades que alimentan el cotizador.
          </p>
        </div>
        <ButtonLink href="/admin/tarifas/nuevo">
          <Plus size={16} /> Nueva tarifa
        </ButtonLink>
      </div>

      {grupos.map(
        (g) =>
          g.filas.length > 0 && (
            <div key={g.tipo}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-niebla">
                {g.etiqueta}
              </h2>
              <div className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
                <table className="w-full text-sm">
                  <tbody>
                    {g.filas.map((t) => (
                      <tr key={t.codigo} className="border-b border-arena last:border-0">
                        <td className="px-4 py-3">
                          <span className="block font-medium text-carbon">{t.nombre}</span>
                          <span className="text-xs text-niebla">{t.codigo}</span>
                        </td>
                        <td className="px-4 py-3 tabular">{cop(t.precio_unitario_cop)}</td>
                        <td className="px-4 py-3">
                          {!t.activo && (
                            <span className="rounded-full bg-niebla/10 px-2 py-0.5 text-xs text-niebla">
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/tarifas/${t.codigo}`}
                            className="text-verde-golf hover:underline"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ),
      )}

      {(tarifas ?? []).length === 0 && (
        <p className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-8 text-center text-niebla">
          Todavía no hay tarifas cargadas.
        </p>
      )}
    </div>
  );
}
