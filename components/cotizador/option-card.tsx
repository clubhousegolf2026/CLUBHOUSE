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
        "flex w-full items-start gap-3 rounded-[var(--radius-card)] border bg-blanco-roto p-4 text-left transition-colors",
        activo
          ? "border-verde-golf ring-1 ring-verde-golf"
          : "border-arena hover:border-verde-golf/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-colors",
          tipo === "radio" ? "rounded-full" : "rounded",
          activo ? "border-verde-golf bg-verde-golf text-crema" : "border-niebla/50",
        )}
      >
        {activo && <Check size={13} strokeWidth={3} />}
      </span>

      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium text-carbon">{titulo}</span>
          {badge && (
            <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-[11px] font-medium text-carbon">
              {badge}
            </span>
          )}
        </span>
        {descripcion && (
          <span className="mt-0.5 block text-sm text-niebla">{descripcion}</span>
        )}
        {precio != null && (
          <span className="mt-1 block text-sm font-medium text-verde-golf tabular">
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
          className="grid h-9 w-9 place-items-center rounded-lg border border-arena text-carbon disabled:opacity-40"
        >
          −
        </button>
        <span className="w-8 text-center font-medium tabular">{valor}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, valor + 1))}
          disabled={valor >= max}
          aria-label={`Aumentar ${label}`}
          className="grid h-9 w-9 place-items-center rounded-lg border border-arena text-carbon disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
