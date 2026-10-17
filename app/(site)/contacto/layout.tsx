import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Hable con un asesor de Clubhouse: cuéntenos su viaje de golf y le respondemos el mismo día hábil.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
