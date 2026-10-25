"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { FormularioPublico } from "@/components/formularios/formulario-publico";
import { CLAVE_VISTA } from "@/lib/formularios/vista";
import type { FormularioFila } from "@/lib/formularios/tipos";

/** Vista previa real del formulario (el mismo componente que ve el cliente),
 *  en escritorio o móvil. «Abrir en pestaña nueva» la muestra a tamaño completo
 *  en otra pestaña que se actualiza sola mientras editas. No envía nada. */
export function VistaPrevia({
  formulario,
  alto = 680,
  titulo = "Vista previa en vivo",
  nota,
}: {
  formulario: FormularioFila;
  alto?: number;
  titulo?: string;
  nota?: string;
}) {
  const [modo, setModo] = useState<"escritorio" | "movil">("escritorio");
  const caja = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(520);
  const pestanaAbierta = useRef(false);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAncho(el.clientWidth));
    ro.observe(el);
    setAncho(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const guardarParaPestana = () => {
    try {
      localStorage.setItem(CLAVE_VISTA, JSON.stringify({ formulario, t: Date.now() }));
    } catch {}
  };

  // Mientras haya una pestaña de vista abierta, se le envía cada cambio.
  useEffect(() => {
    if (!pestanaAbierta.current) return;
    const t = setTimeout(guardarParaPestana, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulario]);

  const base = modo === "escritorio" ? 1100 : 390;
  const k = Math.min(1, ancho / base);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-carbon">{titulo}</p>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-arena bg-white p-0.5 text-xs">
            {(["escritorio", "movil"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setModo(m)} className={cn("rounded-md px-3 py-1", modo === m ? "bg-verde-golf text-crema" : "text-niebla hover:text-carbon")}>
                {m === "escritorio" ? "Escritorio" : "Móvil"}
              </button>
            ))}
          </div>
          <a
            href="/vista"
            target="_blank"
            rel="noopener"
            onClick={() => {
              pestanaAbierta.current = true;
              guardarParaPestana();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"
          >
            <ExternalLink size={13} /> Abrir en pestaña nueva
          </a>
        </div>
      </div>

      <div ref={caja} className="overflow-hidden rounded-2xl border border-arena bg-[#e7e5df]" style={{ height: alto }}>
        <div
          className="overflow-auto bg-white shadow-xl"
          style={{
            width: base,
            height: alto / k,
            transform: `scale(${k})`,
            transformOrigin: "top left",
            marginLeft: modo === "movil" ? Math.max(0, (ancho - base * k) / 2) : 0,
          }}
        >
          <FormularioPublico key={formulario.plantilla} formulario={formulario} vista />
        </div>
      </div>
      {nota && <p className="mt-2 text-xs text-niebla">{nota}</p>}
    </div>
  );
}
