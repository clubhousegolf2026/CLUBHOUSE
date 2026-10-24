import type { Metadata, Viewport } from "next";
import { fraunces, inter } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

/** Formularios y pagos: páginas sueltas, sin menú ni pie, para compartir por enlace
 *  o incrustar en otro sitio. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Clubhouse", template: "%s · Clubhouse" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f3b2f",
};

export default function EmbedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
