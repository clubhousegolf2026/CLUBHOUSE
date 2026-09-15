"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { actualizarFichaContacto } from "@/app/admin/(panel)/crm/actions";

export function FichaContactoForm({
  contactoId,
  valorInicial,
  notasIniciales,
}: {
  contactoId: string;
  valorInicial: number | null;
  notasIniciales: string | null;
}) {
  const [valor, setValor] = useState(valorInicial?.toString() ?? "");
  const [notas, setNotas] = useState(notasIniciales ?? "");
  const [pending, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await actualizarFichaContacto(contactoId, {
            valorEstimadoCop: valor ? Number(valor) : null,
            notas: notas || null,
          });
          setGuardado(true);
        });
      }}
      className="space-y-4"
    >
      <label className="block">
        <span className="text-sm text-carbon">Valor estimado (COP)</span>
        <input
          type="number"
          min={0}
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setGuardado(false);
          }}
          className="mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf"
        />
      </label>

      <label className="block">
        <span className="text-sm text-carbon">Notas</span>
        <textarea
          rows={4}
          value={notas}
          onChange={(e) => {
            setNotas(e.target.value);
            setGuardado(false);
          }}
          className="mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" variante="contorno" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        {guardado && !pending && (
          <span className="text-sm text-exito">Guardado</span>
        )}
      </div>
    </form>
  );
}
