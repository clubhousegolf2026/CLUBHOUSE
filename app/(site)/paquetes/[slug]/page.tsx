import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { cop } from "@/lib/format";
import { getPaquetes, getPaquetePorSlug } from "@/lib/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPaquetes()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPaquetePorSlug(slug);
  if (!p) return { title: "Paquete no encontrado" };
  return {
    title: p.nombre,
    description: p.descripcion,
    openGraph: {
      images: p.galeria[0] ? [p.galeria[0].url] : [],
      title: p.nombre,
      description: p.descripcion,
    },
  };
}

export default async function PaqueteDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPaquetePorSlug(slug);
  if (!p) notFound();

  return (
    <article className="py-10">
      <Container>
        <Link href="/paquetes" className="text-sm text-niebla hover:text-carbon">
          ← Todos los paquetes
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-panel)] bg-arena">
              {p.galeria[0] && (
                <Image
                  src={p.galeria[0].url}
                  alt={p.galeria[0].alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
              )}
            </div>
            {p.galeria.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {p.galeria.slice(1).map((g) => (
                  <div
                    key={g.url}
                    className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)]"
                  >
                    <Image
                      src={g.url}
                      alt={g.alt}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif text-3xl text-carbon">{p.nombre}</h1>
            <p className="mt-1 text-sm text-niebla">
              {p.dias} días · {p.noches} noches
            </p>
            <p className="mt-4 leading-relaxed text-carbon">{p.descripcion}</p>

            <div className="mt-6 rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-5">
              <span className="text-xs text-niebla">Desde</span>
              <p className="font-serif text-2xl text-verde-golf tabular">
                {cop(p.precioDesdeCop)}
              </p>
              <p className="text-xs text-niebla">por persona · base 2 pax</p>
              <ButtonLink href="/cotizador" className="mt-4 w-full">
                Personalizar y reservar <ArrowRight size={16} />
              </ButtonLink>
            </div>

            <div className="mt-6">
              <h2 className="font-serif text-lg text-carbon">Campos incluidos</h2>
              <ul className="mt-2 space-y-1 text-sm text-carbon">
                {p.camposIncluidos.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <Check size={15} className="text-verde-golf" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-lg text-carbon">Incluye</h2>
            <ul className="mt-3 space-y-2 text-sm text-carbon">
              {p.incluye.map((i) => (
                <li key={i} className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-verde-golf" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-lg text-carbon">No incluye</h2>
            <ul className="mt-3 space-y-2 text-sm text-niebla">
              {p.noIncluye.map((i) => (
                <li key={i} className="flex gap-2">
                  <X size={16} className="mt-0.5 shrink-0 text-alerta" /> {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </article>
  );
}
