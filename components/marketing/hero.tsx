"use client";

import { useMemo, useState } from "react";
import { geoDistance } from "d3-geo";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { MARCA } from "@/lib/contenido/clubhouse";
import { Globo3D } from "./globo-3d";
import { DetalleDestino } from "./detalle-destino";
import { ListaDestinos } from "./lista-destinos";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

export function Hero({ destinos }: { destinos: DestinoConPaquetes[] }) {
  const estadisticas = [
    { valor: "50", etiqueta: "destinos" },
    { valor: "5", etiqueta: "continentes" },
    { valor: "95+", etiqueta: "campos jugados" },
  ];

  const [seleccion, setSeleccion] = useState<DestinoConPaquetes | null>(null);
  // El panel puede mostrar la lista de todas las ciudades o el detalle de
  // una — se cambia de vista sin cerrar el modal, con transición animada.
  // `abierto` es independiente de `seleccion`: la lista se puede mostrar
  // sin tener todavía un destino elegido (clic en país/océano).
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<"lista" | "detalle">("detalle");

  // Punto tocado en el globo: si cae cerca de algún destino, la lista se
  // limita a los destinos de ese mismo país (con opción de ver todos);
  // si cae lejos de todos (océano), se muestran todos ordenados por cercanía.
  const [centro, setCentro] = useState<[number, number] | null>(null);
  const [verTodos, setVerTodos] = useState(false);
  const { ordenados, pais } = useMemo(() => {
    if (!centro) return { ordenados: destinos, pais: null as string | null };
    const porCercania = [...destinos].sort(
      (a, b) =>
        geoDistance(centro, a.coordenadas) - geoDistance(centro, b.coordenadas),
    );
    const cercano = porCercania[0];
    const cerca =
      cercano && geoDistance(centro, cercano.coordenadas) < 0.5;
    if (!cerca || verTodos) return { ordenados: porCercania, pais: null };
    return {
      ordenados: porCercania.filter((d) => d.pais === cercano.pais),
      pais: cercano.pais,
    };
  }, [destinos, centro, verTodos]);

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

  function abrirLista(lat: number, lng: number) {
    setCentro([lng, lat]);
    setVerTodos(false);
    setVista("lista");
    setAbierto(true);
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="grano relative isolate -mt-20 flex min-h-dvh flex-col justify-center overflow-hidden bg-[#061a13] pt-20 text-crema">
        <div className="hero-degradado -z-30 absolute inset-0" />
        {/* Foto del brochure (Dubai Creek) de fondo, tamizada de verde para
            que el texto y el globo sigan leyéndose. */}
        <Image
          src="/fotos/dubai-creek.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[center_60%] opacity-40"
        />
        <div
          aria-hidden
          className="-z-[15] absolute inset-0 bg-gradient-to-r from-[#061a13]/90 via-[#061a13]/50 to-[#061a13]/20"
        />
        <div
          aria-hidden
          className="-z-10 absolute inset-0 bg-[radial-gradient(ellipse_at_62%_45%,transparent_30%,rgba(3,15,11,0.72)_100%)]"
        />

        <div className="mx-auto grid w-full max-w-[1920px] items-center gap-6 px-6 sm:px-10 lg:grid-cols-[3fr_2fr] lg:gap-10 lg:px-16 xl:px-24">
          <div className="pt-16 pb-10 lg:pt-28 lg:pb-24">
            <span className="entra-hero inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.34em] text-[#e8d3a0]">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#e8d3a0]" />
              {MARCA.claim}
            </span>

            <h1
              className="entra-hero mt-7 max-w-[15ch] font-serif text-[2.9rem] leading-[0.98] tracking-[-0.02em] sm:text-[4.2rem] xl:text-[5.4rem]"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Usted lo sueña,
              <br />
              <span className="texto-oro">Clubhouse</span> lo hace
              <br />
              realidad.
            </h1>

            <p
              className="entra-hero mt-8 max-w-xl text-lg leading-relaxed text-crema/70"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Una agencia bespoke de viajes de golf. Cada viaje se diseña desde
              cero, alrededor de su juego, su grupo y su forma de viajar.
            </p>

            <div
              className="entra-hero mt-10 flex flex-wrap gap-3"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <a
                href={MARCA.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-oro group inline-flex min-h-13 items-center gap-2 rounded-full px-8 text-sm font-semibold"
              >
                Hablemos de su viaje
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#experiencias"
                className="boton-cristal inline-flex min-h-13 items-center gap-2 rounded-full px-8 text-sm font-medium"
              >
                Ver experiencias
              </a>
            </div>

            <dl
              className="entra-hero mt-14 flex flex-wrap gap-x-12 gap-y-4 border-t border-white/10 pt-7"
              style={{ "--i": 4 } as React.CSSProperties}
            >
              {estadisticas.map((e) => (
                <div key={e.etiqueta}>
                  <dt className="texto-oro font-serif text-[2rem] leading-none">{e.valor}</dt>
                  <dd className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-crema/50">
                    {e.etiqueta}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Globo 3D — el mundo de la marca: 50 destinos en 5 continentes. */}
          <div className="relative -mt-16 flex w-full min-w-0 justify-center lg:mt-0 lg:justify-end">
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
              <div className="orbita orbita-gira aspect-square w-[96%]" />
              <div className="orbita orbita-gira-inversa aspect-square w-[118%] !border-white/10" />
            </div>
            <Globo3D
              destinos={destinos}
              seleccionId={seleccion?.id ?? null}
              onSeleccion={(d) => (d ? elegirDestino(d) : cerrarTodo())}
              onAbrirLista={abrirLista}
            />
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 sm:bottom-5">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-[#061a13]/60 px-4 py-2 text-xs text-crema/85 backdrop-blur-md">
                <span className="punto-vivo h-2 w-2 rounded-full bg-[#e8d3a0]" />
                Toque un banderín para explorar
                <Sparkles size={13} className="text-[#e8d3a0]" />
              </span>
            </div>
          </div>
        </div>

        <a
          href="#suenos"
          aria-label="Seguir leyendo"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-crema/45 transition-colors hover:text-crema md:flex"
        >
          Desliza
          <span className="scroll-raton relative h-10 w-6 rounded-full border border-white/30" />
        </a>

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
                        destinos={ordenados}
                        pais={pais}
                        onVerTodos={() => setVerTodos(true)}
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
