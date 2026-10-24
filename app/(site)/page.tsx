import { Hero } from "@/components/marketing/hero";
import { MarquesinaCampos } from "@/components/marketing/marquesina-campos";
import { FiltroPaquetes } from "@/components/marketing/filtro-paquetes";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Oro } from "@/components/marketing/pagina-hero";
import { SuenosScroll } from "@/components/marketing/suenos-scroll";
import { getExperiencias } from "@/lib/contenido/experiencias-editables";
import {
  SeccionContacto,
  SeccionDestinos,
  SeccionDirector,
  SeccionIncluye,
  SeccionProceso,
} from "@/components/marketing/secciones-marca";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

export const revalidate = 300;

export default async function HomePage() {
  const EXPERIENCIAS = await getExperiencias();
  // Las experiencias firmadas son los planes de la página.
  const tarjetasExperiencia: PaquetePredefinido[] = EXPERIENCIAS.map((e) => {
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
      precioNumero: Number(e.desde.replace(/\D/g, "")),
      moneda: "USD" as const,
      insignia: `${e.bandera} ${e.pais}`,
    };
  });
  // Y las mismas dos se marcan en el globo.
  const destinosExperiencia: (Destino & { paquetes: PaquetePredefinido[] })[] = EXPERIENCIAS.map((e) => ({
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
    paquetes: tarjetasExperiencia.filter((t) => t.slug === e.slug),
    experiencia: { slug: e.slug, desde: e.desde, fechas: e.fechas, duracion: e.duracion },
  }));
  // El globo no lista paquetes (la ficha de experiencia ya enlaza al itinerario).
  const destinosGlobo = destinosExperiencia.map((d) => ({ ...d, paquetes: [] }));
  const destinos = destinosExperiencia;
  const campos = [...new Set(destinosGlobo.flatMap((d) => d.campos))];

  return (
    <>
      <div className="flex min-h-[calc(100dvh-4.75rem)] flex-col sm:min-h-[calc(100dvh-5rem)]">
        <Hero destinos={destinosGlobo} />
        <MarquesinaCampos campos={campos} />
      </div>

      <SuenosScroll>
        <section
          id="planes"
          className="scroll-mt-24 bg-blanco-roto px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24"
        >
          <div className="mx-auto max-w-[1600px]">
            <EncabezadoSeccion
              eyebrow="Experiencias firmadas"
              titulo={
                <>
                  Viajes que ya tienen <Oro>nombre y fecha</Oro>
                </>
              }
              descripcion="Dos itinerarios armados por nuestro equipo, listos para salir con su grupo."
            />
            <FiltroPaquetes paquetes={tarjetasExperiencia} destinos={destinos} />
          </div>
        </section>
      </SuenosScroll>
      <SeccionIncluye />
      <SeccionDestinos />


      <SeccionProceso />
      <SeccionDirector />

      <SeccionContacto />
    </>
  );
}
