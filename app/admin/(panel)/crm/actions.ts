"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/data/database.types";

type EstadoContacto = Database["public"]["Enums"]["estado_contacto"];

export async function cambiarEstadoContacto(
  contactoId: string,
  nuevoEstado: EstadoContacto,
  nota?: string,
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("avanzar_estado_contacto", {
    p_contacto: contactoId,
    p_nuevo: nuevoEstado,
    p_nota: nota ?? null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/crm");
  revalidatePath(`/admin/crm/${contactoId}`);
}

export async function actualizarFichaContacto(
  contactoId: string,
  cambios: { valorEstimadoCop?: number | null; notas?: string | null },
) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("contactos")
    .update({
      valor_estimado_cop: cambios.valorEstimadoCop,
      notas: cambios.notas,
    })
    .eq("id", contactoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/crm/${contactoId}`);
}
