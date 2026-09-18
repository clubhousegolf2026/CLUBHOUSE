import type { MetadataRoute } from "next";

/** Next.js sirve esto automáticamente en /manifest.webmanifest y lo enlaza
 *  solo en el <head> — no hace falta agregar el <link rel="manifest"> a mano. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clubhouse · Turismo de golf en Colombia",
    short_name: "Clubhouse",
    description:
      "Arma tu viaje de golf en Colombia: elige campos, hotel y fechas, mira el precio al instante y reserva en línea.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f6f3ec",
    theme_color: "#1f3b2f",
    lang: "es-CO",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
