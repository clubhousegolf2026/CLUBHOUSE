import type { Metadata } from "next";
import { FiltroPaquetes } from "@/components/marketing/filtro-paquetes";
import { Section, SectionHead } from "@/components/ui/section";
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
    <Section>
      <SectionHead
        eyebrow="Listos para reservar"
        titulo="Nuestros paquetes"
        descripcion="Itinerarios ya armados por nuestro equipo. ¿Quieres algo distinto? Arma el tuyo en el constructor."
      />
      <FiltroPaquetes paquetes={paquetes} destinos={destinos} />
    </Section>
  );
}
