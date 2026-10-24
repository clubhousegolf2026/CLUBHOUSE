import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperienciaEditable } from "@/lib/contenido/experiencias-editables";
import { ExperienciaForm } from "@/components/admin/experiencia-form";

export const dynamic = "force-dynamic";

export default async function EditarExperienciaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getExperienciaEditable(slug);
  if (!e) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/paquetes" className="text-sm text-niebla hover:text-carbon">← Volver a paquetes</Link>
        <h1 className="mt-2 font-serif text-2xl text-carbon"><span aria-hidden>{e.bandera}</span> {e.nombre}</h1>
        <p className="text-sm text-niebla">
          Lo que cambies aquí se actualiza en el inicio, en los planes, en el globo y en la página del viaje.{" "}
          <Link href={`/experiencias/${e.slug}`} target="_blank" className="text-verde-golf hover:underline">Ver en el sitio</Link>
        </p>
      </div>
      <ExperienciaForm
        slug={e.slug}
        valores={{
          nombre: e.nombre, subtitulo: e.subtitulo, fechas: e.fechas, duracion: e.duracion,
          desde: e.desde, resumen: e.resumen, titularLargo: e.titularLargo, descripcionLarga: e.descripcionLarga,
        }}
      />
      <p className="max-w-3xl text-xs text-niebla">
        El programa día a día, los campos, los hoteles y las tarifas detalladas de cada viaje todavía
        se cambian en el código del sitio.
      </p>
    </div>
  );
}
