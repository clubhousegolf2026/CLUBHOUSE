"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { alturaInput, estiloInput } from "@/components/admin/form-ui";
import {
  actualizarCalendario,
  crearCalendario,
  eliminarCalendario,
} from "@/app/admin/(panel)/calendario/actions";

export const COLORES_CALENDARIO = ["#2e5b45", "#a98745", "#2563eb", "#b42318", "#6d28d9", "#0e7490", "#b7791f", "#be185d"];

export type CalendarioFila = {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: string;
  experiencia_slug: string | null;
};

type Opcion = { slug: string; nombre: string };

function Formulario({
  inicial,
  experiencias,
  alTerminar,
}: {
  inicial?: CalendarioFila;
  experiencias: Opcion[];
  alTerminar: (id?: string) => void;
}) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [color, setColor] = useState(inicial?.color ?? COLORES_CALENDARIO[0]);
  const [slug, setSlug] = useState(inicial?.experiencia_slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  return (
    <div className="space-y-4 rounded-2xl border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)]">
      <h3 className="font-serif text-lg text-carbon">{inicial ? "Editar calendario" : "Nuevo calendario"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-carbon">Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: Utah 2027, Mantenimiento de campos" className={cn(estiloInput, alturaInput, "mt-1.5")} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-carbon">Viaje asociado (opcional)</span>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className={cn(estiloInput, alturaInput, "mt-1.5")}>
            <option value="">Ninguno</option>
            {experiencias.map((x) => (
              <option key={x.slug} value={x.slug}>{x.nombre}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-niebla">Si eliges un viaje, sus salidas aparecen en este calendario.</span>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-carbon">Descripción (opcional)</span>
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={cn(estiloInput, alturaInput, "mt-1.5")} />
      </label>
      <div>
        <span className="text-sm font-medium text-carbon">Color</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {COLORES_CALENDARIO.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
              onClick={() => setColor(c)}
              className={cn("h-8 w-8 rounded-full ring-offset-2 transition", color === c ? "ring-2 ring-carbon" : "hover:scale-110")}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            empezar(async () => {
              setError(null);
              const datos = { nombre, descripcion, color, experienciaSlug: slug || null };
              if (inicial) {
                const r = await actualizarCalendario(inicial.id, datos);
                if (r.ok) alTerminar();
                else setError(r.error);
              } else {
                const r = await crearCalendario(datos);
                if (r.ok) alTerminar(r.id);
                else setError(r.error);
              }
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60"
        >
          {pendiente && <Loader2 size={16} className="animate-spin" />}
          {inicial ? "Guardar cambios" : "Crear calendario"}
        </button>
        <button type="button" onClick={() => alTerminar()} className="rounded-xl border border-arena bg-white px-4 py-2.5 text-sm text-carbon hover:border-verde-golf/40">
          Cancelar
        </button>
      </div>
    </div>
  );
}

/** Botón «Nuevo calendario»: al crear, abre el calendario recién hecho. */
export function NuevoCalendario({ experiencias }: { experiencias: Opcion[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-4 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle"
      >
        <Plus size={16} /> Nuevo calendario
      </button>
      {abierto && (
        <div className="basis-full">
          <Formulario
            experiencias={experiencias}
            alTerminar={(id) => {
              setAbierto(false);
              if (id) router.push(`/admin/calendario?cal=${id}`);
              else router.refresh();
            }}
          />
        </div>
      )}
    </>
  );
}

/** Editar o eliminar el calendario que se está viendo. */
export function AjustesCalendario({ calendario, experiencias }: { calendario: CalendarioFila; experiencias: Opcion[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  if (editando) {
    return (
      <Formulario
        inicial={calendario}
        experiencias={experiencias}
        alTerminar={() => {
          setEditando(false);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => setEditando(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50">
        <Pencil size={13} /> Editar calendario
      </button>
      <button
        type="button"
        disabled={pendiente}
        onClick={() => {
          if (!window.confirm(`¿Eliminar el calendario «${calendario.nombre}» y todas sus fechas? No se puede deshacer.`)) return;
          empezar(async () => {
            const r = await eliminarCalendario(calendario.id);
            if (r.ok) router.push("/admin/calendario");
            else setError(r.error);
          });
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-error hover:border-error/50"
      >
        {pendiente ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Eliminar
      </button>
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  );
}
