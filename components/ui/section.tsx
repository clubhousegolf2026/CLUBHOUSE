import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./container";

export function Section({
  className,
  containerClassName,
  children,
  ...props
}: ComponentProps<"section"> & { containerClassName?: string }) {
  return (
    <section className={cn("py-16 sm:py-20", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  titulo,
  descripcion,
}: {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <span className="text-xs uppercase tracking-[0.18em] text-champagne">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 font-serif text-3xl text-carbon sm:text-4xl">
        {titulo}
      </h2>
      {descripcion && (
        <p className="mt-3 text-niebla">{descripcion}</p>
      )}
    </div>
  );
}
