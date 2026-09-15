import { createServerSupabase } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/admin/pipeline-board";

export const dynamic = "force-dynamic";

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createServerSupabase();

  let query = supabase
    .from("contactos")
    .select("id, nombre, email, estado, valor_estimado_cop, updated_at, origen")
    .order("updated_at", { ascending: false });

  if (q) {
    query = query.or(`nombre.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: contactos } = await query;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-carbon">CRM</h1>
          <p className="text-sm text-niebla">Pipeline de leads por estado</p>
        </div>

        <form className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o correo…"
            className="w-64 rounded-[var(--radius-control)] border border-arena bg-blanco-roto px-3 py-2 text-sm outline-none focus:border-verde-golf"
          />
        </form>
      </div>

      <PipelineBoard contactos={contactos ?? []} />
    </div>
  );
}
