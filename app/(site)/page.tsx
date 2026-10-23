import { Hero } from "@/components/marketing/hero";
import { MarquesinaCampos } from "@/components/marketing/marquesina-campos";
import { FiltroPaquetes } from "@/components/marketing/filtro-paquetes";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Oro } from "@/components/marketing/pagina-hero";
import { Testimonios } from "@/components/marketing/testimonios";
import { SuenosScroll } from "@/components/marketing/suenos-scroll";
import { EXPERIENCIAS } from "@/lib/contenido/experiencias";
import {
  SeccionContacto,
  SeccionDestinos,
  SeccionDirector,
  SeccionExperiencias,
  SeccionIncluye,
  SeccionProceso,
} from "@/components/marketing/secciones-marca";
import {
  getDestinosConPaquetes,
  getPaquetes,
  getTestimonios,
} from "@/lib/data";

export const revalidate = 300;

export default async function HomePage() {
  const [destinosCatalogo, paquetes, testimonios] = await Promise.all([
    getDestinosConPaquetes(),
    getPaquetes(),
    getTestimonios(),
  ]);
  // Las dos experiencias firmadas también se marcan en el globo.
  const destinosExperiencia: typeof destinosCatalogo = EXPERIENCIAS.map((e) => ({
    id: `exp-${e.slug}`,
    nombre: e.nombre,
    region: e.subtitulo,
    pais: e.pais,
    coordenadas: e.coordenadas,
    resumen: e.resumen,
    campos: e.rondas.map((r) => r.nombre),
    slugsPaquetes: [],
    disponible: true,
    foto: e.foto,
    paquetes: [],
    experiencia: { slug: e.slug, desde: e.desde, fechas: e.fechas, duracion: e.duracion },
  }));
  const destinos = [...destinosCatalogo, ...destinosExperiencia];
  // Las experiencias firmadas también salen como tarjetas junto a los paquetes.
  const tarjetasExperiencia: typeof paquetes = EXPERIENCIAS.map((e) => {
    const noches = Number(/(\d+)\s*noches/.exec(e.duracion)?.[1] ?? 0);
    return {
      id: `exp-${e.slug}`,
      slug: e.slug,
      nombre: e.nombre,
      descripcion: e.resumen,
      camposIncluidos: e.rondas.map((r) => r.nombre),
      noches,
      dias: noches + 1,
      precioDesdeCop: 0,
      galeria: [{ url: e.foto, alt: e.fotoAlt }],
      incluye: e.incluye,
      noIncluye: e.noIncluye,
      destacado: false,
      href: `/experiencias/${e.slug}`,
      precioTexto: e.desde,
      insignia: `${e.bandera} ${e.pais}`,
    };
  });
  const campos = [...new Set(destinos.flatMap((d) => d.campos))];

  return (
    <>
      <Hero destinos={destinos} />
      <MarquesinaCampos campos={campos} />

      <SuenosScroll>
        {paquetes.length > 0 && (
          <section
            id="planes"
            className="scroll-mt-24 bg-blanco-roto px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24"
          >
            <div className="mx-auto max-w-[1600px]">
              <EncabezadoSeccion
                eyebrow="Listos para reservar"
                titulo={
                  <>
                    Planes de golf <Oro>listos para reservar</Oro>
                  </>
                }
                descripcion="Viajes internacionales con fecha, y itinerarios cortos para jugar cerca de casa. Filtre por destino, duración, presupuesto o campo."
              />
              <FiltroPaquetes
                paquetes={paquetes}
                destinos={destinos}
                experiencias={tarjetasExperiencia}
              />
            </div>
          </section>
        )}
      </SuenosScroll>
      <SeccionIncluye />
      <SeccionExperiencias />
      <SeccionDestinos />


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
