"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarClock,
  Download,
  LayoutGrid,
  List,
  Mail,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { moverContacto } from "@/app/admin/(panel)/crm/actions";
import { ORDEN_ESTADOS_CONTACTO, ETIQUETA_ESTADO_CONTACTO } from "@/components/admin/estado-badge";
import { cop } from "@/lib/format";
import { LeadDrawer } from "./lead-drawer";
import { NuevoLeadModal } from "./nuevo-lead-modal";
import {
  ABIERTOS,
  COLOR_ESTADO,
  GANADOS,
  INTERESES,
  diasDesde,
  enlaceWhatsApp,
  interesDe,
  fechaCorta,
  iniciales,
  textoHace,
  vencida,
  type Estado,
  type Lead,
} from "./tipos";

type Orden = "reciente" | "antiguo" | "valor" | "nombre";
const ORDENES: { id: Orden; etiqueta: string }[] = [
  { id: "reciente", etiqueta: "Más recientes" },
  { id: "antiguo", etiqueta: "Más antiguos" },
  { id: "valor", etiqueta: "Mayor valor" },
  { id: "nombre", etiqueta: "Nombre A–Z" },
];

const select =
  "rounded-xl border border-arena bg-white px-3 py-2.5 text-sm text-carbon outline-none transition focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";

