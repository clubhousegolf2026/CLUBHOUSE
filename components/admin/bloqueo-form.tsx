"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { crearBloqueo } from "@/app/admin/(panel)/calendario/actions";

export function BloqueoForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipo, setTipo] = useState<"bloqueo" | "temporada_alta" | "cupo">("bloqueo");
  const [nota, setNota] = useState("");
  const [factor, setFactor] = useState(1.15);

  function alCrear() {
    setError(null);
    if (!fechaInicio || !fechaFin) {
      setError("Escribe la fecha de inicio y fin.");
      return;
    }
    if (fechaFin < fechaInicio) {
      setError("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }
    startTransition(async () => {
      try {
        await crearBloqueo({
          fechaInicio,
          fechaFin,
          tipo,
          nota: nota || null,
          factorPrecio: factor,
        });
        setFechaInicio("");
        setFechaFin("");
        setNota("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  return (
    <div className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5">
      <h2 className="font-serif text-lg text-carbon">Agregar rango</h2>
      {error && (
        <p className="mt-2 rounded-[var(--radius-control)] bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="text-sm text-carbon">Desde</span>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className={estiloInput}
          />
        </label>
        <label className="block">
          <span className="text-sm text-carbon">Hasta</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className={estiloInput}
          />
        </label>
        <label className="block">
          <span className="text-sm text-carbon">Tipo</span>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as typeof tipo)}
            className={estiloInput}
          >
            <option value="bloqueo">Bloqueo (sin cupo)</option>
            <option value="temporada_alta">Temporada alta</option>
            <option value="cupo">Cupo limitado</option>
          </select>
        </label>
        {tipo === "temporada_alta" && (
          <label className="block">
            <span className="text-sm text-carbon">Factor de precio</span>
            <input
              type="number"
              min={1}
              step={0.01}
              value={factor}
              onChange={(e) => setFactor(Number(e.target.value))}
              className={estiloInput}
            />
          </label>
        )}
      </div>
      <label className="mt-3 block">
        <span className="text-sm text-carbon">Nota (opcional)</span>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Ej. Mantenimiento de campos"
          className={estiloInput}
        />
      </label>
      <Button className="mt-4" onClick={alCrear} disabled={pending}>
        {pending ? "Guardando…" : "Agregar rango"}
      </Button>
    </div>
  );
}

const estiloInput =
  "mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf";
