"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { MapPin, X, ArrowRight, ArrowLeft } from "lucide-react";
import { cop } from "@/lib/format";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

/** Panel de detalle del destino elegido — resumen, campos y paquetes.
 *  `onVolver` (opcional) muestra una flecha atrás hacia el listado de
 *  ciudades en vez de la X de cerrar del todo. */
export function DetalleDestino({
  destino,
  onCerrar,
  onVolver,
}: {
  destino: DestinoConPaquetes;
  onCerrar: () => void;
  onVolver?: () => void;
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
        <div className="flex items-start gap-2">
          {onVolver && (
            <button
              onClick={onVolver}
              aria-label="Volver a las ciudades"
              className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-niebla transition-colors hover:bg-arena/50 hover:text-carbon"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-champagne">
              <MapPin size={13} /> {destino.region} · {destino.pais}
            </span>
            <h3 className="mt-1 font-serif text-2xl text-carbon">{destino.nombre}</h3>
          </div>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar destino"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-niebla hover:bg-arena/50"
        >
          <X size={18} />
        </button>
      </div>

      {destino.foto && (
        <div className="relative mt-4 aspect-[16/7] overflow-hidden rounded-[var(--radius-card)] bg-arena">
          <Image
            src={destino.foto}
            alt={destino.nombre}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm leading-relaxed text-niebla">{destino.resumen}</p>
          <h4 className="mt-4 font-serif text-sm text-carbon">Campos de golf</h4>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {destino.campos.map((c) => (
              <li
                key={c}
                className="rounded-full border border-arena bg-crema px-2.5 py-1 text-xs text-carbon"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-sm text-carbon">
            {destino.paquetes.length > 0
              ? `Paquetes en ${destino.nombre}`
              : "Destino en preparación"}
          </h4>
          {destino.paquetes.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {destino.paquetes.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/paquetes/${p.slug}`}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2.5 text-sm transition-colors hover:border-verde-golf/40"
                  >
                    <span>
                      <span className="block font-medium text-carbon">{p.nombre}</span>
                      <span className="text-xs text-niebla">
                        {p.dias} días · {p.noches} noches · desde {cop(p.precioDesdeCop)}
                      </span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-verde-golf" />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cotizador"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-verde-golf"
                >
                  O arma tu propio itinerario <ArrowRight size={15} />
                </Link>
              </li>
            </ul>
          ) : (
            <p className="mt-2 text-sm text-niebla">
              Aún no tenemos paquetes cerrados aquí.{" "}
              <Link href="/contacto" className="text-verde-golf underline">
                Escríbenos
              </Link>{" "}
              y te avisamos cuando abra.
            </p>
          )}
        </div>
      </div>
    </m.div>
  );
}
