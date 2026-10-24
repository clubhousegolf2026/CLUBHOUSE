"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/** Chips que siguen la lectura: resaltan la sección en pantalla y llevan a ella. */
export function NavSecciones({ items }: { items: { id: string; etiqueta: string }[] }) {
  const [visible, setVisible] = useState(false);
  const [activa, setActiva] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const f = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  useEffect(() => {
    const elementos = items.map((i) => document.getElementById(i.id)).filter((x): x is HTMLElement => Boolean(x));
    if (elementos.length === 0) return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) if (e.isIntersecting) setActiva(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    elementos.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Secciones del viaje"
      className={cn(
        "fixed inset-x-0 top-[5.4rem] z-40 flex justify-center px-3 transition-all duration-500 [html[data-cabecera=oculta]_&]:top-3",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0",
      )}
    >
      <ul className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/15 bg-[#0a2a20]/85 p-1.5 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.6)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((i) => (
          <li key={i.id} className="shrink-0">
            <a
              href={`#${i.id}`}
              aria-current={activa === i.id ? "true" : undefined}
              className={cn(
                "block rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-[13px]",
                activa === i.id ? "bg-[#ecd396] text-[#14251d]" : "text-crema/75 hover:text-white",
              )}
            >
              {i.etiqueta}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Barra inferior con el precio y el botón de reserva; aparece al bajar. */
export function BarraReserva({
  nombre,
  desde,
  fechas,
  href,
}: {
  nombre: string;
  desde: string;
  fechas: string;
  href: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const f = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 transition-all duration-500 sm:pb-5",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-full border border-white/15 bg-[#0a2a20]/92 py-2 pl-5 pr-2 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="min-w-0">
          <p className="truncate font-serif text-base leading-tight text-white sm:text-lg">{nombre}</p>
          <p className="truncate text-[11px] text-crema/60 sm:text-xs">
            {fechas}
            {desde && (
              <>
                {" · "}
                <span className="text-[#ecd396]">Desde {desde}</span>
              </>
            )}
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="boton-oro group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold"
        >
          Reservar
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
}

const MS = { dia: 86_400_000, hora: 3_600_000, minuto: 60_000 };

/** Cuenta regresiva hasta la salida (no se muestra si ya pasó). */
export function CuentaRegresiva({ fecha }: { fecha: string }) {
  const objetivo = Date.parse(`${fecha}T08:00:00`);
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (ahora === null || Number.isNaN(objetivo) || objetivo <= ahora) return null;
  const falta = objetivo - ahora;
  const partes = [
    { v: Math.floor(falta / MS.dia), e: "días" },
    { v: Math.floor((falta % MS.dia) / MS.hora), e: "horas" },
    { v: Math.floor((falta % MS.hora) / MS.minuto), e: "min" },
    { v: Math.floor((falta % MS.minuto) / 1000), e: "seg" },
  ];

  return (
    <div className="entra-hero mt-8" style={{ "--i": 5 } as React.CSSProperties}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.26em] text-[#e8d3a0]">Faltan para la salida</p>
      <div className="flex gap-2.5">
        {partes.map((p) => (
          <div key={p.e} className="min-w-[4.2rem] rounded-2xl border border-white/15 bg-white/[0.08] px-3 py-2.5 text-center backdrop-blur-md">
            <span className="block font-serif text-3xl leading-none tabular-nums text-white">{String(p.v).padStart(2, "0")}</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-crema/55">{p.e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
