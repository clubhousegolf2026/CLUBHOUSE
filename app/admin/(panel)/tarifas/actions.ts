"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { TipoComponente } from "@/lib/pricing/types";

export interface DatosTarifa {
  codigo: string;
  tipo: TipoComponente;
  nombre: string;
  descripcion: string;
  precioUnitarioCop: number;
  unidad: "persona_dia" | "habitacion_noche" | "servicio" | "grupo";
  temporadaAltaFactor: number;
  destinoId: string | null;
  activo: boolean;
}

function revalidarTodo(codigo?: string) {
  revalidatePath("/admin/tarifas");
  revalidatePath("/cotizador");
  revalidatePath("/paquetes");
  revalidatePath("/");
  if (codigo) revalidatePath(`/admin/tarifas/${codigo}`);
}

export async function crearTarifa(datos: DatosTarifa) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("tarifas_componentes").insert({
    codigo: datos.codigo,
    tipo: datos.tipo,
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    precio_unitario_cop: datos.precioUnitarioCop,
    unidad: datos.unidad,
    temporada_alta_factor: datos.temporadaAltaFactor,
    destino_id: datos.tipo === "campo_golf" ? datos.destinoId : null,
    activo: datos.activo,
  });
  if (error) throw new Error(error.message);
  revalidarTodo();
  redirect("/admin/tarifas");
}

export async function actualizarTarifa(datos: DatosTarifa) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("tarifas_componentes")
    .update({
      tipo: datos.tipo,
      nombre: datos.nombre,
      descripcion: datos.descripcion || null,
      precio_unitario_cop: datos.precioUnitarioCop,
      unidad: datos.unidad,
      temporada_alta_factor: datos.temporadaAltaFactor,
      destino_id: datos.tipo === "campo_golf" ? datos.destinoId : null,
      activo: datos.activo,
    })
    .eq("codigo", datos.codigo);
  if (error) throw new Error(error.message);
  revalidarTodo(datos.codigo);
}

export async function eliminarTarifa(codigo: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("tarifas_componentes")
    .delete()
    .eq("codigo", codigo);
  if (error) throw new Error(error.message);
  revalidarTodo();
  redirect("/admin/tarifas");
}
