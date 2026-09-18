import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/marketing/hero";
import { FiltroPaquetes } from "@/components/marketing/filtro-paquetes";
import { Testimonios } from "@/components/marketing/testimonios";
import { Section, SectionHead } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/site/reveal";
import {
  getDestinosConPaquetes,
  getPaquetes,
  getTestimonios,
} from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [destinos, paquetes, testimonios] = await Promise.all([
    getDestinosConPaquetes(),
    getPaquetes(),
    getTestimonios(),
  ]);

  return (
    <>
      <Hero destinos={destinos} />

      <Reveal>
        <Section
          containerClassName="max-w-[1920px] px-6 sm:px-10 lg:px-16 xl:px-24"
        >
          <SectionHead
            eyebrow="Listos para reservar"
            titulo="Encuentra tu plan"
            descripcion="Filtra por destino, duración, presupuesto o campo de golf."
          />
          <FiltroPaquetes paquetes={paquetes} destinos={destinos} />
        </Section>
      </Reveal>

      <Reveal>
        <Section>
          <div className="grid items-center gap-10 rounded-[var(--radius-panel)] bg-verde-calle p-10 text-crema lg:grid-cols-2 lg:p-14">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl">
                ¿Prefieres armarlo a tu medida?
              </h2>
              <p className="mt-4 text-crema/85">
                Nuestro constructor te deja elegir campos, hotel, transporte y
                actividades paso a paso, con el precio actualizándose en pantalla.
                Sin llamadas ni esperas de tres días por una cotización.
              </p>
              <ButtonLink
                href="/cotizador"
                className="mt-8 bg-champagne text-carbon hover:bg-champagne/90"
              >
                Arma tu viaje ahora
              </ButtonLink>
            </div>
            <ol className="space-y-4 text-sm">
              {[
                "Elige uno o varios campos de golf",
                "Suma hotel, transporte y actividades",
                "Escoge la fecha en el calendario",
                "Reserva con el 30% y recibe tu confirmación",
              ].map((paso, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-champagne text-carbon font-serif">
                    {i + 1}
                  </span>
                  <span className="pt-1 text-crema/90">{paso}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <Section className="bg-blanco-roto">
          <SectionHead eyebrow="Lo que dicen" titulo="Viajeros que ya jugaron con nosotros" />
          <Testimonios testimonios={testimonios} />
        </Section>
      </Reveal>

      <Reveal>
        <Section>
          <Container className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-10 text-center">
            <h2 className="font-serif text-3xl text-carbon">
              ¿Dudas antes de reservar?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-niebla">
              Escríbenos y un asesor te ayuda a definir el viaje. Respondemos el
              mismo día hábil.
            </p>
            <ButtonLink href="/contacto" className="mt-6">
              Hablar con un asesor
            </ButtonLink>
            <p className="mt-4 text-sm text-niebla">
              o mira las{" "}
              <Link href="/nosotros" className="text-verde-golf underline">
                respuestas frecuentes
              </Link>
            </p>
          </Container>
        </Section>
      </Reveal>
    </>
  );
}
