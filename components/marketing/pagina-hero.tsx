import { cn } from "@/lib/cn";

/** Encabezado oscuro de las páginas interiores: mismo lenguaje que el hero
 *  de la portada (aurora, grano, anillos, filete dorado) pero más bajo. */
export function PaginaHero({
  eyebrow,
  titulo,
  descripcion,
  children,
  className,
}: {
  eyebrow: string;
  titulo: React.ReactNode;
  descripcion?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grano relative isolate -mt-20 overflow-hidden bg-[#071d16] pb-24 pt-36 text-crema sm:pb-28 sm:pt-44",
        className,
      )}
    >
      <div className="hero-degradado absolute inset-0 -z-20" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,transparent_35%,rgba(3,15,11,0.55)_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-1/2 -z-10 hidden lg:block">
        <div className="orbita orbita-gira aspect-square w-[520px]" />
        <div className="orbita orbita-gira-inversa aspect-square w-[760px] !border-white/10" />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent to-[#f6f3ec]"
      />

      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-16 xl:px-24">
        <span className="entra-hero inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-[#e8d3a0]">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#e8d3a0]" />
          {eyebrow}
        </span>
        <h1
          className="entra-hero mt-5 max-w-3xl font-serif text-[2.5rem] leading-[1.06] text-white sm:text-6xl"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          {titulo}
        </h1>
        {descripcion && (
          <p
            className="entra-hero mt-5 max-w-2xl text-lg leading-relaxed text-crema/70"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {descripcion}
          </p>
        )}
        {children && (
          <div className="entra-hero mt-8" style={{ "--i": 3 } as React.CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

/** Fragmento dorado para destacar una palabra del título. */
export function Oro({ children }: { children: React.ReactNode }) {
  return <em className="texto-oro pr-1 font-medium italic">{children}</em>;
}
