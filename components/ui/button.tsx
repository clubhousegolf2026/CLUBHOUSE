import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const estilos = {
  base: "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-champagne disabled:opacity-40 disabled:pointer-events-none min-h-11",
  variantes: {
    primario: "bg-verde-golf text-crema hover:bg-verde-calle",
    oscuro: "bg-carbon text-crema hover:bg-verde-calle",
    contorno:
      "border border-verde-golf/40 text-verde-golf hover:bg-verde-golf/5",
    fantasma: "text-niebla hover:text-carbon hover:bg-arena/40",
  },
};

type Variante = keyof typeof estilos.variantes;

export function Button({
  variante = "primario",
  className,
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return (
    <button
      className={cn(estilos.base, estilos.variantes[variante], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variante = "primario",
  className,
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante }) {
  return (
    <Link
      className={cn(estilos.base, estilos.variantes[variante], className)}
      {...props}
    />
  );
}
