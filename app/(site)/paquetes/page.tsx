import type { Metadata } from "next";
import { PackageCard } from "@/components/marketing/package-card";
import { Section, SectionHead } from "@/components/ui/section";
import { getPaquetes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Paquetes de golf",
  description:
    "Paquetes de turismo de golf en Colombia listos para reservar: campos, hotel, transporte y fechas incluidos.",
};

export const revalidate = 3600;

export default async function PaquetesPage() {
  const paquetes = await getPaquetes();

  return (
    <Section>
      <SectionHead
        eyebrow="Listos para reservar"
        titulo="Nuestros paquetes"
        descripcion="Itinerarios ya armados por nuestro equipo. ¿Quieres algo distinto? Arma el tuyo en el constructor."
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paquetes.map((p) => (
          <PackageCard key={p.id} paquete={p} />
        ))}
      </div>
    </Section>
  );
}
