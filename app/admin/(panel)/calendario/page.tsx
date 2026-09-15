import { createServerSupabase } from "@/lib/supabase/server";
import { BloqueoForm } from "@/components/admin/bloqueo-form";
import { EliminarBloqueoButton } from "@/components/admin/eliminar-bloqueo-button";
import { fechaCo } from "@/lib/format";

export const dynamic = "force-dynamic";

const ETIQUETA_TIPO: Record<string, { texto: string; tono: string }> = {
  bloqueo: { texto: "Bloqueo", tono: "bg-error/10 text-error" },
  temporada_alta: { texto: "Temporada alta", tono: "bg-champagne/15 text-[#8a6d1f]" },
  cupo: { texto: "Cupo limitado", tono: "bg-verde-golf/10 text-verde-golf" },
};

export default async function CalendarioAdminPage() {
  const supabase = await createServerSupabase();
  const { data: bloqueos } = await supabase
    .from("bloqueos_calendario")
    .select("*")
    .order("fecha_inicio");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-carbon">Calendario</h1>
        <p className="text-sm text-niebla">
          Fechas bloqueadas, con cupo limitado o de temporada alta — controla lo
          que ve el cotizador en el paso de fechas.
        </p>
      </div>

      <BloqueoForm />

      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
              <th className="px-4 py-3">Rango</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Nota</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(bloqueos ?? []).map((b) => {
              const et = ETIQUETA_TIPO[b.tipo];
              return (
                <tr key={b.id} className="border-b border-arena last:border-0">
                  <td className="px-4 py-3">
                    {fechaCo(b.fecha_inicio)} — {fechaCo(b.fecha_fin)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${et.tono}`}>
                      {et.texto}
                      {b.factor_precio ? ` (+${Math.round((b.factor_precio - 1) * 100)}%)` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-niebla">{b.nota ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <EliminarBloqueoButton id={b.id} />
                  </td>
                </tr>
              );
            })}
            {(bloqueos ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-niebla">
                  No hay rangos configurados — el calendario está abierto todos los días.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
