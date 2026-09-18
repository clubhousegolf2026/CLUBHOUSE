import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Habla con un asesor de Clubhouse: cuéntanos tu viaje de golf en Colombia y te respondemos el mismo día hábil.",
  alternates: { canonical: "/contacto" },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
