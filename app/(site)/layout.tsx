import type { Metadata, Viewport } from "next";
import { fraunces, inter } from "@/lib/fonts";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { PageTransition } from "@/components/site/page-transition";
import { RegistroServiceWorker } from "@/components/site/registro-service-worker";
import { JsonLd } from "@/components/site/json-ld";
import { SITE_NOMBRE, SITE_URL } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "./" },
  title: {
    default: "Clubhouse · Turismo de golf en Colombia",
    template: "%s · Clubhouse",
  },
  description:
    "Arma tu viaje de golf en Colombia: elige campos, hotel y fechas, mira el precio al instante y reserva en línea.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Clubhouse",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Clubhouse",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f3b2f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            name: SITE_NOMBRE,
            url: SITE_URL,
            logo: `${SITE_URL}/icons/icon-512.png`,
            description:
              "Paquetes de turismo de golf en Colombia: campos, hotel, transporte y anfitrión local.",
            areaServed: "CO",
            email: "hola@clubhouse.co",
            telephone: "+57 601 600 0000",
          }}
        />
        <RegistroServiceWorker />
        <Header />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
