"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { FormularioPublico } from "@/components/formularios/formulario-publico";
import { CLAVE_VISTA } from "@/lib/formularios/vista";
import type { FormularioFila } from "@/lib/formularios/tipos";

/** Vista previa del formulario en una pestaña propia. Lee lo que el editor deja en
 *  el navegador y se actualiza sola mientras sigues editando. No envía nada. */
export function VistaPestana() {
  const [formulario, setFormulario] = useState<FormularioFila | null>(null);
  const [modo, setModo] = useState<"escritorio" | "movil">("escritorio");
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    const leer = () => {
      try {
        const raw = localStorage.getItem(CLAVE_VISTA);
        if (raw) setFormulario((JSON.parse(raw) as { formulario: FormularioFila }).formulario);
      } catch {}
      setCargado(true);
    };
    leer();
    const alCambiar = (e: StorageEvent) => {
      if (e.key === CLAVE_VISTA) leer();
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  if (!formulario) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f6f3ec] px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-serif text-2xl text-carbon">{cargado ? "No hay nada que mostrar" : "Cargando…"}</h1>
          {cargado && <p className="mt-2 text-sm text-niebla">Abre esta vista desde el botón «Abrir en pestaña nueva» del editor de formularios.</p>}
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-[#e7e5df]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-[#0a2a20] px-4 py-2.5 text-crema">
        <p className="min-w-0 truncate text-sm">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#e8d3a0]">Vista previa</span>
          <span className="ml-3 font-serif text-base text-white">{formulario.nombre}</span>
          <span className="ml-3 hidden text-xs text-crema/60 sm:inline">Se actualiza sola mientras editas · aquí no se envía nada</span>
        </p>
        <div className="inline-flex rounded-lg border border-white/20 bg-white/10 p-0.5 text-xs">
          {(["escritorio", "movil"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setModo(m)} className={cn("rounded-md px-3 py-1.5", modo === m ? "bg-white text-carbon" : "text-crema/80 hover:text-white")}>
              {m === "escritorio" ? "Escritorio" : "Móvil"}
            </button>
          ))}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto h-full overflow-auto bg-white shadow-2xl" style={{ width: modo === "movil" ? 390 : "100%", maxWidth: "100%" }}>
          <FormularioPublico key={formulario.plantilla} formulario={formulario} vista llenar />
        </div>
      </div>
    </div>
  );
}
