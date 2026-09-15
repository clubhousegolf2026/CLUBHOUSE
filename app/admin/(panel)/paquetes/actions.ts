"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export interface DatosPaquete {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  noches: number;
  dias: number;
  precioDesdeCop: number;
  destacado: boolean;
  activo: boolean;
  incluye: string[];
  noIncluye: string[];
  galeria: { url: string; alt: string }[];
  camposIds: string[]; // codigo de tarifas_componentes con tipo=campo_golf
  destinosIds: string[]; // id de destinos
}

function revalidarTodo(id?: string) {
  revalidatePath("/admin/paquetes");
  revalidatePath("/paquetes");
  revalidatePath("/");
  if (id) revalidatePath(`/admin/paquetes/${id}`);
}

async function sincronizarRelaciones(
  paqueteId: string,
  camposIds: string[],
  destinosIds: string[],
) {
  const supabase = await createServerSupabase();

  await supabase.from("paquete_campos").delete().eq("paquete_id", paqueteId);
  if (camposIds.length > 0) {
    const { error } = await supabase.from("paquete_campos").insert(
      camposIds.map((tarifa_codigo, i) => ({
        paquete_id: paqueteId,
        tarifa_codigo,
        orden: i,
      })),
    );
    if (error) throw new Error(error.message);
  }

  await supabase.from("destino_paquetes").delete().eq("paquete_id", paqueteId);
  if (destinosIds.length > 0) {
    const { error } = await supabase.from("destino_paquetes").insert(
      destinosIds.map((destino_id) => ({ destino_id, paquete_id: paqueteId })),
    );
    if (error) throw new Error(error.message);
  }
}

export async function crearPaquete(datos: DatosPaquete) {
  const supabase = await createServerSupabase();

  const { error } = await supabase.from("paquetes").insert({
    id: datos.id,
    slug: datos.slug,
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    noches: datos.noches,
    dias: datos.dias,
    precio_desde_cop: datos.precioDesdeCop,
    destacado: datos.destacado,
    activo: datos.activo,
    incluye: datos.incluye,
    no_incluye: datos.noIncluye,
    galeria: datos.galeria,
  });
  if (error) throw new Error(error.message);

  await sincronizarRelaciones(datos.id, datos.camposIds, datos.destinosIds);
  revalidarTodo(datos.id);
  redirect("/admin/paquetes");
}

export async function actualizarPaquete(datos: DatosPaquete) {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("paquetes")
    .update({
      slug: datos.slug,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      noches: datos.noches,
      dias: datos.dias,
      precio_desde_cop: datos.precioDesdeCop,
      destacado: datos.destacado,
      activo: datos.activo,
      incluye: datos.incluye,
      no_incluye: datos.noIncluye,
      galeria: datos.galeria,
    })
    .eq("id", datos.id);
  if (error) throw new Error(error.message);

  await sincronizarRelaciones(datos.id, datos.camposIds, datos.destinosIds);
  revalidarTodo(datos.id);
}

export async function eliminarPaquete(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("paquetes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarTodo();
  redirect("/admin/paquetes");
}

export async function togglearActivoPaquete(id: string, activo: boolean) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("paquetes").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidarTodo(id);
}
