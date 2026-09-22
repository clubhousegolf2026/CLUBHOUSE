import type { Metadata } from "next";
import { Flag, Plus, UserCheck, Zap } from "lucide-react";
import { PaginaHero, Oro } from "@/components/marketing/pagina-hero";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Quiénes somos y cómo funciona Clubhouse.",
};

const FAQ = [
  {
    q: "¿El precio del constructor es el precio final?",
    a: "Es un precio de referencia muy cercano al final. Antes de confirmar la reserva verificamos disponibilidad y tarifas vigentes; si hay algún ajuste te lo informamos antes de cobrar.",
  },
  {
    q: "¿Cómo pago?",
    a: "En línea, con tarjeta o PSE, a través de una pasarela colombiana (Wompi, ePayco o PayU). Reservas con el 30% de anticipo y el saldo antes del viaje.",
  },
  {
    q: "¿Qué pasa después de reservar?",
    a: "Recibes una confirmación automática con tu código de reserva e itinerario. Un anfitrión local te contacta para coordinar horarios de salida y traslados.",
  },
  {
    q: "¿Puedo cambiar la fecha?",
    a: "Sí, sujeto a disponibilidad y a las políticas de cada campo y hotel. Escríbenos con al menos 72 horas de anticipación.",
  },
];

const VALORES = [
  { icono: Flag, titulo: "Campos seleccionados", texto: "Trabajamos con los mejores campos del país y con hoteles escogidos uno a uno." },
  { icono: Zap, titulo: "Precio al instante", texto: "Eliges tu itinerario y ves el precio al momento, sin esperar cotizaciones." },
  { icono: UserCheck, titulo: "Anfitrión local", texto: "Un anfitrión te acompaña durante todo el viaje: horarios, traslados y detalles." },
];

export default function NosotrosPage() {
  return (
    <>
      <PaginaHero
        eyebrow="Quiénes somos"
        titulo={
          <>
            Golf en Colombia, <Oro>sin fricción</Oro>
          </>
        }
        descripcion="Clubhouse es una agencia de turismo de golf. Armar un viaje debería ser tan simple como jugar una ronda."
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
            En lugar de una web que solo muestra fotos, construimos una
            herramienta: eliges tu itinerario, ves el precio al instante,
            reservas en línea y te acompaña un anfitrión local durante todo el
            viaje.
          </p>
        </div>
      </section>

      <section className="grano relative isolate overflow-hidden bg-[#071d16] px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
        <div className="hero-degradado absolute inset-0 -z-10 opacity-70" />
        <div className="mx-auto max-w-3xl">
          <EncabezadoSeccion
            oscuro
            eyebrow="Preguntas frecuentes"
            titulo={
              <>
                Antes de <Oro>reservar</Oro>
              </>
            }
          />
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md transition-colors open:border-[#c6a664]/40 open:bg-white/[0.09]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-serif text-lg text-white">{f.q}</h3>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/20 text-[#e8d3a0] transition-transform duration-300 group-open:rotate-45">
                    <Plus size={16} />
                  </span>
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-crema/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
