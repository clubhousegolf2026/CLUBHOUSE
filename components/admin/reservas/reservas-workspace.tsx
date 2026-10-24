"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, LayoutGrid, List, Plus, TrendingUp, Wallet } from "lucide-react";
import { moverReserva } from "@/app/admin/(panel)/reservas/actions";
import { cop, fechaCo } from "@/lib/format";

export type EstadoPago = "pendiente" | "pagado" | "fallido" | "reembolsado";

export type ReservaFila = {
  id: string;
  estado_pago: EstadoPago;
  monto_deposito_cop: number;
  pasarela: string | null;
  created_at: string;
  total: number;
  nombre: string;
  email: string;
};

const COLUMNAS: { id: EstadoPago; etiqueta: string; color: string; ayuda: string }[] = [
  { id: "pendiente", etiqueta: "Pendiente de pago", color: "#b8913f", ayuda: "Esperando anticipo o pago" },
  { id: "pagado", etiqueta: "Pagada", color: "#1b8a5a", ayuda: "Pago confirmado" },
  { id: "fallido", etiqueta: "Fallida", color: "#9a2a2a", ayuda: "El pago no se completó" },
  { id: "reembolsado", etiqueta: "Reembolsada", color: "#7a8599", ayuda: "Dinero devuelto" },
];

const select =
  "rounded-lg border border-arena bg-white px-2 py-1.5 text-xs text-niebla outline-none focus:border-verde-golf/60";

