"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { importarExperienciasDeCodigo } from "@/app/admin/(panel)/experiencias/actions";

export function ImportarExperiencias({ pendientes }: { pendientes: number }) {
  const router = useRouter();
  const [pendiente, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function importar() {
    setError(null);
    start(async () => {
      const r = await importarExperienciasDeCodigo();
      if (!r.ok) return setError(r.error);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-panel)] border border-alerta/30 bg-alerta/5 p-5">
      <div>
        <p className="font-medium text-carbon">
          {pendientes === 1 ? "1 experiencia solo existe" : `${pendientes} experiencias solo existen`} en el código del sitio
        </p>
        <p className="text-sm text-niebla">
          Guárdalas en Supabase para poder editarlas todas desde aquí (programa, tarifas, fotos, salidas…).
        </p>
        {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
      </div>
      <button
        onClick={importar}
        disabled={pendiente}
        className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60"
      >
        {pendiente && <Loader2 size={15} className="animate-spin" />} Guardar todas en Supabase
      </button>
    </div>
  );
}
