import { Hero } from "@/components/marketing/hero";
import { MarquesinaCampos } from "@/components/marketing/marquesina-campos";
import { FiltroPaquetes } from "@/components/marketing/filtro-paquetes";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Oro } from "@/components/marketing/pagina-hero";
import { Testimonios } from "@/components/marketing/testimonios";
import { Reveal } from "@/components/site/reveal";
import {
  SeccionContacto,
  SeccionDestinos,
  SeccionDirector,
  SeccionExperiencias,
  SeccionIncluye,
  SeccionProceso,
  SeccionSuenos,
} from "@/components/marketing/secciones-marca";
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
  const campos = [...new Set(destinos.flatMap((d) => d.campos))];

  return (
    <>
      <Hero destinos={destinos} />
      <MarquesinaCampos campos={campos} />

      <SeccionSuenos />
      <SeccionIncluye />
      <SeccionExperiencias />
      <SeccionDestinos />

      {paquetes.length > 0 && (
        <Reveal>
          <section
            id="planes"
            className="scroll-mt-24 bg-blanco-roto px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24"
          >
            <div className="mx-auto max-w-[1600px]">
              <EncabezadoSeccion
                eyebrow="Listos para reservar"
                titulo={
                  <>
                    Paquetes de golf en <Oro>Colombia</Oro>
                  </>
                }
                descripcion="Itinerarios cortos, ya armados, para jugar cerca de casa. Filtre por destino, duración, presupuesto o campo."
              />
              <FiltroPaquetes paquetes={paquetes} destinos={destinos} />
            </div>
          </section>
        </Reveal>
      )}

      <SeccionProceso />
      <SeccionDirector />

      {testimonios.length > 0 && (
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
                  Viajeros que ya <Oro>jugaron</Oro> con nosotros
                </>
              }
            />
            <Testimonios testimonios={testimonios} />
          </div>
        </section>
      )}

      <SeccionContacto />
    </>
  );
}
