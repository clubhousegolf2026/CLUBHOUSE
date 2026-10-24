"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type TipoEvento = "bloqueo" | "temporada_alta" | "cupo" | "salida" | "lead" | "accion";

export type EventoCal = {
  id: string;
  titulo: string;
  inicio: string; // YYYY-MM-DD
  fin: string;
  serie: string;
  tipo: TipoEvento;
  detalle?: string;
  href?: string;
};

export type SerieCal = { id: string; nombre: string; color: string };

const TIPO_TEXTO: Record<TipoEvento, string> = {
  bloqueo: "Bloqueo",
  temporada_alta: "Temporada alta",
  cupo: "Cupo limitado",
  salida: "Salida del viaje",
  lead: "Fecha tentativa del lead",
  accion: "Próxima acción",
};

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Celdas del mes empezando en lunes (siempre múltiplo de 7). */
function celdasDelMes(y: number, m: number) {
  const primero = new Date(Date.UTC(y, m, 1));
  const desfase = (primero.getUTCDay() + 6) % 7;
  const total = Math.ceil((desfase + new Date(Date.UTC(y, m + 1, 0)).getUTCDate()) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const f = new Date(Date.UTC(y, m, 1 - desfase + i));
    return { fecha: iso(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()), dia: f.getUTCDate(), delMes: f.getUTCMonth() === m };
  });
}

function formatoFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${fecha}T00:00:00Z`));
}

/** Estilo de la etiqueta según el tipo: el color lo pone el calendario. */
function estiloChip(tipo: TipoEvento, color: string): React.CSSProperties {
  if (tipo === "bloqueo") return { background: color, color: "#fff" };
  if (tipo === "cupo") return { background: "#fff", color: "#1a1a1a", boxShadow: `inset 0 0 0 1.5px ${color}` };
  return { background: `${color}26`, color: "#1a1a1a", boxShadow: `inset 3px 0 0 ${color}` };
}

export function CalendarioMes({
  eventos,
  series,
  vacio = "Sin eventos este día.",
}: {
  eventos: EventoCal[];
  series: SerieCal[];
  vacio?: string;
}) {
  const hoy = useMemo(() => {
    const d = new Date();
    return iso(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);
  const [anio, setAnio] = useState(() => new Date().getFullYear());
  const [mes, setMes] = useState(() => new Date().getMonth());
  const [apagadas, setApagadas] = useState<Set<string>>(new Set());
  const [dia, setDia] = useState<string | null>(null);

  const colorDe = useMemo(() => new Map(series.map((s) => [s.id, s.color])), [series]);
  const nombreDe = useMemo(() => new Map(series.map((s) => [s.id, s.nombre])), [series]);
  const visibles = useMemo(() => eventos.filter((e) => !apagadas.has(e.serie)), [eventos, apagadas]);
  const celdas = useMemo(() => celdasDelMes(anio, mes), [anio, mes]);

  const porDia = useMemo(() => {
    const mapa = new Map<string, EventoCal[]>();
    for (const c of celdas) {
      const lista = visibles.filter((e) => e.inicio <= c.fecha && c.fecha <= e.fin);
      if (lista.length) mapa.set(c.fecha, lista);
    }
    return mapa;
  }, [celdas, visibles]);

  const cuenta = (serie: string) => eventos.filter((e) => e.serie === serie).length;
  const titulo = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(anio, mes, 1)));

  const mover = (delta: number) => {
    const d = new Date(Date.UTC(anio, mes + delta, 1));
    setAnio(d.getUTCFullYear());
    setMes(d.getUTCMonth());
    setDia(null);
  };

  const delDia = dia ? (porDia.get(dia) ?? visibles.filter((e) => e.inicio <= dia && dia <= e.fin)) : [];

  return (
    <div className="space-y-4">
      {/* Leyenda con filtros */}
      <div className="flex flex-wrap gap-2">
        {series.map((s) => {
          const apagada = apagadas.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={!apagada}
              onClick={() =>
                setApagadas((prev) => {
                  const n = new Set(prev);
                  if (n.has(s.id)) n.delete(s.id);
                  else n.add(s.id);
                  return n;
                })
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                apagada ? "border-arena bg-white text-niebla/60" : "border-transparent bg-white text-carbon shadow-[var(--shadow-suave)]",
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: apagada ? "#cbd0d6" : s.color }} />
              <span className={apagada ? "line-through" : ""}>{s.nombre}</span>
              <span className="tabular-nums text-niebla">{cuenta(s.id)}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto shadow-[var(--shadow-suave)]">
        <header className="flex items-center justify-between gap-3 border-b border-arena px-4 py-3 sm:px-5">
          <h2 className="font-serif text-xl capitalize text-carbon">{titulo}</h2>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                setAnio(d.getFullYear());
                setMes(d.getMonth());
                setDia(hoy);
              }}
              className="rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"
            >
              Hoy
            </button>
            <button type="button" onClick={() => mover(-1)} aria-label="Mes anterior" className="grid h-8 w-8 place-items-center rounded-lg border border-arena bg-white text-carbon hover:border-verde-golf/50">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => mover(1)} aria-label="Mes siguiente" className="grid h-8 w-8 place-items-center rounded-lg border border-arena bg-white text-carbon hover:border-verde-golf/50">
              <ChevronRight size={16} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-7 border-b border-arena bg-crema/60 text-center text-[11px] font-semibold uppercase tracking-wider text-niebla">
          {DIAS.map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {celdas.map((c, i) => {
            const lista = porDia.get(c.fecha) ?? [];
            const esHoy = c.fecha === hoy;
            const elegido = c.fecha === dia;
            return (
              <button
                key={c.fecha}
                type="button"
                onClick={() => setDia(elegido ? null : c.fecha)}
                aria-label={`${formatoFecha(c.fecha)}: ${lista.length} evento(s)`}
                className={cn(
                  "relative flex min-h-[4.5rem] flex-col gap-1 border-arena p-1.5 text-left transition-colors sm:min-h-[6.5rem]",
                  i % 7 !== 6 && "border-r",
                  i < celdas.length - 7 && "border-b",
                  !c.delMes && "bg-crema/40 text-niebla/50",
                  elegido ? "bg-verde-golf/[0.07] ring-2 ring-inset ring-verde-golf" : "hover:bg-verde-golf/[0.04]",
                )}
              >
                <span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs tabular-nums", esHoy ? "bg-verde-golf font-semibold text-crema" : "text-carbon")}>
                  {c.dia}
                </span>
                {/* Escritorio: etiquetas; móvil: puntos */}
                <span className="hidden min-w-0 flex-col gap-0.5 sm:flex">
                  {lista.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="truncate rounded px-1.5 py-0.5 text-[10.5px] font-medium leading-tight"
                      style={estiloChip(e.tipo, colorDe.get(e.serie) ?? "#2e5b45")}
                    >
                      {e.titulo}
                    </span>
                  ))}
                  {lista.length > 3 && <span className="px-1 text-[10.5px] text-niebla">+{lista.length - 3} más</span>}
                </span>
                <span className="flex flex-wrap gap-0.5 sm:hidden">
                  {lista.slice(0, 6).map((e) => (
                    <span key={e.id} className="h-1.5 w-1.5 rounded-full" style={{ background: colorDe.get(e.serie) ?? "#2e5b45" }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {dia && (
        <section className="rounded-2xl border border-arena bg-blanco-roto p-4 shadow-[var(--shadow-suave)] sm:p-5">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg text-carbon">{formatoFecha(dia)}</h3>
            <button type="button" onClick={() => setDia(null)} aria-label="Cerrar" className="text-niebla hover:text-carbon">
              <X size={16} />
            </button>
          </header>
          {delDia.length === 0 ? (
            <p className="text-sm text-niebla">{vacio}</p>
          ) : (
            <ul className="space-y-2">
              {delDia.map((e) => {
                const color = colorDe.get(e.serie) ?? "#2e5b45";
                const contenido = (
                  <>
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-carbon">{e.titulo}</span>
                      <span className="block text-xs text-niebla">
                        {nombreDe.get(e.serie)} · {TIPO_TEXTO[e.tipo]}
                        {e.inicio !== e.fin ? ` · ${formatoFecha(e.inicio)} → ${formatoFecha(e.fin)}` : ""}
                      </span>
                      {e.detalle && <span className="mt-0.5 block text-xs text-niebla">{e.detalle}</span>}
                    </span>
                  </>
                );
                return (
                  <li key={e.id}>
                    {e.href ? (
                      <Link href={e.href} className="flex items-start gap-3 rounded-xl border border-arena bg-white p-3 hover:border-verde-golf/50">
                        {contenido}
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3 rounded-xl border border-arena bg-white p-3">{contenido}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-niebla">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-niebla" /> Bloqueo</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-niebla/20 shadow-[inset_3px_0_0_#5c6470]" /> Temporada alta, salida, lead</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-5 rounded bg-white shadow-[inset_0_0_0_1.5px_#5c6470]" /> Cupo limitado</span>
      </p>
    </div>
  );
}
