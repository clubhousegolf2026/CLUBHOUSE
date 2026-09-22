import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Moon, Sun, X } from "lucide-react";
import { cop } from "@/lib/format";
import { getPaquetes, getPaquetePorSlug } from "@/lib/data";
import { JsonLd } from "@/components/site/json-ld";
import { SITE_URL } from "@/lib/site";

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
    alternates: { canonical: `/paquetes/${p.slug}` },
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

  const portada = p.galeria[0];
  const resto = p.galeria.slice(1);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.nombre,
          description: p.descripcion,
          image: p.galeria.map((g) => g.url),
          url: `${SITE_URL}/paquetes/${p.slug}`,
          brand: { "@type": "Brand", name: "Clubhouse" },
          offers: {
            "@type": "Offer",
            priceCurrency: "COP",
            price: p.precioDesdeCop,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/paquetes/${p.slug}`,
          },
        }}
      />

      {/* Portada a sangre con el título sobre la foto */}
      <header className="grano relative isolate -mt-20 flex min-h-[78dvh] items-end overflow-hidden bg-[#071d16] pb-14 pt-32 text-crema">
        {portada ? (
          <Image
            src={portada.url}
            alt={portada.alt}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
        ) : (
          <div className="hero-degradado absolute inset-0 -z-20" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#04140e] via-[#04140e]/70 to-[#04140e]/35"
        />

        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <Link
            href="/paquetes"
            className="entra-hero inline-flex items-center gap-1.5 text-sm text-crema/70 transition-colors hover:text-[#ecd396]"
          >
            <ArrowLeft size={15} /> Todos los paquetes
          </Link>

          <div
            className="entra-hero mt-5 flex flex-wrap items-center gap-2 text-xs text-white/85"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {p.destacado && (
              <span className="rounded-full bg-gradient-to-r from-[#ecd396] to-[#b8913f] px-3.5 py-1.5 font-semibold uppercase tracking-wider text-[#1a1a1a]">
                Más elegido
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur">
              <Sun size={12} /> {p.dias} días
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur">
              <Moon size={12} /> {p.noches} noches
            </span>
          </div>

          <h1
            className="entra-hero mt-5 max-w-3xl font-serif text-[2.75rem] leading-[1.04] text-white sm:text-6xl"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {p.nombre}
          </h1>
          <p
            className="entra-hero mt-5 max-w-2xl text-lg leading-relaxed text-crema/80"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            {p.descripcion}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 pb-24 sm:px-10 lg:px-16">
        <div className="relative z-10 -mt-12 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          {/* Panel de precio */}
          <aside className="order-first rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-[0_30px_80px_-30px_rgba(11,43,33,0.45)] ring-1 ring-arena/60 backdrop-blur-xl lg:order-last lg:sticky lg:top-28">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-niebla">
              Desde
            </span>
            <p className="mt-1 font-serif text-4xl text-carbon tabular">
              {cop(p.precioDesdeCop)}
            </p>
            <p className="mt-1 text-sm text-niebla">por persona · base 2 pax</p>

            <Link
              href="/cotizador"
              className="boton-oro group mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold"
            >
              Personalizar y reservar
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-3 text-center text-xs text-niebla">
              Reservas con el 30% de anticipo
            </p>

            {p.camposIncluidos.length > 0 && (
              <div className="mt-7 border-t border-arena pt-6">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-niebla">
                  Campos incluidos
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {p.camposIncluidos.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-carbon">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verde-golf/10 text-verde-golf">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Contenido */}
          <div className="space-y-12">
            {resto.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {resto.map((g, i) => (
                  <div
                    key={g.url}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-arena ${
                      resto.length % 2 === 1 && i === 0 ? "sm:col-span-2 sm:aspect-[16/9]" : ""
                    }`}
                  >
                    <Image
                      src={g.url}
                      alt={g.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, 480px"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-arena/80 bg-white/70 p-7 backdrop-blur-sm">
                <h2 className="flex items-center gap-2.5 font-serif text-xl text-carbon">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-verde-golf/10 text-verde-golf">
                    <Check size={17} />
                  </span>
                  Incluye
                </h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {p.incluye.map((i) => (
                    <li key={i} className="flex gap-3 text-carbon">
                      <Check size={16} className="mt-0.5 shrink-0 text-verde-golf" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.75rem] border border-arena/80 bg-white/40 p-7">
                <h2 className="flex items-center gap-2.5 font-serif text-xl text-carbon">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-alerta/10 text-alerta">
                    <X size={17} />
                  </span>
                  No incluye
                </h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {p.noIncluye.map((i) => (
                    <li key={i} className="flex gap-3 text-niebla">
                      <X size={16} className="mt-0.5 shrink-0 text-alerta/70" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
