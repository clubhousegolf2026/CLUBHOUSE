"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, FileInput, Inbox, Loader2, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PLANTILLAS, type Plantilla } from "@/lib/formularios/tipos";
import { estiloInput } from "@/components/admin/form-ui";
import { MiniaturaPlantilla } from "@/components/admin/formularios/miniaturas";
import {
  crearFormulario,
  duplicarFormulario,
  eliminarFormulario,
} from "@/app/admin/(panel)/formularios/actions";

export type ItemFormulario = {
  id: string;
  slug: string;
  nombre: string;
  plantilla: Plantilla;
  publicado: boolean;
  acento: string;
  respuestas: number;
  pagadas: number;
  cobra: boolean;
  updated_at: string;
};

export function ListaFormularios({ items, origen, migracionPendiente }: { items: ItemFormulario[]; origen: string; migracionPendiente: boolean }) {
  const router = useRouter();
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [plantilla, setPlantilla] = useState<Plantilla>("clasico");
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  function crear() {
    setError(null);
    empezar(async () => {
      const r = await crearFormulario({ nombre, plantilla });
      if (r.ok) router.push(`/admin/formularios/${r.id}`);
      else setError(r.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">Formularios</h1>
          <p className="max-w-2xl text-sm text-niebla">
            Crea formularios de inscripción con 5 plantillas modernas, campos a tu medida y cobro con Wompi. Cada respuesta llega al CRM.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreando((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-3 text-sm font-semibold text-crema hover:bg-verde-calle"
        >
          {creando ? <X size={16} /> : <Plus size={16} />} {creando ? "Cancelar" : "Nuevo formulario"}
        </button>
      </div>

      {migracionPendiente && (
        <div role="alert" className="rounded-2xl border border-alerta/30 bg-alerta/10 p-4 text-sm text-alerta">
          <strong className="block">Falta crear las tablas en Supabase.</strong>
          Ejecuta <code>supabase/migrations/0010_formularios_pagos.sql</code> en el SQL Editor y recarga.
        </div>
      )}

      {creando && (
        <section className="space-y-5 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6">
          <label className="block">
            <span className="text-sm font-medium text-carbon">Nombre del formulario</span>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Inscripción Utah 2027" className={cn(estiloInput, "mt-1.5 h-11")} />
          </label>
          <div>
            <span className="text-sm font-medium text-carbon">Elige una plantilla</span>
            <p className="text-xs text-niebla">Después puedes cambiarla sin perder tus campos.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {PLANTILLAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlantilla(p.id)}
                  aria-pressed={plantilla === p.id}
                  className={cn(
                    "overflow-hidden rounded-2xl border-2 bg-white text-left transition hover:-translate-y-0.5",
                    plantilla === p.id ? "border-verde-golf shadow-lg" : "border-arena",
                  )}
                >
                  <div className="aspect-[16/10] border-b border-arena"><MiniaturaPlantilla plantilla={p.id} /></div>
                  <div className="p-3">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-carbon">
                      {plantilla === p.id && <Check size={14} className="text-verde-golf" />} {p.nombre}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-niebla">{p.descripcion}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="button"
            disabled={pendiente}
            onClick={crear}
            className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60"
          >
            {pendiente && <Loader2 size={16} className="animate-spin" />} Crear y personalizar
          </button>
        </section>
      )}

      {items.length === 0 && !creando ? (
        <div className="rounded-2xl border border-dashed border-arena p-12 text-center">
          <FileInput size={30} className="mx-auto text-niebla" />
          <p className="mt-3 font-serif text-xl text-carbon">Aún no hay formularios</p>
          <p className="text-sm text-niebla">Crea el primero y elige entre las 5 plantillas.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((f) => (
            <li key={f.id} className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto shadow-[var(--shadow-suave)]">
              <Link href={`/admin/formularios/${f.id}`} className="relative block aspect-[16/8] border-b border-arena">
                <MiniaturaPlantilla plantilla={f.plantilla} acento={f.acento} />
                <span className={cn("absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold", f.publicado ? "bg-verde-golf text-crema" : "bg-carbon/80 text-crema")}>
                  {f.publicado ? "Publicado" : "Borrador"}
                </span>
              </Link>
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="font-serif text-lg leading-tight text-carbon">{f.nombre}</h2>
                  <p className="text-xs text-niebla">/f/{f.slug} · {PLANTILLAS.find((p) => p.id === f.plantilla)?.nombre}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Link href={`/admin/formularios/${f.id}/respuestas`} className="inline-flex items-center gap-1.5 text-carbon hover:text-verde-golf">
                    <Inbox size={15} /> <strong className="tabular-nums">{f.respuestas}</strong> respuestas
                  </Link>
                  {f.cobra && <span className="text-xs text-niebla"><strong className="tabular-nums text-exito">{f.pagadas}</strong> pagadas</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-arena pt-3 text-sm">
                  <Link href={`/admin/formularios/${f.id}`} className="font-medium text-verde-golf hover:underline">Editar</Link>
                  {f.publicado && (
                    <>
                      <a href={`/f/${f.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-niebla hover:text-carbon">
                        <ExternalLink size={13} /> Abrir
                      </a>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(`${origen}/f/${f.slug}`);
                            setCopiado(f.id);
                            setTimeout(() => setCopiado(null), 1800);
                          } catch {}
                        }}
                        className="inline-flex items-center gap-1 text-niebla hover:text-carbon"
                      >
                        {copiado === f.id ? <Check size={13} className="text-exito" /> : <Copy size={13} />} {copiado === f.id ? "Copiado" : "Copiar enlace"}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() =>
                      empezar(async () => {
                        const r = await duplicarFormulario(f.id);
                        if (r.ok) router.push(`/admin/formularios/${r.id}`);
                        else setError(r.error);
                      })
                    }
                    className="inline-flex items-center gap-1 text-niebla hover:text-carbon"
                  >
                    <Copy size={13} /> Duplicar
                  </button>
                  <button
                    type="button"
                    disabled={pendiente}
                    onClick={() => {
                      if (!window.confirm(`¿Eliminar «${f.nombre}» y sus ${f.respuestas} respuestas? No se puede deshacer.`)) return;
                      empezar(async () => {
                        const r = await eliminarFormulario(f.id);
                        if (r.ok) router.refresh();
                        else setError(r.error);
                      });
                    }}
                    className="ml-auto inline-flex items-center gap-1 text-error/80 hover:text-error"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && !creando && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
