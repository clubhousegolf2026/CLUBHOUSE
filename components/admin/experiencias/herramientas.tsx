"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  History,
  Loader2,
  Printer,
  RotateCcw,
  Share2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { Experiencia } from "@/lib/contenido/experiencias";
import {
  duplicarExperiencia,
  obtenerVersion,
  obtenerVersiones,
  type VersionFila,
} from "@/app/admin/(panel)/experiencias/actions";

export type ItemChecklist = { ok: boolean; etiqueta: string; seccion: string };

/** Qué falta para que el viaje esté listo para vender. Cada pendiente abre su sección. */
export function ChecklistPublicacion({
  items,
  onIr,
}: {
  items: ItemChecklist[];
  onIr: (seccion: string) => void;
}) {
  const hechos = items.filter((i) => i.ok).length;
  const listo = hechos === items.length;
  return (
    <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-carbon">Listo para publicar</p>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", listo ? "bg-exito/10 text-exito" : "bg-champagne/20 text-[#8a6d1f]")}>
          {hechos}/{items.length}
        </span>
      </div>
      <ul className="mt-3 space-y-1">
        {items.map((i) => (
          <li key={i.etiqueta}>
            {i.ok ? (
              <span className="flex items-center gap-2 py-1 text-niebla">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-exito text-white"><Check size={11} /></span>
                {i.etiqueta}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onIr(i.seccion)}
                className="group flex w-full items-center gap-2 rounded-lg py-1 text-left text-carbon hover:text-verde-golf"
              >
                <span className="h-4 w-4 shrink-0 rounded-full border-2 border-champagne" />
                <span className="flex-1">{i.etiqueta}</span>
                <ChevronRight size={14} className="text-niebla transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const botonHerramienta =
  "flex w-full items-center gap-2.5 rounded-xl border border-arena bg-white px-3 py-2.5 text-left text-sm text-carbon transition hover:border-verde-golf/50 hover:bg-verde-golf/[0.03] disabled:opacity-50";

function descargar(nombre: string, contenido: string, tipo = "application/json") {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** Duplicar, exportar/importar, compartir e imprimir. */
export function AccionesExperiencia({
  e,
  guardada,
  onImportar,
}: {
  e: Experiencia;
  guardada: boolean;
  onImportar: (datos: Partial<Experiencia>) => void;
}) {
  const router = useRouter();
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();
  const archivo = useRef<HTMLInputElement>(null);

  const enlace = () => `${window.location.origin}/experiencias/${e.slug}`;
  const decir = (t: string) => {
    setAviso(t);
    setTimeout(() => setAviso(null), 2600);
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4 text-sm">
      <p className="font-medium text-carbon">Herramientas</p>
      <div className="mt-3 space-y-2">
        {guardada && (
          <>
            <button
              type="button"
              disabled={pendiente}
              className={botonHerramienta}
              onClick={() =>
                empezar(async () => {
                  const r = await duplicarExperiencia(e.slug);
                  if (r.ok) router.push(`/admin/experiencias/${r.slug}`);
                  else decir(r.error);
                })
              }
            >
              {pendiente ? <Loader2 size={15} className="animate-spin" /> : <Copy size={15} className="text-verde-golf" />}
              Duplicar como borrador
            </button>
            <Link href={`/admin/experiencias/${e.slug}/imprimir`} className={botonHerramienta}>
              <Printer size={15} className="text-verde-golf" /> Hoja para imprimir o PDF
            </Link>
            <button
              type="button"
              className={botonHerramienta}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(enlace());
                  decir("Enlace copiado");
                } catch {
                  decir("No se pudo copiar");
                }
              }}
            >
              <Share2 size={15} className="text-verde-golf" /> Copiar enlace público
            </button>
            <a
              className={botonHerramienta}
              target="_blank"
              rel="noopener noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(
                `${e.nombre}${e.fechas ? ` · ${e.fechas}` : ""}${e.desde ? ` · Desde ${e.desde}` : ""}\n`,
              )}`}
              onClick={(ev) => {
                ev.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(
                  `${e.nombre}${e.fechas ? ` · ${e.fechas}` : ""}${e.desde ? ` · Desde ${e.desde}` : ""}\n${enlace()}`,
                )}`;
              }}
            >
              <Share2 size={15} className="text-verde-golf" /> Compartir por WhatsApp
            </a>
          </>
        )}
        <button
          type="button"
          className={botonHerramienta}
          onClick={() => {
            descargar(`${e.slug || "experiencia"}.json`, JSON.stringify(e, null, 2));
            decir("Archivo descargado");
          }}
        >
          <Download size={15} className="text-verde-golf" /> Exportar a JSON
        </button>
        <button type="button" className={botonHerramienta} onClick={() => archivo.current?.click()}>
          <Upload size={15} className="text-verde-golf" /> Importar desde JSON
        </button>
        <input
          ref={archivo}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={async (ev) => {
            const f = ev.target.files?.[0];
            ev.target.value = "";
            if (!f) return;
            try {
              const datos = JSON.parse(await f.text()) as Partial<Experiencia>;
              if (typeof datos !== "object" || datos === null || !("nombre" in datos)) throw new Error("formato");
              if (!window.confirm("Esto reemplaza el contenido del editor con el del archivo (no se guarda hasta que pulses Guardar). ¿Continuar?")) return;
              onImportar(datos);
              decir("Archivo cargado: revisa y guarda");
            } catch {
              decir("El archivo no es una experiencia válida");
            }
          }}
        />
      </div>
      {aviso && <p role="status" className="mt-3 text-xs text-verde-golf">{aviso}</p>}
    </div>
  );
}

