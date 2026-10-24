import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getExperiencias } from "@/lib/contenido/experiencias-editables";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const experiencias = await getExperiencias();
  const fijas = ["", "/nosotros", "/contacto"].map(
    (ruta) => ({
      url: `${SITE_URL}${ruta}`,
      changeFrequency: "weekly" as const,
      priority: ruta === "" ? 1 : 0.8,
    }),
  );
  return [
    ...fijas,
    ...experiencias.map((e) => ({
      url: `${SITE_URL}/experiencias/${e.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
