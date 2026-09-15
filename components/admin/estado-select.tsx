"use client";

import { useTransition } from "react";
import type { Database } from "@/lib/data/database.types";
import {
  ORDEN_ESTADOS_CONTACTO,
  ETIQUETA_ESTADO_CONTACTO,
} from "@/components/admin/estado-badge";
import { cambiarEstadoContacto } from "@/app/admin/(panel)/crm/actions";

type EstadoContacto = Database["public"]["Enums"]["estado_contacto"];

export function EstadoSelect({
  contactoId,
  estadoActual,
}: {
  contactoId: string;
  estadoActual: EstadoContacto;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={estadoActual}
      disabled={pending}
      onChange={(e) => {
        const nuevo = e.target.value as EstadoContacto;
        startTransition(() => {
          void cambiarEstadoContacto(contactoId, nuevo);
        });
      }}
      className="rounded-[var(--radius-control)] border border-arena bg-blanco-roto px-2 py-1 text-xs text-carbon outline-none focus:border-verde-golf disabled:opacity-50"
    >
      {ORDEN_ESTADOS_CONTACTO.map((estado) => (
        <option key={estado} value={estado}>
          {ETIQUETA_ESTADO_CONTACTO[estado]}
        </option>
      ))}
    </select>
  );
}
