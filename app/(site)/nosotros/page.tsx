import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flag, UserCheck, Zap } from "lucide-react";
import { Oro } from "@/components/marketing/pagina-hero";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Contador } from "@/components/site/contador";
import {
  SeccionContacto,
  SeccionIncluye,
  SeccionProceso,
} from "@/components/marketing/secciones-marca";
import { MARCA, TRAYECTORIA } from "@/lib/contenido/clubhouse";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Clubhouse es una agencia bespoke de viajes de golf, fundada y dirigida por Juan Manuel Morales Calderón, con 10 años como Golf Manager de FROSCH Latinoamérica.",
};

const PILARES = [
  {
    icono: Flag,
    titulo: "Itinerario a la medida",
    texto: "Cada viaje se diseña desde cero, alrededor de su juego, su grupo y su forma de viajar.",
  },
  {
    icono: Zap,
    titulo: "Todo resuelto",
    texto: "Tiquetes, traslados, hoteles o villas, tee times y tours: nos encargamos de cada detalle del viaje.",
  },
  {
    icono: UserCheck,
    titulo: "Años en el golf",
    texto: "Fundada y dirigida por Juan Manuel Morales Calderón, con 10 años como Golf Manager en FROSCH Latinoamérica.",
  },
] as const;

/** Campos de las experiencias firmadas (nombres y países del catálogo). */
const CAMPOS = [
  { foto: "/fotos/alpine.webp", pais: "Tailandia", nombre: "Alpine Golf Club", clase: "row-span-2" },
  { foto: "/fotos/the-ledges.webp", pais: "Utah", nombre: "The Ledges", clase: "" },
  { foto: "/fotos/black-desert.webp", pais: "Utah", nombre: "Black Desert", clase: "row-span-2" },
  { foto: "/fotos/chee-chan.webp", pais: "Tailandia", nombre: "Siam Country Club", clase: "" },
  { foto: "/fotos/laem-chabang.webp", pais: "Tailandia", nombre: "Laem Chabang", clase: "" },
  { foto: "/fotos/utah-canon.webp", pais: "Utah", nombre: "Sand Hollow", clase: "" },
] as const;

const CIFRAS = [
  { hasta: 10, sufijo: "", unidad: "años", texto: "como Golf Manager de FROSCH Latinoamérica" },
  { hasta: 95, sufijo: "+", unidad: "campos", texto: "jugados alrededor del mundo" },
  { hasta: 4, sufijo: "", unidad: "pasos", texto: "de la primera conversación al tee" },
] as const;

