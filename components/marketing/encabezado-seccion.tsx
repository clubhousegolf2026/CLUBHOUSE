import { cn } from "@/lib/cn";

/** Encabezado de sección: filete dorado + etiqueta, título serif y bajada. */
export function EncabezadoSeccion({
  eyebrow,
  titulo,
  descripcion,
  oscuro = false,
  centrado = true,
}: {
  eyebrow: string;
  titulo: React.ReactNode;
  descripcion?: string;
  oscuro?: boolean;
  centrado?: boolean;
}) {
  return (
    <header className={cn("revela mb-8 max-w-3xl sm:mb-12", centrado && "mx-auto text-center")}>
      <span
        className={cn(
          "inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em]",
          oscuro ? "text-[#e8d3a0]" : "text-champagne",
        )}
      >
        <span className="h-px w-8 bg-current opacity-60" />
        {eyebrow}
        {centrado && <span className="h-px w-8 bg-current opacity-60" />}
      </span>
      <h2
        className={cn(
          "mt-3 font-serif text-[2rem] leading-[1.1] sm:mt-4 sm:text-5xl",
          oscuro ? "text-white" : "text-carbon",
        )}
      >
        {titulo}
      </h2>
      {descripcion && (
        <p className={cn("mt-3 text-base leading-relaxed sm:mt-4 sm:text-lg", oscuro ? "text-crema/65" : "text-niebla")}>
          {descripcion}
        </p>
      )}
    </header>
  );
}