const fechaHora = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

/** Versiones anteriores guardadas: carga una en el editor para revisarla. */
export function HistorialVersiones({
  slug,
  onRestaurar,
}: {
  slug: string;
  onRestaurar: (datos: Experiencia) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [versiones, setVersiones] = useState<VersionFila[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  function alternar() {
    const siguiente = !abierto;
    setAbierto(siguiente);
    if (siguiente && versiones === null) {
      empezar(async () => {
        const r = await obtenerVersiones(slug);
        if (r.ok) setVersiones(r.versiones);
        else setError(r.error);
      });
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4 text-sm">
      <button type="button" onClick={alternar} aria-expanded={abierto} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2 font-medium text-carbon">
          <History size={15} className="text-verde-golf" /> Historial de versiones
        </span>
        <ChevronRight size={15} className={cn("text-niebla transition-transform", abierto && "rotate-90")} />
      </button>
      {abierto && (
        <div className="mt-3">
          {pendiente && versiones === null && <p className="text-xs text-niebla">Cargando…</p>}
          {error && <p className="text-xs text-error">{error}</p>}
          {versiones && versiones.length === 0 && (
            <p className="text-xs text-niebla">Todavía no hay versiones: se crea una cada vez que guardas.</p>
          )}
          {versiones && versiones.length > 0 && (
            <ul className="max-h-64 space-y-1.5 overflow-auto pr-1">
              {versiones.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2 rounded-lg border border-arena bg-white px-2.5 py-2">
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-carbon">{fechaHora(v.created_at)}</span>
                    {v.resumen && <span className="block truncate text-[11px] text-niebla">{v.resumen}</span>}
                  </span>
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() =>
                      empezar(async () => {
                        if (!window.confirm("Cargar esta versión en el editor? No se guarda hasta que pulses Guardar.")) return;
                        const r = await obtenerVersion(v.id);
                        if (r.ok) onRestaurar(r.datos);
                        else setError(r.error);
                      })
                    }
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-arena px-2 py-1 text-[11px] font-medium text-verde-golf hover:border-verde-golf/50"
                  >
                    <RotateCcw size={11} /> Cargar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
