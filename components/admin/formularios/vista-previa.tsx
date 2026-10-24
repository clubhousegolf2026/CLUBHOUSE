"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { FormularioPublico } from "@/components/formularios/formulario-publico";
import type { FormularioFila } from "@/lib/formularios/tipos";

/** Vista previa real del formulario (el mismo componente que ve el cliente),
 *  en escritorio o móvil, con opción de pantalla completa. No envía nada. */
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
  const [completa, setCompleta] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(520);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAncho(el.clientWidth));
    ro.observe(el);
    setAncho(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!completa) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setCompleta(false);
    window.addEventListener("keydown", f);
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", f);
      document.body.style.overflow = previo;
    };
  }, [completa]);

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
          <button type="button" onClick={() => setCompleta(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50">
            <Maximize2 size={13} /> Pantalla completa
          </button>
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

      {completa && (
        <div className="fixed inset-0 z-[120] bg-[#04140e]/85 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label="Vista previa a pantalla completa">
          <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-3">
            <div className="flex items-center justify-between text-crema">
              <div className="inline-flex rounded-lg border border-white/20 bg-white/10 p-0.5 text-xs">
                {(["escritorio", "movil"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setModo(m)} className={cn("rounded-md px-3 py-1.5", modo === m ? "bg-white text-carbon" : "text-crema/80 hover:text-white")}>
                    {m === "escritorio" ? "Escritorio" : "Móvil"}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setCompleta(false)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25">
                <X size={15} /> Cerrar (Esc)
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#e7e5df]">
              <div className="mx-auto h-full overflow-auto bg-white shadow-2xl" style={{ width: modo === "movil" ? 390 : "100%", maxWidth: "100%" }}>
                <FormularioPublico key={`${formulario.plantilla}-completa`} formulario={formulario} vista llenar />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
