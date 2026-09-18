import type { MetadataRoute } from "next";
import { getPaquetes } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paquetes = await getPaquetes();
  const fijas = ["", "/paquetes", "/cotizador", "/nosotros", "/contacto"].map(
    (ruta) => ({
      url: `${SITE_URL}${ruta}`,
      changeFrequency: "weekly" as const,
      priority: ruta === "" ? 1 : 0.8,
    }),
  );
  return [
    ...fijas,
    ...paquetes.map((p) => ({
      url: `${SITE_URL}/paquetes/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
