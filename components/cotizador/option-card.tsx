"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { cop } from "@/lib/format";

export function OptionCard({
  titulo,
  descripcion,
  precio,
  sufijoPrecio,
  activo,
  onClick,
  badge,
  tipo = "radio",
}: {
  titulo: string;
  descripcion?: string;
  precio?: number;
  sufijoPrecio?: string;
  activo: boolean;
  onClick: () => void;
  badge?: string;
  tipo?: "radio" | "check";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={cn(
        "flex w-full items-start gap-3.5 rounded-2xl border bg-white p-5 text-left transition-all duration-300",
        activo
          ? "-translate-y-0.5 border-verde-golf bg-verde-golf/[0.04] shadow-lg shadow-verde-golf/10 ring-1 ring-verde-golf"
          : "border-arena/80 hover:-translate-y-0.5 hover:border-verde-golf/40 hover:shadow-md",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-all duration-300",
          tipo === "radio" ? "rounded-full" : "rounded-md",
          activo
            ? "scale-110 border-transparent bg-gradient-to-br from-verde-golf to-verde-calle text-crema"
            : "border-niebla/40",
        )}
      >
        {activo && <Check size={13} strokeWidth={3} />}
      </span>

      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-carbon">{titulo}</span>
          {badge && (
            <span className="rounded-full bg-gradient-to-r from-[#ecd396] to-[#c6a664] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1a1a1a]">
              {badge}
            </span>
          )}
        </span>
        {descripcion && (
          <span className="mt-0.5 block text-sm text-niebla">{descripcion}</span>
        )}
        {precio != null && (
          <span className="mt-1.5 block font-serif text-lg text-verde-golf tabular">
            {cop(precio)}
            {sufijoPrecio ? (
              <span className="font-normal text-niebla"> {sufijoPrecio}</span>
            ) : null}
          </span>
        )}
      </span>
    </button>
  );
}

export function Stepper({
  valor,
  onChange,
  min = 1,
  max = 99,
  label,
}: {
  valor: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-carbon">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, valor - 1))}
          disabled={valor <= min}
          aria-label={`Disminuir ${label}`}
          className="grid h-10 w-10 place-items-center rounded-xl border border-arena bg-white text-lg text-carbon transition-colors hover:border-verde-golf/50 hover:text-verde-golf disabled:opacity-40"
        >
          −
        </button>
        <span className="w-9 text-center font-serif text-lg tabular">{valor}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, valor + 1))}
          disabled={valor >= max}
          aria-label={`Aumentar ${label}`}
          className="grid h-10 w-10 place-items-center rounded-xl border border-arena bg-white text-lg text-carbon transition-colors hover:border-verde-golf/50 hover:text-verde-golf disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
