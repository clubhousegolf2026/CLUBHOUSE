import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { EXPERIENCIAS } from "@/lib/contenido/experiencias";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const fijas = ["", "/nosotros", "/contacto"].map(
    (ruta) => ({
      url: `${SITE_URL}${ruta}`,
      changeFrequency: "weekly" as const,
      priority: ruta === "" ? 1 : 0.8,
    }),
  );
  return [
    ...fijas,
    ...EXPERIENCIAS.map((e) => ({
      url: `${SITE_URL}/experiencias/${e.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
