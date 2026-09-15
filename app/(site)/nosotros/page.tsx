import type { Metadata } from "next";
import { Section, SectionHead } from "@/components/ui/section";

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

export default function NosotrosPage() {
  return (
    <>
      <Section>
        <SectionHead
          eyebrow="Quiénes somos"
          titulo="Golf en Colombia, sin fricción"
        />
        <div className="max-w-2xl space-y-4 leading-relaxed text-carbon">
          <p>
            Clubhouse es una agencia de turismo de golf. Trabajamos con los
            mejores campos del país y con hoteles seleccionados para que armar un
            viaje sea tan simple como jugar una ronda.
          </p>
          <p>
            En lugar de una web que solo muestra fotos, construimos una
            herramienta: eliges tu itinerario, ves el precio al instante,
            reservas en línea y te acompaña un anfitrión local durante todo el
            viaje.
          </p>
        </div>
      </Section>

      <Section className="bg-blanco-roto">
        <SectionHead eyebrow="Preguntas frecuentes" titulo="Antes de reservar" />
        <dl className="max-w-2xl divide-y divide-arena">
          {FAQ.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-serif text-lg text-carbon">{f.q}</dt>
              <dd className="mt-2 text-niebla">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}
