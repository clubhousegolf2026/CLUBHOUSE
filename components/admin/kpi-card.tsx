"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { cn } from "@/lib/cn";
import { cop } from "@/lib/format";

const TONOS = {
  verde: { chip: "from-verde-golf to-verde-calle", halo: "bg-verde-golf/25" },
  dorado: { chip: "from-champagne to-[#7d6230]", halo: "bg-champagne/30" },
  azul: { chip: "from-[#3b6f8f] to-[#1f3f56]", halo: "bg-[#3b6f8f]/25" },
  rojo: { chip: "from-[#b4533a] to-[#7a2b1a]", halo: "bg-[#b4533a]/25" },
} as const;

export type TonoKpi = keyof typeof TONOS;

/** Tarjeta de indicador: número que cuenta hasta su valor al aparecer,
 *  ícono con degradado, halo de color y elevación al pasar el cursor. */
export function KpiCard({
  etiqueta,
  valor,
  formato = "numero",
  detalle,
  icono,
  tono = "verde",
  indice = 0,
}: {
  etiqueta: string;
  valor: number;
  formato?: "numero" | "cop";
  detalle?: string;
  icono?: React.ReactNode;
  tono?: TonoKpi;
  indice?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const visible = useInView(ref, { once: true });
  const t = TONOS[tono];

  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    const formatear = (n: number) => (formato === "cop" ? cop(n) : String(Math.round(n)));
    const controles = animate(0, valor, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => (el.textContent = formatear(n)),
    });
    return () => controles.stop();
  }, [visible, valor, formato]);

  return (
    <div
      className="entra admin-tarjeta group relative overflow-hidden rounded-[var(--radius-panel)] p-5"
      style={{ "--i": indice } as React.CSSProperties}
    >
      <div
        className={cn(
          "absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-150",
          t.halo,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-niebla">
          {etiqueta}
        </p>
        {icono && (
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg shadow-black/10 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110",
              t.chip,
            )}
          >
            {icono}
          </span>
        )}
      </div>
      <p
        ref={ref}
        className="relative mt-3 font-serif text-[2rem] leading-none text-carbon tabular-nums"
      >
        {formato === "cop" ? cop(0) : "0"}
      </p>
      {detalle && <p className="relative mt-2 text-xs text-niebla">{detalle}</p>}
    </div>
  );
}
