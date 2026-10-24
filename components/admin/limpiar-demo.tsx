"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { eliminarDatosDemo } from "@/app/admin/(panel)/paquetes/demo-actions";

export function LimpiarDemo({ conteos }: { conteos: { etiqueta: string; total: number }[] }) {
  const [confirmar, setConfirmar] = useState(false);
  const [pendiente, start] = useTransition();
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = conteos.reduce((s, c) => s + c.total, 0);
  if (total === 0 && !resultado) return null;

  function borrar() {
    setError(null);
    start(async () => {
      const r = await eliminarDatosDemo();
      if (!r.ok) return setError(r.error);
      setConfirmar(false);
      setResultado(
        `Se eliminaron los datos de demostración (${r.borrados.reduce((s, b) => s + b.total, 0)} registros). Recarga la página.`,
      );
    });
  }

  return (
    <section className="rounded-[var(--radius-panel)] border border-alerta/30 bg-alerta/5 p-5">
      <h2 className="flex items-center gap-2 font-serif text-lg text-carbon">
        <AlertTriangle size={18} className="text-alerta" /> Datos de demostración en la base de datos
      </h2>
      {resultado ? (
        <p className="mt-2 text-sm text-exito">{resultado}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-niebla">
            Quedan registros de ejemplo que no son reales. Eliminarlos deja el catálogo vacío:
            las experiencias firmadas (Tailandia y Utah) no se afectan. Los leads, cotizaciones y
            reservas del CRM no se tocan.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {conteos.filter((c) => c.total > 0).map((c) => (
              <li key={c.etiqueta} className="rounded-full border border-arena bg-white px-3 py-1 text-carbon">
                {c.etiqueta}: <strong>{c.total}</strong>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {confirmar ? (
              <>
                <span className="text-sm font-medium text-error">Esto no se puede deshacer.</span>
                <button
                  onClick={borrar}
                  disabled={pendiente}
                  className="inline-flex items-center gap-2 rounded-xl bg-error px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
                >
                  {pendiente ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  Sí, eliminar todo
                </button>
                <button onClick={() => setConfirmar(false)} className="text-sm text-niebla hover:underline">
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmar(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-error/40 px-5 py-2.5 text-sm font-semibold text-error hover:bg-error/5"
              >
                <Trash2 size={15} /> Eliminar datos de demostración
              </button>
            )}
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-error">{error}</p>}
        </>
      )}
    </section>
  );
}
