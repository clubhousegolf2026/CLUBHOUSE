"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

/** Envuelve una tarjeta para que se incline en 3D hacia el cursor y muestre
 *  un brillo. Solo reacciona al ratón: en pantallas táctiles queda quieta. */
export function Inclinar({
  children,
  className,
  fuerza = 6,
}: {
  children: React.ReactNode;
  className?: string;
  fuerza?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(x - 0.5) * fuerza * 2}deg`);
      el.style.setProperty("--rx", `${-(y - 0.5) * fuerza * 2}deg`);
      el.style.setProperty("--gx", `${x * 100}%`);
      el.style.setProperty("--gy", `${y * 100}%`);
    });
  }

  function salir() {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div ref={ref} onPointerMove={mover} onPointerLeave={salir} className={cn("inclinar", className)}>
      {children}
    </div>
  );
}
