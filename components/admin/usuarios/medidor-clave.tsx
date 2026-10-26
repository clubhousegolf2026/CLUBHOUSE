"use client";

import { cn } from "@/lib/cn";
import { ETIQUETA_FORTALEZA, fortaleza, validarContrasena } from "@/lib/admin/contrasena";

const COLORES = ["bg-arena", "bg-error", "bg-alerta", "bg-champagne", "bg-exito"] as const;

/** Barra de fortaleza con la regla que falta, para cualquier campo de contraseña. */
export function MedidorClave({ valor }: { valor: string }) {
  if (!valor) return null;
  const f = fortaleza(valor);
  const falta = validarContrasena(valor);
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= f ? COLORES[f] : "bg-arena/70")} />
        ))}
      </div>
      <p className={cn("mt-1 text-xs", falta ? "text-alerta" : "text-exito")}>{falta ?? `${ETIQUETA_FORTALEZA[f]}: cumple los requisitos.`}</p>
    </div>
  );
}
