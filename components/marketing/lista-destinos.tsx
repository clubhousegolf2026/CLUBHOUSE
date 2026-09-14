"use client";

import { m } from "framer-motion";
import { MapPin, ArrowRight, X } from "lucide-react";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

/** Listado de todas las ciudades/destinos — pantalla inicial del selector
 *  del globo. Al elegir una ciudad, el panel padre hace la transición
 *  hacia su detalle (ver `onCerrar`/`onElegir` en Hero). */
export function ListaDestinos({
  destinos,
  onElegir,
  onCerrar,
}: {
  destinos: DestinoConPaquetes[];
  onElegir: (d: DestinoConPaquetes) => void;
  onCerrar: () => void;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.24 }}
      className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-wide text-champagne">
            Elige una ciudad
          </span>
          <h3 className="mt-1 font-serif text-2xl text-carbon">
            ¿A dónde quieres jugar?
          </h3>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-niebla hover:bg-arena/50"
        >
          <X size={18} />
        </button>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {destinos.map((d) => (
          <li key={d.id}>
            <button
              onClick={() => onElegir(d)}
              className="group flex w-full items-center justify-between gap-3 rounded-[var(--radius-control)] border border-arena bg-crema px-4 py-3 text-left transition-colors hover:border-verde-golf/40"
            >
              <span>
                <span className="flex items-center gap-1.5 font-serif text-base text-carbon">
                  <MapPin size={14} className="shrink-0 text-champagne" />
                  {d.nombre}
                </span>
                <span className="mt-0.5 block text-xs text-niebla">
                  {d.region} · {d.pais}
                  {d.paquetes.length > 0
                    ? ` · ${d.paquetes.length} paquete${d.paquetes.length > 1 ? "s" : ""}`
                    : " · próximamente"}
                </span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-verde-golf transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>
          </li>
        ))}
      </ul>
    </m.div>
  );
}