export function CrmWorkspace({
  inicial,
  errorCarga,
}: {
  inicial: Lead[];
  errorCarga: string | null;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(inicial);
  const [q, setQ] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Estado | "todos">("todos");
  const [filtroOrigen, setFiltroOrigen] = useState("todos");
  const [soloVencidos, setSoloVencidos] = useState(false);
  const [filtroInteres, setFiltroInteres] = useState<string>("todos");
  const [orden, setOrden] = useState<Orden>("reciente");
  const [vista, setVista] = useState<"tablero" | "lista">("tablero");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [, startMover] = useTransition();

  // Cuando el servidor trae datos nuevos (router.refresh) se sincronizan.
  useEffect(() => setLeads(inicial), [inicial]);
  useEffect(() => {
    try {
      const guardada = localStorage.getItem("crm-vista");
      if (guardada === "lista" || guardada === "tablero") setVista(guardada);
    } catch {}
  }, []);
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  function cambiarVista(v: "tablero" | "lista") {
    setVista(v);
    try {
      localStorage.setItem("crm-vista", v);
    } catch {}
  }

  const origenes = useMemo(() => [...new Set(leads.map((l) => l.origen))].sort(), [leads]);

  const kpi = useMemo(() => {
    const abiertos = leads.filter((l) => ABIERTOS.includes(l.estado));
    const ganados = leads.filter((l) => GANADOS.includes(l.estado));
    const perdidos = leads.filter((l) => l.estado === "perdido");
    const cerrados = ganados.length + perdidos.length;
    return {
      total: leads.length,
      abiertos: abiertos.length,
      valorAbierto: abiertos.reduce((s, l) => s + (l.valor_estimado_cop ?? 0), 0),
      ganados: ganados.length,
      conversion: cerrados > 0 ? Math.round((ganados.length / cerrados) * 100) : null,
      seguimiento: abiertos.filter(
        (l) => vencida(l.proxima_fecha) || (!l.proxima_fecha && diasDesde(l.updated_at) > 5),
      ).length,
    };
  }, [leads]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    const lista = leads.filter(
      (l) =>
        (filtroEstado === "todos" || l.estado === filtroEstado) &&
        (filtroOrigen === "todos" || l.origen === filtroOrigen) &&
        (filtroInteres === "todos" || (filtroInteres === "sin" ? interesDe(l) === null : interesDe(l) === filtroInteres)) &&
        (!soloVencidos || (ABIERTOS.includes(l.estado) && (vencida(l.proxima_fecha) || (!l.proxima_fecha && diasDesde(l.updated_at) > 5)))) &&
        (!t ||
          [l.nombre, l.email, l.telefono ?? "", l.etiquetas.join(" "), l.proxima_accion ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(t)),
    );
    const cmp: Record<Orden, (a: Lead, b: Lead) => number> = {
      reciente: (a, b) => b.updated_at.localeCompare(a.updated_at),
      antiguo: (a, b) => a.updated_at.localeCompare(b.updated_at),
      valor: (a, b) => (b.valor_estimado_cop ?? 0) - (a.valor_estimado_cop ?? 0),
      nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
    };
    return lista.sort(cmp[orden]);
  }, [leads, q, filtroEstado, filtroOrigen, filtroInteres, soloVencidos, orden]);

  function parchar(id: string, patch: Partial<Lead>) {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function mover(id: string, estado: Estado) {
    const previo = leads.find((l) => l.id === id);
    if (!previo || previo.estado === estado) return;
    parchar(id, { estado, updated_at: new Date().toISOString() });
    startMover(async () => {
      const r = await moverContacto(id, estado);
      if (!r.ok) {
        parchar(id, { estado: previo.estado, updated_at: previo.updated_at });
        setAviso(`No se pudo mover: ${r.error}`);
      }
    });
  }

  function exportarCsv() {
    const cab = ["Nombre", "Correo", "Teléfono", "Etapa", "Origen", "Valor estimado COP", "Próxima acción", "Fecha acción", "Etiquetas", "Creado", "Última actividad"];
    const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const filas = visibles.map((l) =>
      [
        l.nombre, l.email, l.telefono, ETIQUETA_ESTADO_CONTACTO[l.estado], l.origen,
        l.valor_estimado_cop, l.proxima_accion, l.proxima_fecha, l.etiquetas.join("; "),
        l.created_at.slice(0, 10), l.updated_at.slice(0, 10),
      ].map(esc).join(","),
    );
    const csv = "﻿" + [cab.map(esc).join(","), ...filas].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-clubhouse-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const leadAbierto = abierto ? leads.find((l) => l.id === abierto) ?? null : null;
  const hayFiltros = q || filtroEstado !== "todos" || filtroOrigen !== "todos" || filtroInteres !== "todos" || soloVencidos;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">CRM</h1>
          <p className="text-sm text-niebla">Todos los leads del sitio y de su equipo, por etapa.</p>
        </div>
        <button
          onClick={() => setNuevo(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-3 text-sm font-semibold text-crema shadow-lg shadow-verde-calle/20 transition hover:-translate-y-0.5 hover:bg-verde-calle"
        >
          <Plus size={17} /> Nuevo lead
        </button>
      </div>

      {errorCarga && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <strong className="block">No se pudieron cargar los leads.</strong>
            {errorCarga}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi icono={<Users size={17} />} etiqueta="Leads totales" valor={String(kpi.total)} detalle={`${kpi.abiertos} abiertos`} />
        <Kpi icono={<Wallet size={17} />} etiqueta="Valor en juego" valor={cop(kpi.valorAbierto)} detalle="Leads abiertos" />
        <Kpi icono={<Trophy size={17} />} etiqueta="Ganados" valor={String(kpi.ganados)} detalle="Confirmados + viajaron" />
        <Kpi icono={<TrendingUp size={17} />} etiqueta="Conversión" valor={kpi.conversion === null ? "—" : `${kpi.conversion}%`} detalle="Ganados / cerrados" />
        <Kpi
          icono={<CalendarClock size={17} />}
          etiqueta="Por atender"
          valor={String(kpi.seguimiento)}
          detalle="Acción vencida o +5 días sin novedad"
          alerta={kpi.seguimiento > 0}
          onClick={() => setSoloVencidos((v) => !v)}
          activo={soloVencidos}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Experiencia de interés">
        {([
          ["todos", "Todas las experiencias", leads.length],
          ...INTERESES.map((i) => [i.id, i.nombre, leads.filter((l) => interesDe(l) === i.id).length] as const),
          ["sin", "Sin definir", leads.filter((l) => interesDe(l) === null).length],
        ] as const).map(([id, nombre, n]) => (
          <button
            key={id}
            onClick={() => setFiltroInteres(id)}
            aria-pressed={filtroInteres === id}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filtroInteres === id
                ? "border-verde-golf bg-verde-golf text-crema"
                : "border-arena bg-white text-niebla hover:border-verde-golf/40 hover:text-carbon"
            }`}
          >
            {nombre} <span className="ml-1 tabular-nums opacity-70">{n}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-niebla" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nombre, correo, teléfono, etiqueta…"
            className={`${select} w-full pl-10`}
          />
        </div>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as Estado | "todos")} className={select} aria-label="Etapa">
          <option value="todos">Todas las etapas</option>
          {ORDEN_ESTADOS_CONTACTO.map((e) => (
            <option key={e} value={e}>{ETIQUETA_ESTADO_CONTACTO[e]}</option>
          ))}
        </select>
        <select value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)} className={select} aria-label="Origen">
          <option value="todos">Todos los orígenes</option>
          {origenes.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className={select} aria-label="Orden">
          {ORDENES.map((o) => (
            <option key={o.id} value={o.id}>{o.etiqueta}</option>
          ))}
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setQ(""); setFiltroEstado("todos"); setFiltroOrigen("todos"); setFiltroInteres("todos"); setSoloVencidos(false); }}
            className="text-sm text-verde-golf hover:underline"
          >
            Limpiar
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportarCsv} className={`${select} inline-flex items-center gap-2 hover:border-verde-golf/40`} title="Exportar lo que ves a CSV">
            <Download size={15} /> CSV
          </button>
          <div className="inline-flex rounded-xl border border-arena bg-white p-1">
            {([["tablero", LayoutGrid, "Tablero"], ["lista", List, "Lista"]] as const).map(([v, Icono, nombre]) => (
              <button
                key={v}
                onClick={() => cambiarVista(v)}
                aria-pressed={vista === v}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${vista === v ? "bg-verde-golf text-crema" : "text-niebla hover:text-carbon"}`}
              >
                <Icono size={15} /> {nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {leads.length === 0 && !errorCarga ? (
        <div className="rounded-[1.75rem] border border-dashed border-arena bg-blanco-roto p-12 text-center">
          <p className="font-serif text-xl text-carbon">Todavía no hay leads</p>
          <p className="mt-1 text-sm text-niebla">Llegan solos desde el formulario de contacto del sitio, o créalos tú mismo.</p>
          <button onClick={() => setNuevo(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema">
            <Plus size={16} /> Crear el primero
          </button>
        </div>
      ) : vista === "tablero" ? (
        <Tablero leads={visibles} onAbrir={setAbierto} onMover={mover} />
      ) : (
        <Lista leads={visibles} onAbrir={setAbierto} onMover={mover} />
      )}

      {leadAbierto && (
        <LeadDrawer
          key={leadAbierto.id}
          lead={leadAbierto}
          onCerrar={() => setAbierto(null)}
          onCambio={parchar}
          onMover={mover}
          onEliminado={(id) => {
            setLeads((ls) => ls.filter((l) => l.id !== id));
            setAbierto(null);
          }}
        />
      )}
      {nuevo && (
        <NuevoLeadModal
          onCerrar={() => setNuevo(false)}
          onCreado={() => {
            setNuevo(false);
            router.refresh();
          }}
        />
      )}
      {aviso && (
        <div role="alert" className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-carbon px-5 py-3 text-sm text-crema shadow-2xl">
          {aviso}
        </div>
      )}
    </div>
  );
}

function Kpi({
  icono, etiqueta, valor, detalle, alerta, onClick, activo,
}: {
  icono: React.ReactNode; etiqueta: string; valor: string; detalle: string;
  alerta?: boolean; onClick?: () => void; activo?: boolean;
}) {
  const Cont = onClick ? "button" : "div";
  return (
    <Cont
      onClick={onClick}
      className={`rounded-2xl border bg-blanco-roto p-4 text-left transition ${
        activo ? "border-verde-golf ring-4 ring-verde-golf/10" : "border-arena"
      } ${onClick ? "hover:-translate-y-0.5 hover:border-verde-golf/40" : ""}`}
    >
      <div className="flex items-center justify-between text-niebla">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">{etiqueta}</span>
        <span className={alerta ? "text-error" : "text-verde-golf"}>{icono}</span>
      </div>
      <p className={`mt-2 truncate font-serif text-2xl tabular-nums ${alerta ? "text-error" : "text-carbon"}`}>{valor}</p>
      <p className="mt-0.5 text-xs text-niebla">{detalle}</p>
    </Cont>
  );
}

function Tablero({
  leads, onAbrir, onMover,
}: { leads: Lead[]; onAbrir: (id: string) => void; onMover: (id: string, e: Estado) => void }) {
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Estado | null>(null);

  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
      {ORDEN_ESTADOS_CONTACTO.map((estado) => {
        const col = leads.filter((l) => l.estado === estado);
        const total = col.reduce((s, l) => s + (l.valor_estimado_cop ?? 0), 0);
        return (
          <section
            key={estado}
            onDragOver={(e) => { e.preventDefault(); setSobre(estado); }}
            onDragLeave={() => setSobre((s) => (s === estado ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain") || arrastrando;
              if (id) onMover(id, estado);
              setSobre(null);
              setArrastrando(null);
            }}
            className={`flex w-[290px] shrink-0 flex-col rounded-2xl border p-3 transition ${
              sobre === estado ? "border-verde-golf bg-verde-golf/5" : "border-arena bg-white/50"
            }`}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-carbon">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR_ESTADO[estado] }} />
                {ETIQUETA_ESTADO_CONTACTO[estado]}
              </h2>
              <span className="rounded-full bg-arena/50 px-2 py-0.5 text-xs tabular-nums text-niebla">{col.length}</span>
            </header>
            {total > 0 && <p className="mb-2 px-1 text-xs text-niebla">{cop(total)}</p>}
            <div className="flex min-h-[80px] flex-col gap-2.5">
              {col.map((l) => (
                <Tarjeta
                  key={l.id}
                  lead={l}
                  arrastrando={arrastrando === l.id}
                  onAbrir={() => onAbrir(l.id)}
                  onDragStart={(e) => { e.dataTransfer.setData("text/plain", l.id); e.dataTransfer.effectAllowed = "move"; setArrastrando(l.id); }}
                  onDragEnd={() => { setArrastrando(null); setSobre(null); }}
                />
              ))}
              {col.length === 0 && (
                <p className="rounded-xl border border-dashed border-arena p-4 text-center text-xs text-niebla">
                  Arrastra un lead aquí
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Tarjeta({
  lead: l, arrastrando, onAbrir, onDragStart, onDragEnd,
}: {
  lead: Lead; arrastrando: boolean; onAbrir: () => void;
  onDragStart: (e: React.DragEvent) => void; onDragEnd: () => void;
}) {
  const wa = enlaceWhatsApp(l.telefono);
  const pasada = vencida(l.proxima_fecha) && ABIERTOS.includes(l.estado);
  const fria = ABIERTOS.includes(l.estado) && !l.proxima_fecha && diasDesde(l.updated_at) > 5;
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onAbrir}
      className={`group cursor-grab rounded-xl border border-arena bg-blanco-roto p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-verde-golf/40 hover:shadow-md active:cursor-grabbing ${arrastrando ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-semibold text-white" style={{ background: COLOR_ESTADO[l.estado] }}>
          {iniciales(l.nombre)}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-carbon">{l.nombre}</h3>
          <p className="truncate text-xs text-niebla">{l.email}</p>
        </div>
      </div>

      {l.proxima_accion && (
        <p className={`mt-2.5 flex items-start gap-1.5 text-xs ${pasada ? "font-medium text-error" : "text-carbon"}`}>
          <CalendarClock size={13} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">
            {l.proxima_accion}{l.proxima_fecha ? ` · ${fechaCorta(l.proxima_fecha)}` : ""}
          </span>
        </p>
      )}

      {l.etiquetas.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {l.etiquetas.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] font-medium text-[#8a6d1f]">{t}</span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-medium tabular-nums text-carbon">{l.valor_estimado_cop ? cop(l.valor_estimado_cop) : <span className="text-niebla">Sin valor</span>}</span>
        <span className={fria ? "font-medium text-error" : "text-niebla"}>{textoHace(l.updated_at)}</span>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-arena pt-2.5">
        <span className="rounded-full bg-arena/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-niebla">{l.origen}</span>
        <span className="flex gap-1 opacity-60 transition group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-7 w-7 place-items-center rounded-lg text-[#1b8a5a] hover:bg-[#1b8a5a]/10">
              <MessageCircle size={15} />
            </a>
          )}
          <a href={`mailto:${l.email}`} aria-label="Correo" className="grid h-7 w-7 place-items-center rounded-lg text-verde-golf hover:bg-verde-golf/10">
            <Mail size={15} />
          </a>
        </span>
      </div>
    </article>
  );
}

function Lista({
  leads, onAbrir, onMover,
}: { leads: Lead[]; onAbrir: (id: string) => void; onMover: (id: string, e: Estado) => void }) {
  if (leads.length === 0) {
    return <p className="rounded-2xl border border-dashed border-arena p-10 text-center text-sm text-niebla">Ningún lead coincide con los filtros.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-arena bg-blanco-roto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
            <th className="px-4 py-3">Lead</th>
            <th className="px-4 py-3">Etapa</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Próxima acción</th>
            <th className="px-4 py-3">Origen</th>
            <th className="px-4 py-3">Actividad</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const pasada = vencida(l.proxima_fecha) && ABIERTOS.includes(l.estado);
            return (
              <tr key={l.id} onClick={() => onAbrir(l.id)} className="cursor-pointer border-b border-arena last:border-0 transition hover:bg-verde-golf/[0.04]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-semibold text-white" style={{ background: COLOR_ESTADO[l.estado] }}>{iniciales(l.nombre)}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-carbon">{l.nombre}</span>
                      <span className="block truncate text-xs text-niebla">{l.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={l.estado}
                    onChange={(e) => onMover(l.id, e.target.value as Estado)}
                    className="rounded-lg border px-2.5 py-1.5 text-xs font-medium text-white outline-none"
                    style={{ background: COLOR_ESTADO[l.estado], borderColor: COLOR_ESTADO[l.estado] }}
                    aria-label={`Etapa de ${l.nombre}`}
                  >
                    {ORDEN_ESTADOS_CONTACTO.map((e) => (
                      <option key={e} value={e} className="text-carbon">{ETIQUETA_ESTADO_CONTACTO[e]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 tabular-nums">{l.valor_estimado_cop ? cop(l.valor_estimado_cop) : <span className="text-niebla">—</span>}</td>
                <td className={`px-4 py-3 ${pasada ? "font-medium text-error" : "text-carbon"}`}>
                  {l.proxima_accion ? `${l.proxima_accion}${l.proxima_fecha ? ` · ${fechaCorta(l.proxima_fecha)}` : ""}` : <span className="text-niebla">—</span>}
                </td>
                <td className="px-4 py-3 text-niebla">{l.origen}</td>
                <td className="px-4 py-3 text-niebla">{textoHace(l.updated_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
