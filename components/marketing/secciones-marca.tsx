import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  Car,
  Landmark,
  Plane,
  UtensilsCrossed,
} from "lucide-react";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Oro } from "@/components/marketing/pagina-hero";
import {
  CONTINENTES,
  INCLUYE,
  MARCA,
  PASOS,
  SUENOS,
  TRAYECTORIA,
} from "@/lib/contenido/clubhouse";
import { EXPERIENCIAS } from "@/lib/contenido/experiencias";

const ICONOS = [Plane, Car, BedDouble, CalendarCheck, UtensilsCrossed, Landmark];

/** Las preguntas del brochure sobre la foto de La Hacienda Alcaidesa. */
export function SeccionSuenos() {
  return (
    <section
      id="suenos"
      className="grano relative isolate scroll-mt-24 overflow-hidden bg-[#04140e] py-24 text-crema sm:py-32"
    >
      <Image
        src="/fotos/alcaidesa.webp"
        alt="Golfista en el green de La Hacienda Alcaidesa, Cádiz"
        fill
        sizes="100vw"
        className="-z-20 object-cover object-[center_30%] opacity-40"
      />
      <div
        aria-hidden
        className="-z-10 absolute inset-0 bg-gradient-to-b from-[#04140e] via-[#04140e]/75 to-[#04140e]"
      />

      <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
        <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#e8d3a0]">
          <span className="h-px w-8 bg-current opacity-60" />
          Los sueños del golfista
          <span className="h-px w-8 bg-current opacity-60" />
        </span>

        <ul className="mt-12 space-y-9">
          {SUENOS.map((s) => (
            <li
              key={s}
              className="font-serif text-xl italic leading-snug text-crema/85 sm:text-[1.7rem]"
            >
              {s}
            </li>
          ))}
        </ul>

        <p className="mt-14 border-t border-white/15 pt-10 font-serif text-2xl leading-snug text-white sm:text-3xl">
          Hay miles de sueños e historias como estas.{" "}
          <Oro>Clubhouse</Oro> las convierte en su próximo viaje.
        </p>
        <p className="mt-6 text-sm uppercase tracking-[0.2em] text-crema/45">
          {MARCA.director} · Director
        </p>
      </div>
    </section>
  );
}

