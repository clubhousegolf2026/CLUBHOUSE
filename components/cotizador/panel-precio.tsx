"use client";

import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCotizador } from "@/stores/cotizador-store";
import { cop } from "@/lib/format";

function Contenido() {
  const { cotizacion, seleccion } = useCotizador();
  const reduce = useReducedMotion();

  return (
    <>
      <h2 className="flex items-center gap-2 font-serif text-xl text-carbon">
        <span className="h-px w-6 bg-champagne" /> Tu viaje
      </h2>

      <ul className="mt-4 space-y-2 text-sm">
        {cotizacion.lineas.map((l, i) => (
          <li key={i} className="flex justify-between gap-4">
            <span className="text-niebla">{l.concepto}</span>
            <span className="tabular text-carbon">{cop(l.subtotal)}</span>
          </li>
        ))}
        {cotizacion.lineas.length === 0 && (
          <li className="text-niebla">
            Elige campos y alojamiento para ver tu precio.
          </li>
        )}
      </ul>

      <div className="mt-4 border-t border-arena pt-4">
        <div className="flex justify-between text-sm text-niebla">
          <span>Subtotal</span>
          <span className="tabular">{cop(cotizacion.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-niebla">
          <span>IVA</span>
          <span className="tabular">{cop(cotizacion.impuestos)}</span>
        </div>

        <m.div
          key={cotizacion.total}
          initial={reduce ? false : { scale: 0.96, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="mt-2 flex items-baseline justify-between"
          aria-live="polite"
        >
          <span className="font-serif text-lg text-carbon">Total</span>
          <span className="font-serif text-3xl tabular text-verde-golf">
            {cop(cotizacion.total)}
          </span>
        </m.div>
        <p className="mt-1 text-right text-xs text-niebla">
          {cop(cotizacion.porPersona)} por persona · {seleccion.numPax} pax
        </p>
      </div>

      <Link
        href="/cotizador/resumen"
        className="boton-oro mt-6 flex min-h-13 w-full items-center justify-center rounded-xl px-5 py-3.5 text-center text-sm font-semibold"
      >
        {cotizacion.total > 0
          ? `Reservar con ${cop(Math.round(cotizacion.total * 0.3))} de anticipo`
          : "Ver resumen"}
      </Link>
      <p className="mt-2 text-center text-xs text-niebla">
        Precio de referencia · confirmación sujeta a disponibilidad
      </p>
    </>
  );
}

export function PanelPrecioSticky() {
  return (
    <aside className="hidden h-fit rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-[0_30px_80px_-30px_rgba(11,43,33,0.45)] ring-1 ring-arena/60 backdrop-blur-xl lg:sticky lg:top-28 lg:block">
      <Contenido />
    </aside>
  );
}

export function BarraPrecioMovil() {
  const { cotizacion } = useCotizador();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-arena/80 bg-blanco-roto/90 p-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-1">
        <div>
          <span className="block text-xs text-niebla">Total estimado</span>
          <span className="font-serif text-2xl tabular text-verde-golf">
            {cop(cotizacion.total)}
          </span>
        </div>
        <Link
          href="/cotizador/resumen"
          className="boton-oro rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Ver resumen
        </Link>
      </div>
    </div>
  );
}
