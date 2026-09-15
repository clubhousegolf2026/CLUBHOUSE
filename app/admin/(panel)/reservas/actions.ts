"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function marcarReservaPagada(reservaId: string, pagada: boolean) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("marcar_reserva_pagada", {
    p_reserva: reservaId,
    p_pagada: pagada,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/reservas");
  revalidatePath(`/admin/reservas/${reservaId}`);
}