export function ReservasWorkspace({
  inicial,
  errorCarga,
}: {
  inicial: ReservaFila[];
  errorCarga: string | null;
}) {
  const [reservas, setReservas] = useState(inicial);
  const [vista, setVista] = useState<"tablero" | "lista">("tablero");
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<EstadoPago | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => setReservas(inicial), [inicial]);
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  const kpi = useMemo(() => {
    const por = (e: EstadoPago) => reservas.filter((r) => r.estado_pago === e);
    return {
      total: reservas.length,
      porCobrar: por("pendiente").reduce((s, r) => s + r.total, 0),
      cobrado: por("pagado").reduce((s, r) => s + r.total, 0),
      pendientes: por("pendiente").length,
    };
  }, [reservas]);

  function mover(id: string, estado: EstadoPago) {
    const previo = reservas.find((r) => r.id === id);
    if (!previo || previo.estado_pago === estado) return;
    setReservas((rs) => rs.map((r) => (r.id === id ? { ...r, estado_pago: estado } : r)));
    start(async () => {
      const res = await moverReserva(id, estado);
      if (!res.ok) {
        setReservas((rs) => rs.map((r) => (r.id === id ? { ...r, estado_pago: previo.estado_pago } : r)));
        setAviso(`No se pudo mover: ${res.error}`);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">Reservas</h1>
          <p className="text-sm text-niebla">Estado de pago de cada reserva. Arrastra las tarjetas entre columnas.</p>
        </div>
        <Link
          href="/admin/reservas/nueva"
          className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-3 text-sm font-semibold text-crema shadow-lg shadow-verde-calle/20 hover:bg-verde-calle"
        >
          <Plus size={17} /> Nueva reserva
        </Link>
      </div>

      {errorCarga && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <strong className="block">No se pudieron cargar las reservas.</strong>
            {errorCarga}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi etiqueta="Reservas" valor={String(kpi.total)} detalle={`${kpi.pendientes} pendientes`} />
        <Kpi etiqueta="Por cobrar" valor={cop(kpi.porCobrar)} detalle="Reservas pendientes" icono={<Wallet size={17} />} />
        <Kpi etiqueta="Cobrado" valor={cop(kpi.cobrado)} detalle="Reservas pagadas" icono={<TrendingUp size={17} />} />
        <div className="col-span-2 flex items-center justify-end lg:col-span-1">
          <div className="inline-flex rounded-xl border border-arena bg-white p-1">
            {([["tablero", LayoutGrid, "Tablero"], ["lista", List, "Lista"]] as const).map(([v, Icono, nombre]) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                aria-pressed={vista === v}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${vista === v ? "bg-verde-golf text-crema" : "text-niebla hover:text-carbon"}`}
              >
                <Icono size={15} /> {nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {reservas.length === 0 && !errorCarga && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-verde-golf/40 bg-verde-golf/[0.04] px-5 py-4">
          <p className="text-sm text-carbon">
            <strong>Todavía no hay reservas.</strong> Crea una con «Nueva reserva» (necesitas un lead en el CRM) y luego arrástrala
            según su pago.
          </p>
        </div>
      )}

      {vista === "tablero" ? (
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
          {COLUMNAS.map((col) => {
            const items = reservas.filter((r) => r.estado_pago === col.id);
            const total = items.reduce((s, r) => s + r.total, 0);
            return (
              <section
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); setSobre(col.id); }}
                onDragLeave={() => setSobre((s) => (s === col.id ? null : s))}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain") || arrastrando;
                  if (id) mover(id, col.id);
                  setSobre(null);
                  setArrastrando(null);
                }}
                style={{ borderTopColor: col.color }}
                className={`flex min-h-[340px] w-[300px] shrink-0 flex-col rounded-2xl border border-t-4 p-3 transition ${
                  sobre === col.id ? "border-x-verde-golf border-b-verde-golf bg-verde-golf/5" : "border-x-arena border-b-arena bg-white/50"
                }`}
              >
                <header className="mb-1 flex items-center justify-between px-1">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-carbon">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.color }} />
                    {col.etiqueta}
                  </h2>
                  <span className="rounded-full bg-arena/50 px-2 py-0.5 text-xs tabular-nums text-niebla">{items.length}</span>
                </header>
                <p className="mb-3 px-1 text-xs text-niebla">{total > 0 ? cop(total) : col.ayuda}</p>

                <div className="flex flex-col gap-2.5">
                  {items.map((r) => (
                    <article
                      key={r.id}
                      draggable
                      onDragStart={(e) => { e.dataTransfer.setData("text/plain", r.id); e.dataTransfer.effectAllowed = "move"; setArrastrando(r.id); }}
                      onDragEnd={() => { setArrastrando(null); setSobre(null); }}
                      className={`cursor-grab rounded-xl border border-arena bg-blanco-roto p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-verde-golf/40 hover:shadow-md active:cursor-grabbing ${arrastrando === r.id ? "opacity-40" : ""}`}
                    >
                      <Link href={`/admin/reservas/${r.id}`} className="block truncate text-sm font-medium text-carbon hover:text-verde-golf">
                        {r.nombre}
                      </Link>
                      <p className="truncate text-xs text-niebla">{r.email}</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span>
                          <span className="block text-[10px] uppercase tracking-wider text-niebla">Total</span>
                          <span className="font-serif text-lg tabular-nums text-carbon">{cop(r.total)}</span>
                        </span>
                        <span className="text-right text-xs text-niebla">
                          Anticipo<br />
                          <span className="tabular-nums text-carbon">{cop(r.monto_deposito_cop)}</span>
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between border-t border-arena pt-2.5 text-xs text-niebla">
                        <span>{fechaCo(r.created_at)}{r.pasarela ? ` · ${r.pasarela}` : ""}</span>
                      </div>
                      <select
                        value={r.estado_pago}
                        onChange={(e) => mover(r.id, e.target.value as EstadoPago)}
                        aria-label={`Mover reserva de ${r.nombre}`}
                        className={`${select} mt-2.5 w-full`}
                      >
                        {COLUMNAS.map((c) => (
                          <option key={c.id} value={c.id}>{`Mover a: ${c.etiqueta}`}</option>
                        ))}
                      </select>
                    </article>
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-xl border border-dashed border-arena p-4 text-center text-xs text-niebla">Arrastra una reserva aquí</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-arena bg-blanco-roto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Anticipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id} className="border-b border-arena last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/reservas/${r.id}`} className="text-verde-golf hover:underline">{r.nombre}</Link>
                    <p className="text-xs text-niebla">{r.email}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{cop(r.total)}</td>
                  <td className="px-4 py-3 tabular-nums">{cop(r.monto_deposito_cop)}</td>
                  <td className="px-4 py-3">
                    <select value={r.estado_pago} onChange={(e) => mover(r.id, e.target.value as EstadoPago)} className={select}>
                      {COLUMNAS.map((c) => (
                        <option key={c.id} value={c.id}>{c.etiqueta}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-niebla">{fechaCo(r.created_at)}</td>
                </tr>
              ))}
              {reservas.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-niebla">No hay reservas todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {aviso && (
        <div role="alert" className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full bg-carbon px-5 py-3 text-sm text-crema shadow-2xl">
          {aviso}
        </div>
      )}
    </div>
  );
}

function Kpi({ etiqueta, valor, detalle, icono }: { etiqueta: string; valor: string; detalle: string; icono?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-arena bg-blanco-roto p-4">
      <div className="flex items-center justify-between text-niebla">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">{etiqueta}</span>
        {icono && <span className="text-verde-golf">{icono}</span>}
      </div>
      <p className="mt-2 truncate font-serif text-2xl tabular-nums text-carbon">{valor}</p>
      <p className="mt-0.5 text-xs text-niebla">{detalle}</p>
    </div>
  );
}
