"use client";

import { useEffect, useRef, useState } from "react";

/** Número que sube de 0 al valor cuando entra en pantalla. */
export function Contador({
  hasta,
  sufijo = "",
  duracion = 1600,
}: {
  hasta: number;
  sufijo?: string;
  duracion?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(hasta);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const paso = (t: number) => {
          const p = Math.min(1, (t - t0) / duracion);
          setN(Math.round(hasta * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(paso);
        };
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [hasta, duracion]);

  return (
    <span ref={ref} aria-label={`${hasta}${sufijo}`}>
      {n}
      {sufijo}
    </span>
  );
}
