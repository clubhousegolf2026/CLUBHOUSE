"use client";

import { useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Globo3D } from "./globo-3d";
import { DetalleDestino } from "./detalle-destino";
import { ListaDestinos } from "./lista-destinos";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

export function Hero({ destinos }: { destinos: DestinoConPaquetes[] }) {
  const [seleccion, setSeleccion] = useState<DestinoConPaquetes | null>(null);
  // El panel puede mostrar la lista de todas las ciudades o el detalle de
  // una — se cambia de vista sin cerrar el modal, con transición animada.
  // `abierto` es independiente de `seleccion`: la lista se puede mostrar
  // sin tener todavía un destino elegido (clic en país/océano).
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<"lista" | "detalle">("detalle");

  function cerrarTodo() {
    setAbierto(false);
    setSeleccion(null);
    setVista("detalle");
  }

  function elegirDestino(d: DestinoConPaquetes) {
    setSeleccion(d);
    setVista("detalle");
    setAbierto(true);
  }

  function abrirLista() {
    setVista("lista");
    setAbierto(true);
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative isolate -mt-20 flex min-h-dvh flex-col justify-center overflow-hidden bg-verde-calle pt-20 text-crema">
        <div
          className="-z-10 absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 78% 35%, rgba(198,166,100,.12), transparent 55%), linear-gradient(180deg, #0b3d2e 0%, #093226 100%)",
          }}
        />

        {/* Ancho completo de la página (no el max-w-6xl del resto del sitio):
            en pantallas grandes el hero usa casi todo el viewport. */}
        <div className="mx-auto grid w-full max-w-[1920px] items-center gap-6 px-6 sm:px-10 lg:grid-cols-[3fr_2fr] lg:gap-10 lg:px-16 xl:px-24">
          <div className="pt-16 pb-16 lg:pt-28 lg:pb-24">
            <span className="text-sm uppercase tracking-[0.2em] text-champagne">
              Turismo de golf en Colombia y el mundo
            </span>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-5xl xl:text-6xl">
              Arma tu viaje de golf y mira el precio al instante
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-crema/85">
              Elige campos, hotel, transporte y fecha. El precio se calcula en
              pantalla mientras decides. Reservas en línea, confirmación
              inmediata y un anfitrión local durante todo el viaje.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink
                href="/cotizador"
                variante="primario"
                className="bg-champagne text-carbon hover:bg-champagne/90"
              >
                Arma tu viaje
              </ButtonLink>
              <ButtonLink
                href="/paquetes"
                variante="contorno"
                className="border-crema/40 text-crema hover:bg-crema/10"
              >
                Ver paquetes listos
              </ButtonLink>
            </div>
          </div>

          {/* Globo 3D — a mano derecha del titular. Arrástralo para girarlo. */}
          <div className="-mt-16 flex w-full min-w-0 justify-center lg:mt-0 lg:justify-end">
            <Globo3D
              destinos={destinos}
              seleccionId={seleccion?.id ?? null}
              onSeleccion={(d) => (d ? elegirDestino(d) : cerrarTodo())}
              onAbrirLista={abrirLista}
            />
          </div>
        </div>

        {/* Card de detalle: aparece con efecto al tocar un punto del globo.
            Adentro, la lista de ciudades y el detalle de una se turnan con
            una transición deslizante (AnimatePresence mode="wait" por
            `vista`), sin cerrar el modal. */}
        <AnimatePresence>
          {abierto && (
            <m.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-carbon/60 p-4 backdrop-blur-sm"
              onClick={cerrarTodo}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="max-h-[80vh] w-full max-w-2xl overflow-hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {vista === "lista" ? (
                    <m.div
                      key="lista"
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="max-h-[80vh] overflow-y-auto"
                    >
                      <ListaDestinos
                        destinos={destinos}
                        onElegir={elegirDestino}
                        onCerrar={cerrarTodo}
                      />
                    </m.div>
                  ) : (
                    <m.div
                      key="detalle"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="max-h-[80vh] overflow-y-auto"
                    >
                      {seleccion && (
                        <DetalleDestino
                          destino={seleccion}
                          onCerrar={cerrarTodo}
                          onVolver={() => setVista("lista")}
                        />
                      )}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </section>
    </LazyMotion>
  );
}
