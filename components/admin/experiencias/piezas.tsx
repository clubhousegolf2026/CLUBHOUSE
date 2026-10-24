"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Link2, Plus, X } from "lucide-react";
import { AreaTexto, Entrada } from "@/components/admin/form-ui";
import { SubirFotos } from "@/components/admin/subir-fotos";

/** Lista editable de elementos: agregar, quitar y reordenar con flechas. */
export function Lista<T>({
  items,
  onChange,
  nuevo,
  agregar,
  vacio,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  nuevo: () => T;
  agregar: string;
  vacio: string;
  children: (item: T, set: (parche: Partial<T>) => void, i: number) => React.ReactNode;
}) {
  function mover(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= items.length) return;
    const copia = [...items];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    onChange(copia);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-arena p-4 text-center text-sm text-niebla">{vacio}</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-arena bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-niebla">#{i + 1}</span>
            <span className="flex items-center gap-1">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="grid h-8 w-8 place-items-center rounded-lg text-niebla hover:bg-arena/50 disabled:opacity-30">
                <ArrowUp size={15} />
              </button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === items.length - 1} aria-label="Bajar" className="grid h-8 w-8 place-items-center rounded-lg text-niebla hover:bg-arena/50 disabled:opacity-30">
                <ArrowDown size={15} />
              </button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Quitar" className="grid h-8 w-8 place-items-center rounded-lg text-error hover:bg-error/10">
                <X size={15} />
              </button>
            </span>
          </div>
          {children(item, (p) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x))), i)}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, nuevo()])}
        className="inline-flex items-center gap-2 rounded-xl border border-verde-golf/40 px-4 py-2.5 text-sm font-medium text-verde-golf hover:bg-verde-golf/5"
      >
        <Plus size={15} /> {agregar}
      </button>
    </div>
  );
}

/** Un elemento por línea. Se conservan las líneas vacías mientras se escribe;
 *  el servidor las limpia al guardar. */
export function Lineas({
  valor,
  onChange,
  filas = 4,
  placeholder,
}: {
  valor: string[];
  onChange: (v: string[]) => void;
  filas?: number;
  placeholder?: string;
}) {
  return (
    <AreaTexto
      rows={filas}
      placeholder={placeholder}
      value={valor.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
    />
  );
}

/** Foto con vista previa: subir un archivo o pegar una dirección. */
export function CampoFoto({
  url,
  onChange,
  carpeta,
  alt,
}: {
  url: string;
  onChange: (url: string) => void;
  carpeta: string;
  alt: string;
}) {
  const [porUrl, setPorUrl] = useState(false);

  if (url) {
    return (
      <div className="group relative aspect-[16/9] max-w-md overflow-hidden rounded-2xl bg-arena">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="h-full w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-3 rounded-xl bg-carbon/70 px-3 py-1.5 text-xs text-crema backdrop-blur hover:bg-error"
        >
          Cambiar foto
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-2">
      <SubirFotos
        multiple={false}
        carpeta={carpeta}
        alt={alt}
        onSubidas={(fotos) => onChange(fotos[fotos.length - 1].url)}
      />
      {porUrl ? (
        <Entrada placeholder="https://… o /fotos/archivo.webp" onChange={(e) => onChange(e.target.value.trim())} />
      ) : (
        <button type="button" onClick={() => setPorUrl(true)} className="inline-flex items-center gap-1.5 text-sm text-verde-golf hover:underline">
          <Link2 size={14} /> Pegar una dirección de imagen
        </button>
      )}
    </div>
  );
}

export function GaleriaFotos({
  fotos,
  onChange,
  carpeta,
}: {
  fotos: { url: string; alt: string }[];
  onChange: (f: { url: string; alt: string }[]) => void;
  carpeta: string;
}) {
  return (
    <div className="space-y-3">
      {fotos.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-3">
          {fotos.map((f, i) => (
            <li key={`${f.url}-${i}`} className="overflow-hidden rounded-2xl border border-arena bg-white">
              <div className="relative aspect-[4/3] bg-arena">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.alt} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(fotos.filter((_, j) => j !== i))}
                  aria-label="Quitar foto"
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-carbon/70 text-crema hover:bg-error"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="p-2">
                <Entrada
                  placeholder="Descripción de la foto"
                  value={f.alt}
                  onChange={(e) => onChange(fotos.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <SubirFotos
        carpeta={carpeta}
        alt=""
        onSubidas={(nuevas) => onChange([...fotos, ...nuevas])}
      />
      <p className="flex items-center gap-1.5 text-xs text-niebla">
        <ImagePlus size={13} /> JPG, PNG o WebP. Se optimizan automáticamente.
      </p>
    </div>
  );
}
