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
import { ArrowLeft, ArrowRight } from "lucide-react";
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
      <section className="grano relative isolate -mt-20 overflow-hidden bg-[#071d16] pb-10 pt-32 text-crema sm:pb-12 sm:pt-36">
        <div className="hero-degradado absolute inset-0 -z-20" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent to-[#f6f3ec]"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <span className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-[#e8d3a0]">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#e8d3a0]" />
            Arma tu viaje
          </span>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
            {PASOS[paso].titulo}
          </h1>
          <p className="mt-2 text-crema/60">
            Paso {paso + 1} de {PASOS.length} · el precio se actualiza en pantalla
          </p>

          {/* Stepper */}
          <ol className="mt-8 flex gap-2" aria-label="Progreso del itinerario">
            {PASOS.map((p, i) => (
              <li key={p.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => i <= paso && setPaso(i)}
                  disabled={i > paso}
                  aria-current={i === paso ? "step" : undefined}
                  className="block w-full text-left disabled:cursor-default"
                >
                  <span
                    className={`block h-1 w-full rounded-full transition-colors ${
                      i < paso
                        ? "bg-[#c6a664]"
                        : i === paso
                          ? "bg-gradient-to-r from-[#ecd396] to-[#a98745]"
                          : "bg-white/15"
                    }`}
                  />
                  <span
                    className={`mt-2 block text-[11px] transition-colors ${
                      i <= paso ? "text-crema/85" : "text-crema/35"
                    }`}
                  >
                    {p.titulo}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-28 pt-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:pb-16">
        <div>

          <AnimatePresence mode="wait">
            <m.section
              key={PASOS[paso].id}
              {...anim}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
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
              className="inline-flex min-h-12 items-center gap-1.5 rounded-xl px-5 text-sm text-niebla transition-colors hover:bg-arena/50 hover:text-carbon disabled:opacity-40"
            >
              <ArrowLeft size={15} /> Atrás
            </button>
            <button
              type="button"
              onClick={avanzar}
              className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-br from-verde-golf to-verde-calle px-7 text-sm font-semibold text-crema shadow-lg shadow-verde-calle/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              {paso === PASOS.length - 1 ? "Ver resumen" : "Continuar"}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        <PanelPrecioSticky />
        <BarraPrecioMovil />
      </div>
    </LazyMotion>
  );
}
