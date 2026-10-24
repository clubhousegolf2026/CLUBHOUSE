import type { Metadata } from "next";
import { Flag, UserCheck, Zap } from "lucide-react";
import { PaginaHero, Oro } from "@/components/marketing/pagina-hero";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Quiénes somos y cómo funciona Clubhouse.",
};

const VALORES = [
  { icono: Flag, titulo: "Itinerario a la medida", texto: "Cada viaje se diseña desde cero, alrededor de su juego, su grupo y su forma de viajar." },
  { icono: Zap, titulo: "50 destinos en 5 continentes", texto: "América, Europa, Asia, África y Oceanía: los grandes campos del mundo en un mismo lugar." },
  { icono: UserCheck, titulo: "Años en el golf", texto: "Fundada y dirigida por Juan Manuel Morales Calderón, con 10 años como Golf Manager en FROSCH Latinoamérica." },
];

export default function NosotrosPage() {
  return (
    <>
      <PaginaHero
        eyebrow="Quiénes somos"
        titulo={
          <>
            Golf de clase mundial, <Oro>a su medida</Oro>
          </>
        }
        descripcion="Clubhouse es una agencia bespoke de viajes de golf. Cada viaje se diseña desde cero, alrededor de su juego, su grupo y su forma de viajar."
      />

      <section className="px-6 pb-20 sm:px-10 lg:px-16 xl:px-24">
        <div className="relative z-10 mx-auto -mt-8 grid max-w-[1400px] gap-5 md:grid-cols-3">
          {VALORES.map(({ icono: Icono, titulo, texto }) => (
            <div
              key={titulo}
              className="group rounded-[1.75rem] border border-white/80 bg-white/80 p-7 shadow-[0_24px_60px_-28px_rgba(11,43,33,0.45)] ring-1 ring-arena/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_70px_-28px_rgba(11,43,33,0.55)]"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#ecd396] to-[#a98745] text-[#1a1a1a] shadow-lg shadow-champagne/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                <Icono size={24} />
              </span>
              <h2 className="mt-6 font-serif text-xl text-carbon">{titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-niebla">{texto}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-3xl space-y-5 text-center text-lg leading-relaxed text-carbon">
          <p>
            En lugar de una web que solo muestra fotos, construimos una agencia:
            entendemos su juego, diseñamos el itinerario, reservamos cada
            detalle y le acompañamos durante todo el viaje.
          </p>
        </div>
      </section>

    </>
  );
}
