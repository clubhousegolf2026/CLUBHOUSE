import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { EXPERIENCIAS } from "@/lib/contenido/experiencias";
import { getExperiencias } from "@/lib/contenido/experiencias-editables";
import { MARCA } from "@/lib/contenido/clubhouse";
import { EncabezadoSeccion } from "@/components/marketing/encabezado-seccion";
import { Oro } from "@/components/marketing/pagina-hero";
import { JsonLd } from "@/components/site/json-ld";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

export function generateStaticParams() {
  return EXPERIENCIAS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = (await getExperiencias()).find((x) => x.slug === slug);
  if (!e) return { title: "Experiencia no encontrada" };
  return {
    title: e.nombre,
    description: e.descripcionLarga,
    alternates: { canonical: `/experiencias/${e.slug}` },
    openGraph: { title: e.nombre, description: e.descripcionLarga, images: [e.foto] },
  };
}

export default async function ExperienciaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const todas = await getExperiencias();
  const e = todas.find((x) => x.slug === slug);
  if (!e) notFound();

  const otra = todas.find((x) => x.slug !== e.slug);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: e.nombre,
          description: e.descripcionLarga,
          image: `${SITE_URL}${e.foto}`,
          url: `${SITE_URL}/experiencias/${e.slug}`,
          provider: { "@type": "TravelAgency", name: "Clubhouse" },
        }}
      />

      {/* Portada */}
      <header className="grano relative isolate -mt-20 flex min-h-[85dvh] items-end overflow-hidden bg-[#061a13] pb-14 pt-32 text-crema">
        <Image
          src={e.foto}
          alt={e.fotoAlt}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div
          aria-hidden
          className="-z-10 absolute inset-0 bg-gradient-to-t from-[#04140e] via-[#04140e]/65 to-[#04140e]/30"
        />

        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
          <Link
            href="/#experiencias"
            className="entra-hero inline-flex items-center gap-1.5 text-sm text-crema/70 transition-colors hover:text-[#ecd396]"
          >
            <ArrowLeft size={15} /> Todas las experiencias
          </Link>

          <p
            className="entra-hero mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs backdrop-blur"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            <span aria-hidden>{e.bandera}</span> {e.pais}
          </p>

          <h1
            className="entra-hero mt-5 max-w-3xl font-serif text-[2.75rem] leading-[1.02] text-white sm:text-6xl"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {e.nombre}
          </h1>
          <p
            className="entra-hero mt-3 font-serif text-2xl italic text-[#e8d3a0]"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            {e.subtitulo}
          </p>
          <p
            className="entra-hero mt-6 text-sm uppercase tracking-[0.18em] text-crema/70"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            {e.fechas} · {e.duracion} · desde {e.desde}
          </p>
        </div>
      </header>

      {/* La propuesta */}
      <section className="px-6 py-20 sm:px-10 sm:py-24 lg:px-16 xl:px-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-champagne">
              <span className="h-px w-8 bg-current opacity-60" />
              La propuesta
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-carbon sm:text-5xl">
              {e.titularLargo}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-niebla">
              {e.descripcionLarga}
            </p>

            <ul className="mt-9 space-y-4">
              {e.claves.map((c) => (
                <li key={c.titulo} className="flex gap-3.5">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ecd396] to-[#a98745] text-[#1a1a1a]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span>
                    <span className="font-medium text-carbon">{c.titulo}:</span>{" "}
                    <span className="text-niebla">{c.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] bg-arena shadow-[0_30px_70px_-35px_rgba(11,43,33,0.55)]">
            <Image
              src={e.fotoSecundaria}
              alt=""
              aria-hidden
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover"
            />
          </div>
        </div>

        <dl className="mx-auto mt-16 grid max-w-[1400px] grid-cols-2 gap-4 sm:grid-cols-4">
          {e.cifras.map((c) => (
            <div
              key={c.etiqueta}
              className="rounded-2xl border border-arena/70 bg-white/70 p-6 text-center backdrop-blur-sm"
            >
              <dt className="texto-oro font-serif text-4xl leading-none">{c.valor}</dt>
              <dd className="mt-2 text-xs uppercase tracking-[0.14em] text-niebla">
                {c.etiqueta}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Programa */}
      <section className="grano relative isolate overflow-hidden bg-[#071d16] px-6 py-24 text-crema sm:px-10 lg:px-16 xl:px-24">
        <div className="hero-degradado absolute inset-0 -z-10 opacity-75" />
        <div className="mx-auto max-w-[1500px]">
          <EncabezadoSeccion
            oscuro
            eyebrow="El programa"
            titulo={
              <>
                Día a día, <Oro>cero preocupaciones</Oro>
              </>
            }
          />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {e.programa.map((d) => (
              <li
                key={d.fecha}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md transition-colors hover:border-[#c6a664]/40 hover:bg-white/[0.09]"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#e8d3a0]">
                  {d.fecha}
                </span>
                <h3 className="mt-1.5 font-serif text-xl text-white">{d.titulo}</h3>
                <ul className="mt-3 space-y-1 text-sm text-crema/65">
                  {d.detalle.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Las rondas */}
      <section className="px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-[1400px]">
          <EncabezadoSeccion
            eyebrow="Las rondas"
            titulo={
              <>
                Campos de <Oro>campeonato</Oro>
              </>
            }
          />
          <div className="space-y-6">
            {e.rondas.map((r, i) => (
              <article
                key={r.nombre}
                className={`grid items-center gap-8 overflow-hidden rounded-[2rem] border border-arena/70 bg-white/70 shadow-[0_24px_60px_-35px_rgba(11,43,33,0.45)] backdrop-blur-sm lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:[&>figure]:order-last" : ""
                }`}
              >
                <figure className="relative aspect-[4/3] bg-arena lg:aspect-auto lg:h-full lg:min-h-[22rem]">
                  <Image
                    src={r.foto}
                    alt={`${r.nombre}, ${e.pais}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </figure>
                <div className="p-8 sm:p-10">
                  <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-champagne">
                    {r.lugar}
                  </span>
                  <h3 className="mt-2 font-serif text-3xl leading-tight text-carbon">
                    {r.nombre}
                  </h3>
                  <p className="mt-4 leading-relaxed text-niebla">{r.descripcion}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {r.datos.map((d) => (
                      <li
                        key={d}
                        className="rounded-full border border-arena bg-crema px-3.5 py-1.5 text-xs font-medium text-carbon"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Alojamiento y más allá del golf */}
      <section className="bg-blanco-roto px-6 py-24 sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-champagne">
              <span className="h-px w-8 bg-current opacity-60" />
              Alojamiento
            </span>
            <h2 className="mt-4 font-serif text-3xl text-carbon sm:text-4xl">
              Dónde se queda
            </h2>
            <ul className="mt-7 space-y-4">
              {e.alojamiento.map((a) => (
                <li
                  key={a.nombre}
                  className="rounded-2xl border border-arena/70 bg-white p-6"
                >
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-niebla">
                    {a.periodo}
                  </span>
                  <h3 className="mt-1.5 font-serif text-xl text-carbon">{a.nombre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-niebla">
                    {a.descripcion}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-champagne">
              <span className="h-px w-8 bg-current opacity-60" />
              Más allá del golf
            </span>
            <h2 className="mt-4 font-serif text-3xl text-carbon sm:text-4xl">
              Para todo el grupo
            </h2>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {e.masAllaDelGolf.map((m) => (
                <li
                  key={m.titulo}
                  className="rounded-2xl border border-arena/70 bg-white p-5"
                >
                  <h3 className="font-serif text-lg text-carbon">{m.titulo}</h3>
                  <p className="mt-1 text-sm text-niebla">{m.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tarifas */}
      <section className="px-6 py-24 sm:px-10 sm:py-28 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-[1400px]">
          <EncabezadoSeccion
            eyebrow={`Tarifas · ${e.fechas}`}
            titulo={
              <>
                Un plan para <Oro>cada participante</Oro>
              </>
            }
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {e.tarifas.map((t) => (
              <div
                key={`${t.perfil}-${t.detalle}`}
                className={`flex flex-col rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-1.5 ${
                  t.destacada
                    ? "grano relative isolate overflow-hidden bg-[#071d16] text-crema shadow-[0_34px_80px_-34px_rgba(7,29,22,0.8)]"
                    : "border border-arena/70 bg-white/70 backdrop-blur-sm"
                }`}
              >
                {t.destacada && (
                  <div className="hero-degradado absolute inset-0 -z-10 opacity-80" />
                )}
                <span
                  className={`text-[11px] font-medium uppercase tracking-[0.16em] ${
                    t.destacada ? "text-[#e8d3a0]" : "text-champagne"
                  }`}
                >
                  {t.perfil}
                </span>
                <h3
                  className={`mt-1.5 font-serif text-xl ${
                    t.destacada ? "text-white" : "text-carbon"
                  }`}
                >
                  {t.detalle}
                </h3>
                <p
                  className={`mt-6 font-serif text-4xl leading-none ${
                    t.destacada ? "texto-oro" : "text-verde-golf"
                  }`}
                >
                  {t.precio}
                </p>
                <p
                  className={`mt-1.5 text-xs uppercase tracking-[0.14em] ${
                    t.destacada ? "text-crema/55" : "text-niebla"
                  }`}
                >
                  {t.unidad}
                </p>
                <ul
                  className={`mt-7 space-y-2.5 border-t pt-6 text-sm ${
                    t.destacada ? "border-white/15 text-crema/75" : "border-arena text-niebla"
                  }`}
                >
                  {t.incluye.map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${
                          t.destacada ? "text-[#e8d3a0]" : "text-verde-golf"
                        }`}
                      />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Incluye / no incluye */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-arena/80 bg-white/70 p-7 backdrop-blur-sm">
              <h3 className="flex items-center gap-2.5 font-serif text-xl text-carbon">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-verde-golf/10 text-verde-golf">
                  <Check size={17} />
                </span>
                Incluido
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {e.incluye.map((x) => (
                  <li key={x} className="flex gap-3 text-carbon">
                    <Check size={16} className="mt-0.5 shrink-0 text-verde-golf" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.75rem] border border-arena/80 bg-white/40 p-7">
              <h3 className="flex items-center gap-2.5 font-serif text-xl text-carbon">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-alerta/10 text-alerta">
                  <X size={17} />
                </span>
                No incluido
              </h3>
              <ul className="mt-5 space-y-3 text-sm">
                {e.noIncluye.map((x) => (
                  <li key={x} className="flex gap-3 text-niebla">
                    <X size={16} className="mt-0.5 shrink-0 text-alerta/70" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-8 text-center text-xs leading-relaxed text-niebla">
            Tarifas por persona, sujetas a disponibilidad de hoteles y campos
            hasta la confirmación. Para confirmar se requiere un depósito;
            consulte las condiciones completas con su asesor.
          </p>
        </div>
      </section>

      {/* Cierre */}
      <section className="px-6 pb-24 sm:px-10 lg:px-16 xl:px-24">
        <div className="grano relative isolate mx-auto max-w-[1400px] overflow-hidden rounded-[2.5rem] bg-[#071d16] px-8 py-16 text-center text-crema sm:px-16 sm:py-20">
          <div className="hero-degradado absolute inset-0 -z-10" />
          <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-[1.08] text-white sm:text-5xl">
            ¿Lo quiere para <Oro>su grupo</Oro>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-crema/70">
            Ajustamos fechas, campos y alojamiento a la medida de su viaje.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={MARCA.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="boton-oro group inline-flex min-h-13 items-center gap-2 rounded-full px-8 text-sm font-semibold"
            >
              Hablemos por WhatsApp
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            {otra && (
              <Link
                href={`/experiencias/${otra.slug}`}
                className="boton-cristal inline-flex min-h-13 items-center rounded-full px-8 text-sm font-medium"
              >
                Ver {otra.nombre}
              </Link>
            )}
          </div>
          <p className="mt-12 font-serif text-2xl italic text-[#e8d3a0]">
            {MARCA.cierre}
          </p>
        </div>
      </section>
    </article>
  );
}
