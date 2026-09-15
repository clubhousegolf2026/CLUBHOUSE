"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { marcarReservaPagada } from "@/app/admin/(panel)/reservas/actions";
import type { Database } from "@/lib/data/database.types";

type EstadoPago = Database["public"]["Enums"]["estado_pago"];

export function MarcarPagoForm({
  reservaId,
  estadoActual,
}: {
  reservaId: string;
  estadoActual: EstadoPago;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4">
      <p className="text-sm text-carbon">
        Sin pasarela conectada todavía: confirma el pago manualmente cuando lo
        verifiques.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          disabled={pending || estadoActual === "pagado"}
          onClick={() => startTransition(() => marcarReservaPagada(reservaId, true))}
        >
          Marcar pagada
        </Button>
        <Button
          type="button"
          variante="contorno"
          disabled={pending || estadoActual === "fallido"}
          onClick={() => startTransition(() => marcarReservaPagada(reservaId, false))}
        >
          Marcar fallida
        </Button>
      </div>
    </div>
  );
}
