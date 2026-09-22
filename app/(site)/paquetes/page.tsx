import type { Metadata } from "next";
import { FiltroPaquetes } from "@/components/marketing/filtro-paquetes";
import { PaginaHero, Oro } from "@/components/marketing/pagina-hero";
import { getDestinosConPaquetes, getPaquetes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Paquetes de golf",
  description:
    "Paquetes de turismo de golf en Colombia listos para reservar: campos, hotel, transporte y fechas incluidos.",
};

export const revalidate = 3600;

export default async function PaquetesPage() {
  const [paquetes, destinos] = await Promise.all([
    getPaquetes(),
    getDestinosConPaquetes(),
  ]);

  return (
    <>
      <PaginaHero
        eyebrow="Listos para reservar"
        titulo={
          <>
            Nuestros <Oro>paquetes</Oro> de golf
          </>
        }
        descripcion="Itinerarios ya armados por nuestro equipo. ¿Quieres algo distinto? Arma el tuyo en el constructor."
      />
      <section className="px-6 pb-24 sm:px-10 lg:px-16 xl:px-24">
        <div className="relative z-10 mx-auto -mt-8 max-w-[1600px]">
          <FiltroPaquetes paquetes={paquetes} destinos={destinos} />
        </div>
      </section>
    </>
  );
}
