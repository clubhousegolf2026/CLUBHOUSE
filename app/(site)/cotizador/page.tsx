import type { Metadata } from "next";
import { Constructor } from "@/components/cotizador/constructor";
import { getTarifas, getBloqueos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Arme su viaje",
  description:
    "Constructor de itinerarios de golf: elija campos, hotel, transporte y fecha con el precio actualizándose en pantalla.",
};

// El cotizador recalcula en cliente; los datos se revalidan cada hora.
export const revalidate = 3600;

export default async function CotizadorPage() {
  const [tarifas, bloqueos] = await Promise.all([getTarifas(), getBloqueos()]);
  return <Constructor tarifas={tarifas} bloqueos={bloqueos} />;
}
