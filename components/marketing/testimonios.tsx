import { Quote } from "lucide-react";
import type { Testimonio } from "@/lib/data/types";

export function Testimonios({ testimonios }: { testimonios: Testimonio[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {testimonios.map((t) => (
        <figure
          key={t.id}
          className="flex flex-col rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-6"
        >
          <Quote className="text-champagne" size={22} aria-hidden />
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-carbon">
            {t.texto}
          </blockquote>
          <figcaption className="mt-4 border-t border-arena pt-4 text-sm">
            <span className="block font-medium text-carbon">{t.nombre}</span>
            <span className="text-niebla">
              {t.origen}
              {t.handicap ? ` · ${t.handicap}` : ""}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
