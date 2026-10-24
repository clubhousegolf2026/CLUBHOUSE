"use client";

import { Printer } from "lucide-react";

export function ImprimirBoton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle"
    >
      <Printer size={16} /> Imprimir o guardar PDF
    </button>
  );
}
