import Image from "next/image";
import { cn } from "@/lib/cn";

/** Marca oficial (Manual de Marca): ícono + wordmark "CLUBHOUSE". El ícono
 *  ya trae su propio fondo verde oscuro, así que funciona igual sobre fondo
 *  claro (header) u oscuro (footer/hero) — solo el texto cambia de color. */
export function Logo({
  variante = "oscuro",
  className,
}: {
  variante?: "oscuro" | "claro";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/icon.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0"
        priority
      />
      <span
        className={cn(
          "font-sans text-lg font-semibold tracking-[0.02em] uppercase",
          variante === "oscuro" ? "text-verde-calle" : "text-crema",
        )}
      >
        Clubhouse
      </span>
    </span>
  );
}
