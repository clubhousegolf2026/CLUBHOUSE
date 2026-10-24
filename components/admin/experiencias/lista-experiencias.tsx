"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, EyeOff, Loader2, Search, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { estiloInput } from "@/components/admin/form-ui";
import {
  cambiarPublicacion,
  duplicarExperiencia,
} from "@/app/admin/(panel)/experiencias/actions";

export type ItemExperiencia = {
  slug: string;
  nombre: string;
  pais: string;
  bandera: string;
  fechas: string;
  duracion: string;
  desde: string;
  foto: string;
  fotoAlt: string;
  publicada: boolean;
  destacada: boolean;
  enBase: boolean;
  salidas: number;
};

type Filtro = "todas" | "publicadas" | "borradores";
type Orden = "orden" | "nombre" | "pais";

export function ListaExperiencias({ items }: { items: ItemExperiencia[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [orden, setOrden] = useState<Orden>("orden");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, empezar] = useTransition();

  const conteo = useMemo(
    () => ({
      todas: items.length,
      publicadas: items.filter((i) => i.publicada).length,
      borradores: items.filter((i) => !i.publicada).length,
    }),
    [items],
  );

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    const lista = items.filter((i) => {
      if (filtro === "publicadas" && !i.publicada) return false;
      if (filtro === "borradores" && i.publicada) return false;
      return !t || `${i.nombre} ${i.pais}`.toLowerCase().includes(t);
    });
    if (orden === "nombre") return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    if (orden === "pais") return [...lista].sort((a, b) => a.pais.localeCompare(b.pais, "es"));
    return lista; // ya vienen por orden
  }, [items, q, filtro, orden]);

  function ejecutar(slug: string, tarea: () => Promise<{ ok: boolean; error?: string; slug?: string }>, alTerminar?: (slug?: string) => void) {
    setError(null);
    setOcupado(slug);
    empezar(async () => {
      const r = await tarea();
      setOcupado(null);
      if (!r.ok) return setError(r.error ?? "No se pudo completar.");
      if (alTerminar) alTerminar(r.slug);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[14rem] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-niebla" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o país…"
            className={cn(estiloInput, "h-11 pl-10")}
          />
        </label>
        <div className="inline-flex rounded-xl border border-arena bg-white p-1">
          {(
            [
              ["todas", "Todas"],
              ["publicadas", "Publicadas"],
              ["borradores", "Borradores"],
            ] as const
          ).map(([id, etiqueta]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFiltro(id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                filtro === id ? "bg-verde-golf text-crema" : "text-niebla hover:text-carbon",
              )}
            >
              {etiqueta} <span className="tabular-nums opacity-70">{conteo[id]}</span>
            </button>
          ))}
        </div>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as Orden)}
          aria-label="Ordenar por"
          className={cn(estiloInput, "h-11 w-auto")}
        >
          <option value="orden">Orden del sitio</option>
          <option value="nombre">Nombre</option>
          <option value="pais">País</option>
        </select>
      </div>

      {error && <p role="alert" className="text-sm text-error">{error}</p>}

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-arena p-10 text-center text-sm text-niebla">
          {items.length === 0 ? "Aún no hay experiencias. Crea la primera." : "Ninguna experiencia coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map((e) => (
            <li key={e.slug} className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto shadow-[var(--shadow-suave)]">
              <Link href={`/admin/experiencias/${e.slug}`} className="relative block aspect-[16/9] bg-arena">
                {e.foto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.foto} alt={e.fotoAlt || e.nombre} className="h-full w-full object-cover" />
                )}
                <span className={cn("absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold", e.publicada ? "bg-verde-golf text-crema" : "bg-carbon/80 text-crema")}>
                  {e.publicada ? "Publicada" : "Borrador"}
                </span>
                {e.destacada && (
                  <span className="absolute left-3 top-11 inline-flex items-center gap-1 rounded-full bg-champagne px-2.5 py-1 text-xs font-semibold text-white">
                    <Star size={11} /> Destacada
                  </span>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-carbon">
                  {e.enBase ? "En Supabase" : "Solo en código"}
                </span>
              </Link>
              <div className="space-y-1 p-4">
                <p className="text-xs text-niebla">
                  <span aria-hidden>{e.bandera}</span> {e.pais}
                </p>
                <h2 className="font-serif text-lg leading-tight text-carbon">{e.nombre}</h2>
                <p className="text-sm text-niebla">
                  {e.fechas || "Sin fechas"} · {e.duracion || "—"}
                  {e.salidas > 0 ? ` · ${e.salidas} ${e.salidas === 1 ? "salida" : "salidas"}` : ""}
                </p>
                <p className="text-sm text-carbon">{e.desde ? `Desde ${e.desde}` : "Sin precio"}</p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-arena pt-3 text-sm">
                  <Link href={`/admin/experiencias/${e.slug}`} className="font-medium text-verde-golf hover:underline">
                    Editar
                  </Link>
                  <Link href={`/experiencias/${e.slug}`} target="_blank" className="text-niebla hover:underline">
                    Ver en el sitio
                  </Link>
                  {e.enBase && (
                    <>
                      <button
                        type="button"
                        disabled={ocupado === e.slug}
                        onClick={() => ejecutar(e.slug, () => cambiarPublicacion(e.slug, !e.publicada))}
                        className="inline-flex items-center gap-1 text-niebla hover:text-carbon disabled:opacity-50"
                      >
                        {e.publicada ? <EyeOff size={13} /> : <Eye size={13} />}
                        {e.publicada ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        type="button"
                        disabled={ocupado === e.slug}
                        onClick={() => ejecutar(e.slug, () => duplicarExperiencia(e.slug), (nuevo) => router.push(`/admin/experiencias/${nuevo}`))}
                        className="inline-flex items-center gap-1 text-niebla hover:text-carbon disabled:opacity-50"
                      >
                        {ocupado === e.slug ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />} Duplicar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
