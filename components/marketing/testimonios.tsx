"use client";

import { Quote } from "lucide-react";
import type { Testimonio } from "@/lib/data/types";

const iniciales = (n: string) =>
  n
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/** Testimonios sobre fondo oscuro: tarjetas de cristal con foco dorado. */
export function Testimonios({ testimonios }: { testimonios: Testimonio[] }) {
  function seguirCursor(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonios.map((t) => (
        <figure
          key={t.id}
          onMouseMove={seguirCursor}
          className="tarjeta-luz group flex flex-col rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[#c6a664]/40 hover:bg-white/[0.08]"
        >
          <Quote className="text-[#c6a664]" size={34} strokeWidth={1.4} aria-hidden />
          <blockquote className="mt-5 flex-1 font-serif text-lg italic leading-relaxed text-crema/90">
            “{t.texto}”
          </blockquote>
          <figcaption className="mt-7 flex items-center gap-3.5 border-t border-white/10 pt-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ecd396] to-[#a98745] text-sm font-semibold text-[#1a1a1a]">
              {iniciales(t.nombre)}
            </span>
            <span className="text-sm">
              <span className="block font-medium text-white">{t.nombre}</span>
              <span className="text-crema/55">
                {t.origen}
                {t.handicap ? ` · ${t.handicap}` : ""}
              </span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