/** Qué incluye un itinerario Clubhouse. */
export function SeccionIncluye() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-[1400px]">
        <EncabezadoSeccion
          eyebrow="Qué incluye"
          titulo={
            <>
              Itinerarios completos, <Oro>de puerta a puerta</Oro>
            </>
          }
          descripcion="Clubhouse nace para llevar a los golfistas a vivir experiencias de primer nivel en los mejores destinos de golf del mundo."
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUYE.map((item, i) => {
            const Icono = ICONOS[i];
            return (
              <li
                key={item.titulo}
                className="group rounded-[1.75rem] border border-arena/70 bg-white/70 p-7 shadow-[0_20px_50px_-30px_rgba(11,43,33,0.4)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-champagne/50 hover:shadow-[0_30px_60px_-28px_rgba(11,43,33,0.5)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#ecd396] to-[#a98745] text-[#1a1a1a] shadow-md shadow-champagne/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icono size={21} />
                </span>
                <h3 className="mt-5 font-serif text-xl text-carbon">{item.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-niebla">{item.texto}</p>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 text-center font-serif text-xl italic text-verde-golf">
          Con Clubhouse, todos sus viajes van por el fairway.
        </p>
      </div>
    </section>
  );
}

/** Las dos experiencias firmadas, en formato editorial. */
export function SeccionExperiencias() {
  return (
    <section
      id="experiencias"
      className="grano relative isolate scroll-mt-24 overflow-hidden bg-[#071d16] px-6 py-24 text-crema sm:px-10 sm:py-28 lg:px-16 xl:px-24"
    >
      <div className="hero-degradado absolute inset-0 -z-10 opacity-75" />
      <div className="mx-auto max-w-[1500px]">
        <EncabezadoSeccion
          oscuro
          eyebrow="Experiencias firmadas"
          titulo={
            <>
              Viajes que ya tienen <Oro>nombre y fecha</Oro>
            </>
          }
          descripcion="Dos itinerarios armados por nuestro equipo, listos para salir con su grupo."
        />

        <div className="grid gap-7 lg:grid-cols-2">
          {EXPERIENCIAS.map((e) => (
            <Link
              key={e.slug}
              href={`/experiencias/${e.slug}`}
              className="group relative flex min-h-[32rem] flex-col justify-end overflow-hidden rounded-[2rem] ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-2 hover:ring-[#c6a664]/50"
            >
              <Image
                src={e.foto}
                alt={e.fotoAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="-z-20 object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
              />
              <div
                aria-hidden
                className="-z-10 absolute inset-0 bg-gradient-to-t from-[#04140e] via-[#04140e]/55 to-transparent"
              />

              <div className="p-8 sm:p-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs text-white backdrop-blur">
                  <span aria-hidden>{e.bandera}</span> {e.pais}
                </span>
                <h3 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">
                  {e.nombre}
                </h3>
                <p className="mt-1.5 font-serif text-lg italic text-[#e8d3a0]">
                  {e.subtitulo}
                </p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-crema/70">
                  {e.resumen}
                </p>

                <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-5">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-crema/50">
                      {e.fechas} · {e.duracion}
                    </span>
                    <span className="mt-1 block font-serif text-2xl text-[#ecd396]">
                      Desde {e.desde}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                    Ver la experiencia
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 50 destinos en 5 continentes. */
export function SeccionDestinos() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-[1400px]">
        <EncabezadoSeccion
          eyebrow="Destinos"
          titulo={
            <>
              50 destinos en <Oro>5 continentes</Oro>
            </>
          }
          descripcion="Trabajamos en alianza con los mejores campos de golf y las principales cadenas hoteleras del mundo."
        />

        <ul className="divide-y divide-arena/70 border-y border-arena/70">
          {CONTINENTES.map((c) => (
            <li
              key={c.nombre}
              className="group grid items-baseline gap-2 py-7 transition-colors hover:bg-white/50 sm:grid-cols-[auto_1fr] sm:gap-10 sm:px-4"
            >
              <div className="flex items-baseline gap-4 sm:w-56">
                <span className="texto-oro font-serif text-4xl leading-none tabular-nums">
                  {String(c.total).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-2xl text-carbon">{c.nombre}</h3>
              </div>
              <p className="text-sm leading-relaxed text-niebla">{c.paises}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Cómo trabajamos: los cuatro pasos del brochure. */
export function SeccionProceso() {
  return (
    <section className="grano relative isolate overflow-hidden bg-[#061a13] px-6 py-24 text-crema sm:px-10 sm:py-28 lg:px-16 xl:px-24">
      <Image
        src="/fotos/dubai-creek.webp"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-20 object-cover opacity-25"
      />
      <div
        aria-hidden
        className="-z-10 absolute inset-0 bg-gradient-to-b from-[#061a13] via-[#061a13]/85 to-[#061a13]"
      />

      <div className="mx-auto max-w-[1400px]">
        <EncabezadoSeccion
          oscuro
          eyebrow="Cómo trabajamos"
          titulo={
            <>
              Su viaje, en <Oro>cuatro pasos</Oro>
            </>
          }
        />

        <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[12%] right-[12%] top-[3.5rem] hidden h-px bg-gradient-to-r from-transparent via-[#c6a664]/50 to-transparent lg:block"
          />
          {PASOS.map((p) => (
            <li
              key={p.n}
              className="group relative rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c6a664]/40 hover:bg-white/[0.09]"
            >
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#ecd396] to-[#a98745] font-serif text-xl text-[#1a1a1a] shadow-lg shadow-black/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                {p.n}
              </span>
              <h3 className="mt-6 font-serif text-xl text-white">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-crema/65">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Quién está detrás de Clubhouse. */
export function SeccionDirector() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-[1300px] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_1.15fr]">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-arena shadow-[0_40px_90px_-40px_rgba(11,43,33,0.6)]">
            <Image
              src="/fotos/director.webp"
              alt={`${MARCA.director}, director de Clubhouse`}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-4 hidden w-44 overflow-hidden rounded-2xl ring-4 ring-crema sm:block lg:-right-8 lg:w-52">
            <Image
              src="/fotos/director-faldo.webp"
              alt="Juan Manuel Morales con Nick Faldo"
              width={400}
              height={450}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-champagne">
            <span className="h-px w-8 bg-current opacity-60" />
            Quién está detrás
          </span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-carbon sm:text-5xl">
            {MARCA.director}
          </h2>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-niebla">
            Director · Clubhouse
          </p>

          <div className="mt-7 space-y-4 text-lg leading-relaxed text-carbon">
            <p>
              Comunicador social y periodista. Toda mi carrera ha girado
              alrededor del golf: lo he contado como periodista y columnista, lo
              he vivido como jugador aficionado en más de 95 campos alrededor
              del mundo y durante 10 años lo convertí en viajes como Golf
              Manager de FROSCH Latinoamérica, empresa del grupo JP Morgan
              Chase.
            </p>
            <p className="text-niebla">
              Hoy pongo esa experiencia, relacionamiento y conocimiento de
              primera mano de los mejores destinos de golf del mundo al servicio
              de cada cliente de Clubhouse.
            </p>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {TRAYECTORIA.map((t) => (
              <li
                key={t}
                className="rounded-full border border-arena bg-white/70 px-3.5 py-1.5 text-xs text-niebla"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Cierre: hablemos de su próximo viaje. */
export function SeccionContacto() {
  return (
    <section className="px-6 pb-24 sm:px-10 lg:px-16 xl:px-24">
      <div className="grano relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[2.5rem] bg-[#071d16] px-8 py-16 text-center text-crema shadow-[0_40px_90px_-30px_rgba(7,29,22,0.8)] sm:px-16 sm:py-20">
        <Image
          src="/fotos/chee-chan.webp"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="-z-20 object-cover opacity-30"
        />
        <div
          aria-hidden
          className="-z-10 absolute inset-0 bg-gradient-to-b from-[#071d16]/85 via-[#071d16]/90 to-[#071d16]"
        />

        <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#e8d3a0]">
          <span className="h-px w-8 bg-current opacity-60" />
          Contacto
          <span className="h-px w-8 bg-current opacity-60" />
        </span>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.08] text-white sm:text-6xl">
          Hablemos de su próximo <Oro>viaje de golf</Oro>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-crema/70">
          Cuéntenos qué tiene en mente y diseñamos el itinerario a su medida.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href={MARCA.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="boton-oro group inline-flex min-h-13 items-center gap-2 rounded-full px-8 text-sm font-semibold"
          >
            WhatsApp {MARCA.whatsapp}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href={`mailto:${MARCA.email}`}
            className="boton-cristal inline-flex min-h-13 items-center rounded-full px-8 text-sm font-medium"
          >
            {MARCA.email}
          </a>
        </div>

        <p className="mt-12 font-serif text-2xl italic text-[#e8d3a0]">
          {MARCA.cierre}
        </p>
      </div>
    </section>
  );
}
