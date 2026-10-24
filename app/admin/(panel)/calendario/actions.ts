"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

function revalidarTodo() {
  revalidatePath("/admin/calendario");
  revalidatePath("/cotizador");
}

export async function crearBloqueo(datos: {
  fechaInicio: string;
  fechaFin: string;
  tipo: "bloqueo" | "temporada_alta" | "cupo";
  nota: string | null;
  factorPrecio: number | null;
  paqueteId: string | null;
}) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("bloqueos_calendario").insert({
    fecha_inicio: datos.fechaInicio,
    fecha_fin: datos.fechaFin,
    tipo: datos.tipo,
    nota: datos.nota,
    factor_precio: datos.tipo === "temporada_alta" ? datos.factorPrecio : null,
    paquete_id: datos.paqueteId,
  });
  if (error) throw new Error(error.message);
  revalidarTodo();
}

export async function eliminarBloqueo(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("bloqueos_calendario").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarTodo();
}

export async function actualizarBloqueo(
  id: string,
  datos: {
    fechaInicio: string;
    fechaFin: string;
    tipo: "bloqueo" | "temporada_alta" | "cupo";
    nota: string | null;
    factorPrecio: number | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!datos.fechaInicio || !datos.fechaFin) return { ok: false, error: "Escribe la fecha de inicio y fin." };
  if (datos.fechaFin < datos.fechaInicio) return { ok: false, error: "La fecha de fin no puede ser anterior a la de inicio." };
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("bloqueos_calendario")
    .update({
      fecha_inicio: datos.fechaInicio,
      fecha_fin: datos.fechaFin,
      tipo: datos.tipo,
      nota: datos.nota,
      factor_precio: datos.tipo === "temporada_alta" ? datos.factorPrecio : null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidarTodo();
  return { ok: true };
}
