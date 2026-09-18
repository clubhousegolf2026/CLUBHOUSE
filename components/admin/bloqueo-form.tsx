"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { AlertaError, Campo, Entrada, Selector } from "@/components/admin/form-ui";
import { crearBloqueo } from "@/app/admin/(panel)/calendario/actions";

export function BloqueoForm({ paqueteId }: { paqueteId: string | null }) {
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
          paqueteId,
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
    <section className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6">
      <header className="mb-5 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-verde-golf/10 text-verde-golf">
          <CalendarPlus size={18} />
        </span>
        <div>
          <h2 className="font-serif text-lg leading-tight text-carbon">Agregar rango</h2>
          <p className="mt-0.5 text-sm text-niebla">Bloquea fechas, marca temporada alta o limita cupos.</p>
        </div>
      </header>
      {error && <div className="mb-4"><AlertaError>{error}</AlertaError></div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Campo label="Desde">
          <Entrada type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </Campo>
        <Campo label="Hasta">
          <Entrada type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </Campo>
        <Campo label="Tipo">
          <Selector value={tipo} onChange={(e) => setTipo(e.target.value as typeof tipo)}>
            <option value="bloqueo">Bloqueo (sin cupo)</option>
            <option value="temporada_alta">Temporada alta</option>
            <option value="cupo">Cupo limitado</option>
          </Selector>
        </Campo>
        {tipo === "temporada_alta" && (
          <Campo label="Factor de precio" ayuda="1,15 = +15%">
            <Entrada type="number" min={1} step={0.01} sufijo="×" value={factor} onChange={(e) => setFactor(Number(e.target.value))} />
          </Campo>
        )}
      </div>
      <Campo label="Nota (opcional)" className="mt-4">
        <Entrada value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej. Mantenimiento de campos" />
      </Campo>
      <button
        type="button"
        onClick={alCrear}
        disabled={pending}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-verde-golf px-6 text-sm font-medium text-crema shadow-sm transition-colors hover:bg-verde-calle disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar rango"}
      </button>
    </section>
  );
}
