import { Hero } from "@/components/marketing/hero";
import { MarquesinaCampos } from "@/components/marketing/marquesina-campos";
import { PackageCard } from "@/components/marketing/package-card";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Oro } from "@/components/marketing/pagina-hero";
import { SuenosScroll } from "@/components/marketing/suenos-scroll";
import { EXPERIENCIAS } from "@/lib/contenido/experiencias";
import {
  SeccionContacto,
  SeccionDestinos,
  SeccionDirector,
  SeccionIncluye,
  SeccionProceso,
} from "@/components/marketing/secciones-marca";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

export const revalidate = 300;

export default function HomePage() {
  // Las dos experiencias firmadas también se marcan en el globo.
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
    paquetes: [],
    experiencia: { slug: e.slug, desde: e.desde, fechas: e.fechas, duracion: e.duracion },
  }));
  const destinos = destinosExperiencia;
  // Las experiencias firmadas también salen como tarjetas junto a los paquetes.
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
      insignia: `${e.bandera} ${e.pais}`,
    };
  });
  const campos = [...new Set(destinos.flatMap((d) => d.campos))];

  return (
    <>
      <div className="flex min-h-[calc(100dvh-4.75rem)] flex-col sm:min-h-[calc(100dvh-5rem)]">
        <Hero destinos={destinos} />
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
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 xl:gap-8">
              {tarjetasExperiencia.map((p) => (
                <PackageCard key={p.id} paquete={p} />
              ))}
            </div>
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
