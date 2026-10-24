"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { MARCA } from "@/lib/contenido/clubhouse";

const INTERACTIVOS = "a, button, summary, input, select, textarea, [role='button'], [data-cursor='enlace']";

/** Efectos que viven en todo el sitio público: foco de luz y cursor dorado
 *  (solo con ratón), botón de WhatsApp y volver arriba. */
export function EfectosGlobales() {
  const pathname = usePathname();
  const [pasado, setPasado] = useState(false);
  const punto = useRef<HTMLDivElement>(null);
  const anillo = useRef<HTMLDivElement>(null);

  // Variables --px / --py (foco de luz) y cursor dorado con inercia.
  useEffect(() => {
    const fino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fino) return;

    const raiz = document.documentElement;
    let x = -100, y = -100, ax = -100, ay = -100;
    let raf = 0;
    let animando = false;

    const pintar = () => {
      ax += (x - ax) * 0.18;
      ay += (y - ay) * 0.18;
      if (anillo.current) anillo.current.style.transform = `translate3d(${ax}px, ${ay}px, 0)`;
      if (Math.abs(x - ax) > 0.1 || Math.abs(y - ay) > 0.1) raf = requestAnimationFrame(pintar);
      else animando = false;
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      raiz.style.setProperty("--px", `${x}px`);
      raiz.style.setProperty("--py", `${y}px`);
      if (quieto) return;
      raiz.classList.add("cursor-oro-activo");
      if (punto.current) punto.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const sobre = (e.target as Element | null)?.closest?.(INTERACTIVOS);
      raiz.classList.toggle("cursor-oro-enlace", Boolean(sobre));
      if (!animando) {
        animando = true;
        raf = requestAnimationFrame(pintar);
      }
    };
    const salir = () => raiz.classList.remove("cursor-oro-activo", "cursor-oro-enlace");

    window.addEventListener("pointermove", mover, { passive: true });
    document.addEventListener("pointerleave", salir);
    return () => {
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", salir);
      cancelAnimationFrame(raf);
      salir();
    };
  }, []);

  // Muestra «volver arriba» tras bajar un poco.
  useEffect(() => {
    const f = () => setPasado(window.scrollY > 700);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  // En la ficha de un viaje ya hay una barra de reserva propia.
  const conBarra = pathname.startsWith("/experiencias/");

  return (
    <>
      <div ref={anillo} className="cursor-oro-anillo" aria-hidden />
      <div ref={punto} className="cursor-oro-punto" aria-hidden />

      <div className={cn("fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7", conBarra && "bottom-24 sm:bottom-24")}>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
          tabIndex={pasado ? 0 : -1}
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#0a2a20]/90 text-[#ecd396] shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f3a2c]",
            pasado ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
          )}
        >
          <ArrowUp size={18} />
        </button>
        {!conBarra && (
          <a
            href={MARCA.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribir por WhatsApp"
            className="fab-pulso relative isolate grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-[0_14px_30px_-8px_rgba(37,211,102,0.7)] transition-transform duration-300 hover:scale-110"
          >
            <MessageCircle size={26} fill="currentColor" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </>
  );
}
