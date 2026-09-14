"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { useCotizador } from "@/stores/cotizador-store";
import type { Tarifa } from "@/lib/pricing/types";
import type { BloqueoCalendario } from "@/lib/data/types";
import {
  PasoCampos,
  PasoAlojamiento,
  PasoTransporte,
  PasoActividades,
  PasoFechas,
} from "./pasos";
import { PanelPrecioSticky, BarraPrecioMovil } from "./panel-precio";

const PASOS = [
  { id: "campos", titulo: "Campos de golf" },
  { id: "alojamiento", titulo: "Alojamiento" },
  { id: "transporte", titulo: "Transporte" },
  { id: "actividades", titulo: "Actividades" },
  { id: "fechas", titulo: "Fechas" },
] as const;

export function Constructor({
  tarifas,
  bloqueos,
}: {
  tarifas: Tarifa[];
  bloqueos: BloqueoCalendario[];
}) {
  const { paso, setPaso, hidratarCatalogo } = useCotizador();
  const reduce = useReducedMotion();
  const router = useRouter();

  function avanzar() {
    if (paso === PASOS.length - 1) {
      router.push("/cotizador/resumen");
      return;
    }
    setPaso(Math.min(PASOS.length - 1, paso + 1));
  }

  // El catálogo llega como prop desde el Server Component: cero fetch en cliente.
  useEffect(() => {
    hidratarCatalogo(tarifas);
  }, [tarifas, hidratarCatalogo]);

  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  return (
    <LazyMotion features={domAnimation}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-28 pt-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:pb-16">
        <div>
          {/* Stepper */}
          <ol className="mb-8 flex gap-2" aria-label="Progreso del itinerario">
            {PASOS.map((p, i) => (
              <li key={p.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => i <= paso && setPaso(i)}
                  disabled={i > paso}
                  aria-current={i === paso ? "step" : undefined}
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    i <= paso ? "bg-verde-golf" : "bg-arena"
                  }`}
                />
                <span className="mt-1 block text-[11px] text-niebla">
                  {p.titulo}
                </span>
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait">
            <m.section
              key={PASOS[paso].id}
              {...anim}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <h1 className="mb-4 font-serif text-2xl text-carbon">
                {PASOS[paso].titulo}
              </h1>
              {paso === 0 && <PasoCampos tarifas={tarifas} />}
              {paso === 1 && <PasoAlojamiento tarifas={tarifas} />}
              {paso === 2 && <PasoTransporte tarifas={tarifas} />}
              {paso === 3 && <PasoActividades tarifas={tarifas} />}
              {paso === 4 && <PasoFechas bloqueos={bloqueos} />}
            </m.section>
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setPaso(Math.max(0, paso - 1))}
              disabled={paso === 0}
              className="rounded-lg px-4 py-2 text-sm text-niebla disabled:opacity-40"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={avanzar}
              className="rounded-lg bg-verde-golf px-6 py-2 text-sm font-medium text-crema"
            >
              {paso === PASOS.length - 1 ? "Ver resumen" : "Continuar"}
            </button>
          </div>
        </div>

        <PanelPrecioSticky />
        <BarraPrecioMovil />
      </div>
    </LazyMotion>
  );
}
