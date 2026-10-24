"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { actualizarBloqueo } from "@/app/admin/(panel)/calendario/actions";

type Tipo = "bloqueo" | "temporada_alta" | "cupo";
const campo =
  "w-full rounded-xl border border-arena bg-white px-3.5 py-2.5 text-sm text-carbon outline-none focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";

export function EditarBloqueoButton({
  bloqueo,
}: {
  bloqueo: { id: string; fecha_inicio: string; fecha_fin: string; tipo: Tipo; nota: string | null; factor_precio: number | null };
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [pendiente, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    inicio: bloqueo.fecha_inicio,
    fin: bloqueo.fecha_fin,
    tipo: bloqueo.tipo,
    nota: bloqueo.nota ?? "",
    factor: bloqueo.factor_precio ?? 1.15,
  });

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await actualizarBloqueo(bloqueo.id, {
        fechaInicio: f.inicio,
        fechaFin: f.fin,
        tipo: f.tipo,
        nota: f.nota.trim() || null,
        factorPrecio: f.factor,
      });
      if (!r.ok) return setError(r.error);
      setAbierto(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Editar"
        className="grid h-8 w-8 place-items-center rounded-full text-verde-golf hover:bg-verde-golf/10"
      >
        <Pencil size={15} />
      </button>
      {abierto && (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-[#04140e]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && setAbierto(false)}
        >
          <form onSubmit={guardar} className="w-full max-w-lg rounded-[1.75rem] border border-arena bg-blanco-roto p-6 text-left shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="font-serif text-xl text-carbon">Editar rango</h2>
              <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="grid h-8 w-8 place-items-center rounded-full text-niebla hover:bg-arena/50">
                <X size={17} />
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium uppercase tracking-wider text-niebla">Desde
                <input type="date" required className={`${campo} mt-1 normal-case tracking-normal`} value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} />
              </label>
              <label className="text-xs font-medium uppercase tracking-wider text-niebla">Hasta
                <input type="date" required className={`${campo} mt-1 normal-case tracking-normal`} value={f.fin} onChange={(e) => setF({ ...f, fin: e.target.value })} />
              </label>
              <label className="text-xs font-medium uppercase tracking-wider text-niebla">Tipo
                <select className={`${campo} mt-1 normal-case tracking-normal`} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as Tipo })}>
                  <option value="bloqueo">Bloqueo (sin cupo)</option>
                  <option value="temporada_alta">Temporada alta</option>
                  <option value="cupo">Cupo limitado</option>
                </select>
              </label>
              {f.tipo === "temporada_alta" && (
                <label className="text-xs font-medium uppercase tracking-wider text-niebla">Factor de precio
                  <input type="number" min={1} step={0.01} className={`${campo} mt-1 normal-case tracking-normal`} value={f.factor} onChange={(e) => setF({ ...f, factor: Number(e.target.value) })} />
                </label>
              )}
              <label className="text-xs font-medium uppercase tracking-wider text-niebla sm:col-span-2">Nota
                <input className={`${campo} mt-1 normal-case tracking-normal`} value={f.nota} onChange={(e) => setF({ ...f, nota: e.target.value })} />
              </label>
            </div>
            {error && <p role="alert" className="mt-4 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error">{error}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setAbierto(false)} className="rounded-xl px-5 py-2.5 text-sm text-niebla hover:bg-arena/40">Cancelar</button>
              <button type="submit" disabled={pendiente} className="rounded-xl bg-verde-golf px-6 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60">
                {pendiente ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
