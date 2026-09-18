"use client";

import { useMemo, useState } from "react";
import { geoDistance } from "d3-geo";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Globo3D } from "./globo-3d";
import { DetalleDestino } from "./detalle-destino";
import { ListaDestinos } from "./lista-destinos";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

export function Hero({ destinos }: { destinos: DestinoConPaquetes[] }) {
  const planes = new Set(destinos.flatMap((d) => d.paquetes.map((p) => p.id))).size;
  const campos = new Set(destinos.flatMap((d) => d.campos)).size;
  const estadisticas = [
    { valor: String(planes), etiqueta: planes === 1 ? "plan listo" : "planes listos" },
    { valor: String(campos), etiqueta: campos === 1 ? "campo de golf" : "campos de golf" },
    { valor: "30%", etiqueta: "para reservar" },
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
      <section className="grano relative isolate -mt-20 flex min-h-dvh flex-col justify-center overflow-hidden bg-[#071d16] pt-20 text-crema">
        <div className="hero-degradado -z-20 absolute inset-0" />
        <div
          aria-hidden
          className="-z-10 absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,transparent_35%,rgba(3,15,11,0.6)_100%)]"
        />

        <div className="mx-auto grid w-full max-w-[1920px] items-center gap-6 px-6 sm:px-10 lg:grid-cols-[3fr_2fr] lg:gap-10 lg:px-16 xl:px-24">
          <div className="pt-16 pb-10 lg:pt-28 lg:pb-24">
            <span className="entra-hero inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-[#e8d3a0]">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#e8d3a0]" />
              Turismo de golf en Colombia y el mundo
            </span>
            <h1
              className="entra-hero mt-6 max-w-4xl font-serif text-[2.75rem] leading-[1.04] sm:text-6xl xl:text-7xl"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Arma tu viaje de{" "}
              <em className="texto-oro pr-1 font-medium italic">golf</em> y mira el
              precio al instante
            </h1>
            <p
              className="entra-hero mt-7 max-w-2xl text-lg leading-relaxed text-crema/75"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Elige campos, hotel, transporte y fecha. El precio se calcula en
              pantalla mientras decides. Reservas en línea, confirmación
              inmediata y un anfitrión local durante todo el viaje.
            </p>
            <div
              className="entra-hero mt-10 flex flex-wrap gap-3"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              <Link
                href="/cotizador"
                className="boton-oro group inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold"
              >
                Arma tu viaje
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/paquetes"
                className="boton-cristal inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-sm font-medium"
              >
                Ver paquetes listos
              </Link>
            </div>

            <dl
              className="entra-hero mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6"
              style={{ "--i": 4 } as React.CSSProperties}
            >
              {estadisticas.map((e) => (
                <div key={e.etiqueta}>
                  <dt className="font-serif text-3xl texto-oro">{e.valor}</dt>
                  <dd className="mt-0.5 text-xs uppercase tracking-[0.14em] text-crema/55">
                    {e.etiqueta}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Globo 3D — a mano derecha del titular. Arrástralo para girarlo. */}
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
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-[#071d16]/60 px-4 py-2 text-xs text-crema/85 backdrop-blur-md">
                <span className="punto-vivo h-2 w-2 rounded-full bg-[#e8d3a0]" />
                Toca un banderín para explorar
                <Sparkles size={13} className="text-[#e8d3a0]" />
              </span>
            </div>
          </div>
        </div>

        <a
          href="#planes"
          aria-label="Ver planes"
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
