"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Moon } from "lucide-react";
import { cop } from "@/lib/format";
import type { PaquetePredefinido } from "@/lib/data/types";

/** Tarjeta editorial: foto a sangre con degradado, datos sobre la imagen,
 *  precio en cristal y un foco dorado que sigue al cursor. */
export function PackageCard({
  paquete,
}: {
  paquete: PaquetePredefinido;
  compacto?: boolean;
}) {
  function seguirCursor(e: React.MouseEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <Link
      href={`/paquetes/${paquete.slug}`}
      onMouseMove={seguirCursor}
      className="tarjeta-luz group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#0b2b21] shadow-[0_20px_50px_-24px_rgba(11,43,33,0.7)] ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_34px_70px_-26px_rgba(11,43,33,0.85)]"
    >
      {paquete.galeria[0] && (
        <Image
          src={paquete.galeria[0].url}
          alt={paquete.galeria[0].alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#04140e] via-[#04140e]/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#04140e]/45 via-transparent to-transparent" />

      <div className="relative z-10 flex items-start justify-between p-5">
        {paquete.destacado ? (
          <span className="rounded-full bg-gradient-to-r from-[#ecd396] to-[#b8913f] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1a1a1a] shadow-lg">
            Más elegido
          </span>
        ) : (
          <span />
        )}
        <span className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:rotate-0 group-hover:opacity-100 -rotate-45">
          <ArrowUpRight size={18} />
        </span>
      </div>

      <div className="relative z-10 p-6 pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur">
            <Moon size={12} /> {paquete.noches} {paquete.noches === 1 ? "noche" : "noches"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur">
            <MapPin size={12} /> {paquete.camposIncluidos.length}{" "}
            {paquete.camposIncluidos.length === 1 ? "campo" : "campos"}
          </span>
        </div>

        <h3 className="mt-3 font-serif text-2xl leading-tight text-white sm:text-[1.7rem]">
          {paquete.nombre}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/65">
          {paquete.descripcion}
        </p>

        <div className="mt-5 flex items-end justify-between border-t border-white/15 pt-4">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/55">
              Desde
            </span>
            <span className="font-serif text-2xl text-[#ecd396] tabular">
              {cop(paquete.precioDesdeCop)}
            </span>
          </div>
          <span className="text-xs text-white/60">por persona</span>
        </div>
      </div>
    </Link>
  );
}
