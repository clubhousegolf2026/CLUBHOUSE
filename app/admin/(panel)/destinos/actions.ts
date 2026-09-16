"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export interface DatosDestino {
  id: string;
  nombre: string;
  region: string;
  pais: string;
  lat: number;
  lng: number;
  resumen: string;
  disponible: boolean;
  orden: number;
}

function revalidarTodo(id?: string) {
  revalidatePath("/admin/destinos");
  revalidatePath("/");
  revalidatePath("/paquetes");
  if (id) revalidatePath(`/admin/destinos/${id}`);
}

export async function crearDestino(datos: DatosDestino) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("destinos").insert({
    id: datos.id,
    nombre: datos.nombre,
    region: datos.region,
    pais: datos.pais,
    lat: datos.lat,
    lng: datos.lng,
    resumen: datos.resumen,
    disponible: datos.disponible,
    orden: datos.orden,
  });
  if (error) throw new Error(error.message);
  revalidarTodo();
  redirect("/admin/destinos");
}

export async function actualizarDestino(datos: DatosDestino) {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("destinos")
    .update({
      nombre: datos.nombre,
      region: datos.region,
      pais: datos.pais,
      lat: datos.lat,
      lng: datos.lng,
      resumen: datos.resumen,
      disponible: datos.disponible,
      orden: datos.orden,
    })
    .eq("id", datos.id);
  if (error) throw new Error(error.message);
  revalidarTodo(datos.id);
}

export async function eliminarDestino(id: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("destinos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidarTodo();
  redirect("/admin/destinos");
}
