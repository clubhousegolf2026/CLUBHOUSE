import type { Metadata } from "next";
import { fraunces, inter } from "@/lib/fonts";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { PageTransition } from "@/components/site/page-transition";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://clubhouse.co"),
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
