import type { Metadata } from "next";
import { fraunces, inter } from "@/lib/fonts";
import "../globals.css";

// /admin es un root layout aparte (patrón de "multiple root layouts" de
// Next.js): no lleva el Header/Footer/PageTransition de la vitrina pública
// — es una herramienta de trabajo, no la marca de cara al cliente.
export const metadata: Metadata = {
  title: { default: "Panel · Club House", template: "%s · Panel Club House" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
