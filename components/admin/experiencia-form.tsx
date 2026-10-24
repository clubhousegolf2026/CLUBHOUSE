"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { guardarExperiencia, restablecerExperiencia } from "@/app/admin/(panel)/experiencias/actions";
import type { AjustesExperiencia } from "@/lib/contenido/experiencias-editables";

const campo =
  "w-full rounded-xl border border-arena bg-white px-3.5 py-2.5 text-sm text-carbon outline-none focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";
const etiqueta = "mb-1 block text-xs font-medium uppercase tracking-wider text-niebla";

export function ExperienciaForm({ slug, valores }: { slug: string; valores: Required<AjustesExperiencia> }) {
  const router = useRouter();
  const [f, setF] = useState(valores);
  const [pendiente, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const r = await guardarExperiencia(slug, f);
      if (!r.ok) return setMsg({ ok: false, texto: r.error });
      setMsg({ ok: true, texto: "Guardado. Ya se ve en el sitio." });
      router.refresh();
    });
  }

  function restablecer() {
    start(async () => {
      const r = await restablecerExperiencia(slug);
      if (!r.ok) return setMsg({ ok: false, texto: r.error });
      router.refresh();
      window.location.reload();
    });
  }

  return (
    <form onSubmit={guardar} className="max-w-3xl space-y-5 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2"><span className={etiqueta}>Nombre del viaje</span><input className={campo} value={f.nombre} onChange={set("nombre")} required /></label>
        <label className="block"><span className={etiqueta}>Subtítulo (ciudades)</span><input className={campo} value={f.subtitulo} onChange={set("subtitulo")} /></label>
        <label className="block"><span className={etiqueta}>Fechas</span><input className={campo} value={f.fechas} onChange={set("fechas")} placeholder="8 – 16 mar 2027" /></label>
        <label className="block">
          <span className={etiqueta}>Duración</span>
          <input className={campo} value={f.duracion} onChange={set("duracion")} placeholder="8 noches / 9 días" />
          <span className="mt-1 block text-xs text-niebla">Mantén el formato «N noches / M días»: de ahí salen las noches de las tarjetas y los filtros.</span>
        </label>
        <label className="block">
          <span className={etiqueta}>Precio «desde»</span>
          <input className={campo} value={f.desde} onChange={set("desde")} placeholder="USD 3.580" />
          <span className="mt-1 block text-xs text-niebla">Escríbelo con la moneda: «USD 3.580».</span>
        </label>
        <label className="block sm:col-span-2"><span className={etiqueta}>Resumen (tarjetas y globo)</span><textarea rows={2} className={campo} value={f.resumen} onChange={set("resumen")} /></label>
        <label className="block sm:col-span-2"><span className={etiqueta}>Titular de la página</span><input className={campo} value={f.titularLargo} onChange={set("titularLargo")} /></label>
        <label className="block sm:col-span-2"><span className={etiqueta}>Descripción de la página</span><textarea rows={4} className={campo} value={f.descripcionLarga} onChange={set("descripcionLarga")} /></label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pendiente} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-6 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60">
          {pendiente && <Loader2 size={15} className="animate-spin" />} Guardar cambios
        </button>
        <button type="button" onClick={restablecer} disabled={pendiente} className="inline-flex items-center gap-1.5 text-sm text-niebla hover:text-carbon">
          <RotateCcw size={14} /> Restablecer al texto original
        </button>
        {msg && <span role="status" className={`text-sm ${msg.ok ? "text-exito" : "text-error"}`}>{msg.texto}</span>}
      </div>
    </form>
  );
}
