"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

// Cliente sin tipos: las tablas se recorren por nombre en un arreglo.
async function clienteLibre(): Promise<SupabaseClient> {
  return (await createServerSupabase()) as unknown as SupabaseClient;
}

/** Tablas del catálogo que se sembraron con datos de demostración. Los leads,
 *  cotizaciones y reservas (CRM) NO se tocan nunca desde aquí. */
const TABLAS_DEMO = [
  // Orden: primero las que dependen de otras (claves foráneas).
  { tabla: "destino_paquetes", columna: "destino_id", etiqueta: "Relaciones destino–paquete" },
  { tabla: "paquete_campos", columna: "paquete_id", etiqueta: "Campos por paquete" },
  { tabla: "paquetes", columna: "id", etiqueta: "Paquetes" },
  { tabla: "tarifas_componentes", columna: "codigo", etiqueta: "Tarifas del cotizador" },
  { tabla: "destinos", columna: "id", etiqueta: "Destinos" },
  { tabla: "bloqueos_calendario", columna: "id", etiqueta: "Bloqueos de calendario" },
  { tabla: "testimonios", columna: "id", etiqueta: "Testimonios" },
] as const;

export async function contarDatosDemo(): Promise<{ etiqueta: string; total: number }[]> {
  const supabase = await clienteLibre();
  const conteos = await Promise.all(
    TABLAS_DEMO.map(async (t) => {
      const { count } = await supabase.from(t.tabla).select("*", { count: "exact", head: true });
      return { etiqueta: t.etiqueta, total: count ?? 0 };
    }),
  );
  return conteos;
}

export async function eliminarDatosDemo(): Promise<
  { ok: true; borrados: { etiqueta: string; total: number }[] } | { ok: false; error: string }
> {
  const supabase = await clienteLibre();
  const borrados: { etiqueta: string; total: number }[] = [];

  for (const t of TABLAS_DEMO) {
    const { data, error } = await supabase
      .from(t.tabla)
      .delete()
      .not(t.columna, "is", null)
      .select(t.columna);
    if (error) {
      return {
        ok: false,
        error: `No se pudo borrar «${t.etiqueta}»: ${error.message}. Ya se borró lo anterior en la lista; vuelve a intentarlo.`,
      };
    }
    borrados.push({ etiqueta: t.etiqueta, total: data?.length ?? 0 });
  }

  revalidatePath("/admin/paquetes");
  revalidatePath("/admin/destinos");
  revalidatePath("/admin/tarifas");
  revalidatePath("/admin/calendario");
  revalidatePath("/");
  return { ok: true, borrados };
}
