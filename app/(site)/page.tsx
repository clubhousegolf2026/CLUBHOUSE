import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, Flag, Layers } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { FiltroPaquetes } from "@/components/marketing/filtro-paquetes";
import { MarquesinaCampos } from "@/components/marketing/marquesina-campos";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Testimonios } from "@/components/marketing/testimonios";
import { Reveal } from "@/components/site/reveal";
import {
  getDestinosConPaquetes,
  getPaquetes,
  getTestimonios,
} from "@/lib/data";

export const revalidate = 300;

const PASOS = [
  { icono: Flag, titulo: "Elige tus campos", texto: "Uno o varios campos de golf, con más de una ronda si quieres." },
  { icono: Layers, titulo: "Suma tu viaje", texto: "Hotel, transporte y actividades, con el precio actualizándose en pantalla." },
  { icono: CalendarDays, titulo: "Escoge la fecha", texto: "Mira la disponibilidad real en el calendario y fija tus días." },
  { icono: CreditCard, titulo: "Reserva con el 30%", texto: "Confirma con un anticipo y recibe tu confirmación al instante." },
];

export default async function HomePage() {
  const [destinos, paquetes, testimonios] = await Promise.all([
    getDestinosConPaquetes(),
    getPaquetes(),
    getTestimonios(),
  ]);
  const campos = [...new Set(destinos.flatMap((d) => d.campos))];

  return (
    <>
      <Hero destinos={destinos} />
      <MarquesinaCampos campos={campos} />

      <Reveal>
        <section id="planes" className="scroll-mt-24 px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
          <div className="mx-auto max-w-[1600px]">
            <EncabezadoSeccion
              eyebrow="Listos para reservar"
              titulo={
                <>
                  Encuentra tu <em className="texto-oro pr-1 font-medium italic">plan</em> ideal
                </>
              }
              descripcion="Itinerarios ya armados por nuestro equipo. Filtra por destino, duración, presupuesto o campo de golf."
            />
            <FiltroPaquetes paquetes={paquetes} destinos={destinos} />
          </div>
        </section>
      </Reveal>

      <section className="grano relative isolate overflow-hidden bg-[#071d16] px-6 py-24 text-crema sm:px-10 sm:py-28 lg:px-16 xl:px-24">
        <div className="hero-degradado absolute inset-0 -z-10 opacity-80" />
        <div aria-hidden className="pointer-events-none absolute -right-40 top-1/2 -z-10 hidden lg:block">
          <div className="orbita orbita-gira aspect-square w-[620px]" />
        </div>
        <div className="mx-auto max-w-[1400px]">
          <EncabezadoSeccion
            oscuro
            eyebrow="A tu medida"
            titulo={
              <>
                ¿Prefieres armarlo{" "}
                <em className="texto-oro pr-1 font-medium italic">a tu medida</em>?
              </>
            }
            descripcion="Nuestro constructor te deja elegir todo paso a paso, con el precio actualizándose en pantalla. Sin llamadas ni esperas de tres días por una cotización."
          />

          <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden
              className="pointer-events-none absolute left-[12%] right-[12%] top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-[#c6a664]/50 to-transparent lg:block"
            />
            {PASOS.map(({ icono: Icono, titulo, texto }, i) => (
              <li
                key={titulo}
                className="group relative rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c6a664]/40 hover:bg-white/[0.09]"
              >
                <span className="absolute right-6 top-5 font-serif text-6xl leading-none text-transparent [-webkit-text-stroke:1px_rgba(198,166,100,0.45)]">
                  0{i + 1}
                </span>
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#ecd396] to-[#a98745] text-[#1a1a1a] shadow-lg shadow-black/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                  <Icono size={24} />
                </span>
                <h3 className="mt-6 font-serif text-xl text-white">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-crema/65">{texto}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <Link
              href="/cotizador"
              className="boton-oro group inline-flex min-h-13 items-center gap-2 rounded-full px-9 py-3.5 text-sm font-semibold"
            >
              Arma tu viaje ahora
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grano relative isolate overflow-hidden bg-[#061a13] px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#c6a664]/60 to-transparent"
        />
        <div className="mx-auto max-w-[1400px]">
          <EncabezadoSeccion
            oscuro
            eyebrow="Lo que dicen"
            titulo={
              <>
                Viajeros que ya{" "}
                <em className="texto-oro pr-1 font-medium italic">jugaron</em> con nosotros
              </>
            }
          />
          <Testimonios testimonios={testimonios} />
        </div>
      </section>

      <section className="px-6 py-24 sm:px-10 lg:px-16 xl:px-24">
        <div className="grano relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[2.5rem] bg-[#071d16] px-8 py-16 text-center text-crema shadow-[0_40px_90px_-30px_rgba(7,29,22,0.8)] sm:px-16 sm:py-20">
          <div className="hero-degradado absolute inset-0 -z-10" />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="orbita orbita-gira aspect-square w-[520px]" />
            <div className="orbita orbita-gira-inversa aspect-square w-[820px] !border-white/10" />
          </div>
          <span className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-[#e8d3a0]">
            <span className="h-px w-8 bg-current opacity-60" />
            ¿Dudas antes de reservar?
            <span className="h-px w-8 bg-current opacity-60" />
          </span>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.08] text-white sm:text-6xl">
            Tu próximo <em className="texto-oro pr-1 font-medium italic">green</em> te está esperando
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-crema/70">
            Escríbenos y un asesor te ayuda a definir el viaje. Respondemos el
            mismo día hábil.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contacto"
              className="boton-oro group inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold"
            >
              Hablar con un asesor
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/nosotros"
              className="boton-cristal inline-flex min-h-12 items-center rounded-full px-8 text-sm font-medium"
            >
              Respuestas frecuentes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
