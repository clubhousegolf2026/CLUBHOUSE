"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { guardarExperiencia, restablecerExperiencia } from "@/app/admin/(panel)/experiencias/actions";
import type { AjustesExperiencia } from "@/lib/contenido/experiencias-editables";


const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "8 – 16 mar 2027" o "28 jun – 5 jul 2027" → fechas ISO para los calendarios. */
function leerFechas(texto: string): { inicio: string; fin: string } {
  const m = texto
    .toLowerCase()
    .match(/(\d{1,2})(?:\s+([a-zñ]{3}))?\s*[–-]\s*(\d{1,2})\s+([a-zñ]{3})\s+(\d{4})/);
  if (!m) return { inicio: "", fin: "" };
  const [, d1, m1, d2, m2, anio] = m;
  const mesFin = MESES.indexOf(m2);
  const mesIni = m1 ? MESES.indexOf(m1) : mesFin;
  if (mesFin < 0 || mesIni < 0) return { inicio: "", fin: "" };
  const iso = (a: string, mes: number, d: string) =>
    `${a}-${String(mes + 1).padStart(2, "0")}-${d.padStart(2, "0")}`;
  return { inicio: iso(anio, mesIni, d1), fin: iso(anio, mesFin, d2) };
}

function partes(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return { a, m: m - 1, d };
}

/** Dos fechas ISO → "8 – 16 mar 2027" (el formato que ya usa el sitio). */
function escribirFechas(inicio: string, fin: string): string {
  if (!inicio || !fin) return "";
  const i = partes(inicio);
  const f = partes(fin);
  if (i.a === f.a && i.m === f.m) return `${i.d} – ${f.d} ${MESES[f.m]} ${f.a}`;
  if (i.a === f.a) return `${i.d} ${MESES[i.m]} – ${f.d} ${MESES[f.m]} ${f.a}`;
  return `${i.d} ${MESES[i.m]} ${i.a} – ${f.d} ${MESES[f.m]} ${f.a}`;
}

function nochesEntre(inicio: string, fin: string): number {
  return Math.round((Date.parse(`${fin}T12:00:00Z`) - Date.parse(`${inicio}T12:00:00Z`)) / 86_400_000);
}

const campo =
  "w-full rounded-xl border border-arena bg-white px-3.5 py-2.5 text-sm text-carbon outline-none focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";
const etiqueta = "mb-1 block text-xs font-medium uppercase tracking-wider text-niebla";

export function ExperienciaForm({ slug, valores }: { slug: string; valores: Required<AjustesExperiencia> }) {
  const router = useRouter();
  const [f, setF] = useState(valores);
  const [{ inicio, fin }, setRango] = useState(() => leerFechas(valores.fechas));
  const rangoInvalido = Boolean(inicio && fin && fin < inicio);

  function cambiarRango(nuevo: { inicio: string; fin: string }) {
    setRango(nuevo);
    if (!nuevo.inicio || !nuevo.fin || nuevo.fin < nuevo.inicio) return;
    const noches = nochesEntre(nuevo.inicio, nuevo.fin);
    setF((prev) => ({
      ...prev,
      fechas: escribirFechas(nuevo.inicio, nuevo.fin),
      duracion: noches > 0 ? `${noches} ${noches === 1 ? "noche" : "noches"} / ${noches + 1} días` : prev.duracion,
    }));
  }
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
        <fieldset className="sm:col-span-2">
          <legend className={etiqueta}>Fechas del viaje</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-niebla">Inicio</span>
              <input type="date" className={campo} value={inicio} onChange={(e) => cambiarRango({ inicio: e.target.value, fin })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-niebla">Fin</span>
              <input type="date" className={campo} min={inicio || undefined} value={fin} onChange={(e) => cambiarRango({ inicio, fin: e.target.value })} />
            </label>
          </div>
          {rangoInvalido ? (
            <span className="mt-1 block text-xs text-error">La fecha de fin no puede ser anterior a la de inicio.</span>
          ) : (
            <span className="mt-1 block text-xs text-niebla">
              Se verá en el sitio como: <strong className="text-carbon">{f.fechas || "—"}</strong>. La duración se calcula sola al elegir las fechas.
            </span>
          )}
        </fieldset>
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
