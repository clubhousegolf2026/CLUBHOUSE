"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Moon } from "lucide-react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { cop } from "@/lib/format";
import type { PaquetePredefinido } from "@/lib/data/types";

export function PackageCard({
  paquete,
  compacto = false,
}: {
  paquete: PaquetePredefinido;
  compacto?: boolean;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: "easeOut" }}>
        <Link
          href={`/paquetes/${paquete.slug}`}
          className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-arena bg-blanco-roto shadow-[var(--shadow-suave)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elevada)]"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={paquete.galeria[0].url}
              alt={paquete.galeria[0].alt}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            {paquete.destacado && (
              <span className="absolute left-3 top-3 rounded-full bg-verde-calle/90 px-3 py-1 text-xs font-medium text-crema">
                Más elegido
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-3 text-xs text-niebla">
              <span className="inline-flex items-center gap-1">
                <Moon size={13} /> {paquete.noches} noches
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} /> {paquete.camposIncluidos.length} campos
              </span>
            </div>

            <h3 className="mt-2 font-serif text-xl text-carbon">{paquete.nombre}</h3>

            {!compacto && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-niebla">
                {paquete.descripcion}
              </p>
            )}

            <div className="mt-4 flex items-end justify-between border-t border-arena pt-4">
              <div>
                <span className="block text-xs text-niebla">Desde</span>
                <span className="font-serif text-lg text-verde-golf tabular">
                  {cop(paquete.precioDesdeCop)}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm text-verde-golf underline-offset-4 group-hover:underline">
                Ver detalle
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </div>
        </Link>
      </m.div>
    </LazyMotion>
  );
}