export default function NosotrosPage() {
  return (
    <>
      {/* ───────── Portada ───────── */}
      <section className="grano luz-cursor relative isolate -mt-20 overflow-hidden bg-[#071d16] pb-24 pt-36 text-crema sm:pt-44 lg:pb-32">
        <div className="hero-degradado absolute inset-0 -z-20" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_45%,transparent_30%,rgba(3,15,11,0.6)_100%)]"
        />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-1/2 -z-10 hidden -translate-y-1/2 lg:block">
          <div className="orbita orbita-gira aspect-square w-[620px]" />
          <div className="orbita orbita-gira-inversa aspect-square w-[860px] !border-white/10" />
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-[#f6f3ec]" />

        <div className="mx-auto grid w-full max-w-[1500px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-16 xl:px-24">
          <div>
            <span className="entra-hero inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-[#e8d3a0]">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#e8d3a0]" />
              Quiénes somos
            </span>
            <h1
              className="entra-hero mt-5 font-serif text-[2.6rem] leading-[1.04] text-white sm:text-6xl xl:text-7xl"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Golf de clase mundial, <Oro>a su medida</Oro>
            </h1>
            <p
              className="entra-hero mt-6 max-w-xl text-lg leading-relaxed text-crema/70"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Clubhouse es una agencia bespoke de viajes de golf. Cada viaje se diseña desde cero, alrededor de su
              juego, su grupo y su forma de viajar.
            </p>

            <dl
              className="entra-hero mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-7"
              style={{ "--i": 3 } as React.CSSProperties}
            >
              {CIFRAS.map((c) => (
                <div key={c.unidad}>
                  <dt className="font-serif text-4xl leading-none text-white sm:text-5xl">
                    <span className="texto-oro"><Contador hasta={c.hasta} sufijo={c.sufijo} /></span>
                  </dt>
                  <dd className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#e8d3a0]">{c.unidad}</dd>
                  <dd className="mt-1 hidden text-xs leading-snug text-crema/55 sm:block">{c.texto}</dd>
                </div>
              ))}
            </dl>

            <div className="entra-hero mt-10 flex flex-wrap gap-3" style={{ "--i": 4 } as React.CSSProperties}>
              <a
                href={MARCA.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-oro group inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold"
              >
                Escríbanos por WhatsApp
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                href="/experiencias"
                className="boton-cristal inline-flex min-h-12 items-center rounded-full px-7 text-sm font-medium"
              >
                Ver experiencias
              </Link>
            </div>
          </div>

          {/* Retrato en arco */}
          <div className="entra-hero relative mx-auto w-[min(78vw,24rem)] lg:ml-auto lg:mr-0 lg:w-full lg:max-w-[27rem]" style={{ "--i": 2 } as React.CSSProperties}>
            <div aria-hidden className="absolute -inset-4 rounded-t-[999px] rounded-b-[2.75rem] border border-[#c6a664]/35" />
            <div aria-hidden className="absolute -inset-9 hidden rounded-t-[999px] rounded-b-[3.5rem] border border-white/10 sm:block" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.75)] ring-1 ring-[#c6a664]/50">
              <Image
                src="/fotos/director.webp"
                alt={`${MARCA.director}, fundador y director de Clubhouse`}
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 430px"
                className="object-cover object-[50%_18%]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#071d16]/70 via-transparent to-transparent" />
            </div>

            <div className="absolute -left-3 bottom-8 rounded-2xl border border-white/20 bg-[#071d16]/70 px-4 py-3 shadow-xl backdrop-blur-md sm:-left-8">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#e8d3a0]">Fundador y director</p>
              <p className="mt-0.5 font-serif text-lg leading-tight text-white">Juan Manuel Morales</p>
            </div>
            <div className="absolute -right-2 top-10 grid h-20 w-20 place-items-center rounded-full border border-[#c6a664]/50 bg-[#071d16]/75 text-center shadow-xl backdrop-blur-md sm:-right-6 sm:h-24 sm:w-24">
              <span className="font-serif text-2xl leading-none text-[#ecd396] sm:text-3xl">
                95+
                <span className="mt-0.5 block text-[8px] font-sans uppercase tracking-[0.16em] text-crema/70 sm:text-[9px]">campos</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Manifiesto ───────── */}
      <section className="perla px-6 py-24 sm:px-10 sm:py-32 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-[1300px]">
          <div className="revela mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-champagne">
              <span className="h-px w-8 bg-current opacity-60" />
              Cómo pensamos
              <span className="h-px w-8 bg-current opacity-60" />
            </span>
            <h2 className="mt-6 font-serif text-4xl leading-[1.1] text-carbon sm:text-6xl">
              En lugar de una web que solo muestra fotos, construimos una <Oro>agencia</Oro>
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-niebla">
              Entendemos su juego, diseñamos el itinerario, reservamos cada detalle y le acompañamos durante todo el
              viaje.
            </p>
          </div>

          <ul className="mt-20 grid gap-y-14 md:grid-cols-3 md:gap-y-0">
            {PILARES.map(({ icono: Icono, titulo, texto }, i) => (
              <li
                key={titulo}
                className="revela group relative px-2 md:px-10 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-arena"
              >
                <span
                  aria-hidden
                  className="absolute -top-6 left-2 select-none font-serif text-[7rem] leading-none text-champagne/[0.12] transition-colors duration-500 group-hover:text-champagne/25 md:left-10"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#f3dfa8] via-[#d9b96a] to-[#a98745] text-[#14251d] shadow-lg shadow-champagne/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icono size={24} strokeWidth={1.75} />
                </span>
                <h3 className="relative mt-7 font-serif text-2xl text-carbon">{titulo}</h3>
                <span aria-hidden className="relative mt-4 block h-px w-10 bg-gradient-to-r from-champagne to-transparent transition-all duration-500 group-hover:w-24" />
                <p className="relative mt-4 leading-relaxed text-niebla">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Campos ───────── */}
      <section className="grano luz-cursor relative isolate overflow-hidden bg-[#071d16] px-6 py-24 text-crema sm:px-10 sm:py-28 lg:px-16 xl:px-24">
        <div className="hero-degradado absolute inset-0 -z-10 opacity-60" />
        <div className="mx-auto max-w-[1500px]">
          <div className="revela">
            <EncabezadoSeccion
              oscuro
              eyebrow="Donde jugamos"
              titulo={
                <>
                  Campos que ya forman parte de <Oro>nuestras experiencias</Oro>
                </>
              }
              descripcion="Recorridos de Tailandia y Utah, elegidos uno por uno por nuestro equipo."
            />
          </div>

          <ul className="grid auto-rows-[13rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] sm:gap-4 lg:grid-cols-4 lg:auto-rows-[17rem]">
            {CAMPOS.map((c, i) => (
              <li
                key={c.nombre}
                style={{ "--r": i % 4 } as React.CSSProperties}
                className={`revela group relative overflow-hidden rounded-[1.5rem] ring-1 ring-white/10 transition-all duration-500 hover:ring-[#c6a664]/60 ${c.clase}`}
              >
                <Image
                  src={c.foto}
                  alt={`${c.nombre}, ${c.pais}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#04140e]/90 via-[#04140e]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#e8d3a0]">{c.pais}</p>
                  <p className="mt-1 font-serif text-lg leading-tight text-white sm:text-xl">{c.nombre}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="revela mt-12 text-center">
            <Link
              href="/experiencias"
              className="boton-cristal group inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-sm font-medium"
            >
              Conocer las experiencias
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Fundador ───────── */}
      <section className="perla px-6 py-24 sm:px-10 sm:py-32 lg:px-16 xl:px-24">
        <div className="mx-auto grid max-w-[1300px] items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="revela relative lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-arena shadow-[0_40px_90px_-40px_rgba(11,43,33,0.65)]">
              <Image
                src="/fotos/director-faldo.webp"
                alt="Juan Manuel Morales con Nick Faldo"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#04140e]/55 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-6 right-6 font-serif text-lg italic text-white">
                Toda mi carrera ha girado alrededor del golf.
              </p>
            </div>
            <div aria-hidden className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border border-champagne/40" />
          </div>

          <div className="revela">
            <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-champagne">
              <span className="h-px w-8 bg-current opacity-60" />
              Quién está detrás
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-carbon sm:text-5xl">{MARCA.director}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-niebla">Fundador y director · Clubhouse</p>

            <div className="mt-8 space-y-5 text-lg leading-relaxed text-carbon">
              <p>
                Comunicador social y periodista. Toda mi carrera ha girado alrededor del golf: lo he contado como
                periodista y columnista, lo he vivido como jugador aficionado en más de 95 campos alrededor del mundo y
                durante 10 años lo convertí en viajes como Golf Manager de FROSCH Latinoamérica, empresa del grupo JP
                Morgan Chase.
              </p>
              <p className="text-niebla">
                Hoy pongo esa experiencia, relacionamiento y conocimiento de primera mano de los mejores destinos de
                golf del mundo al servicio de cada cliente de Clubhouse.
              </p>
            </div>

            <h3 className="mt-12 text-xs font-semibold uppercase tracking-[0.26em] text-niebla">Trayectoria</h3>
            <ol className="relative mt-5 space-y-1 border-l border-arena pl-7">
              {TRAYECTORIA.map((t, i) => {
                const ultima = i === TRAYECTORIA.length - 1;
                const [lugar, ...resto] = t.split(" · ");
                return (
                  <li key={t} className="relative py-2.5">
                    <span
                      aria-hidden
                      className={
                        ultima
                          ? "absolute -left-[2.15rem] top-4 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-[#f3dfa8] to-[#a98745] ring-4 ring-champagne/20"
                          : "absolute -left-[1.95rem] top-[1.15rem] h-2.5 w-2.5 rounded-full border-2 border-champagne bg-crema"
                      }
                    />
                    <p className={ultima ? "font-serif text-xl text-carbon" : "font-medium text-carbon"}>{lugar}</p>
                    {resto.length > 0 && <p className="text-sm text-niebla">{resto.join(" · ")}</p>}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <SeccionProceso />
      <SeccionIncluye />
      <SeccionContacto />
    </>
  );
}
