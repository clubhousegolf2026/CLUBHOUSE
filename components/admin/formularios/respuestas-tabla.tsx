"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { estiloInput } from "@/components/admin/form-ui";
import { pesos } from "@/lib/formularios/esquema";
import type { CampoFormulario } from "@/lib/formularios/tipos";
import { cambiarEstadoInscripcion, eliminarInscripcion } from "@/app/admin/(panel)/formularios/actions";

export type FilaRespuesta = {
  id: string;
  datos: Record<string, string | string[]>;
  nombre: string | null;
  email: string | null;
  telefono: string | null;
  estado: "recibida" | "pendiente_pago" | "pagada" | "cancelada";
  monto_cop: number | null;
  pago_referencia: string | null;
  created_at: string;
};

const ESTADOS: Record<FilaRespuesta["estado"], { texto: string; tono: string }> = {
  recibida: { texto: "Recibida", tono: "bg-verde-golf/10 text-verde-golf" },
  pendiente_pago: { texto: "Pago pendiente", tono: "bg-champagne/20 text-[#8a6d1f]" },
  pagada: { texto: "Pagada", tono: "bg-exito/15 text-exito" },
  cancelada: { texto: "Cancelada", tono: "bg-arena text-niebla" },
};

const fecha = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

const texto = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(", ") : v === "si" ? "Sí" : (v ?? ""));

export function RespuestasTabla({
  formularioId,
  nombreFormulario,
  campos,
  filas,
}: {
  formularioId: string;
  nombreFormulario: string;
  campos: CampoFormulario[];
  filas: FilaRespuesta[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<"todas" | FilaRespuesta["estado"]>("todas");
  const [abierta, setAbierta] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  const preguntas = campos.filter((c) => c.tipo !== "titulo" && c.tipo !== "paso");

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return filas.filter((f) => {
      if (estado !== "todas" && f.estado !== estado) return false;
      if (!t) return true;
      return `${f.nombre ?? ""} ${f.email ?? ""} ${f.telefono ?? ""} ${Object.values(f.datos).map(texto).join(" ")}`.toLowerCase().includes(t);
    });
  }, [filas, q, estado]);

  const recaudado = filas.filter((f) => f.estado === "pagada").reduce((a, f) => a + (f.monto_cop ?? 0), 0);

  function exportar() {
    const cab = ["Fecha", "Estado", "Monto COP", "Referencia de pago", ...preguntas.map((c) => c.etiqueta)];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lineas = [cab.map(esc).join(",")];
    for (const f of visibles) {
      lineas.push([fecha(f.created_at), ESTADOS[f.estado].texto, String(f.monto_cop ?? ""), f.pago_referencia ?? "", ...preguntas.map((c) => texto(f.datos[c.id]))].map(esc).join(","));
    }
    const blob = new Blob(["﻿" + lineas.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nombreFormulario.replace(/\W+/g, "-").toLowerCase()}-respuestas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { t: "Respuestas", v: String(filas.filter((f) => f.estado !== "cancelada").length) },
          { t: "Pagadas", v: String(filas.filter((f) => f.estado === "pagada").length) },
          { t: "Pago pendiente", v: String(filas.filter((f) => f.estado === "pendiente_pago").length) },
          { t: "Recaudado", v: pesos(recaudado) },
        ].map((k) => (
          <div key={k.t} className="rounded-2xl border border-arena bg-blanco-roto p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-niebla">{k.t}</p>
            <p className="mt-1 font-serif text-2xl tabular-nums text-carbon">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[14rem] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-niebla" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, correo o respuesta…" className={cn(estiloInput, "h-11 pl-10")} />
        </label>
        <select value={estado} onChange={(e) => setEstado(e.target.value as typeof estado)} className={cn(estiloInput, "h-11 w-auto")}>
          <option value="todas">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}
        </select>
        <button type="button" onClick={exportar} disabled={visibles.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-arena bg-white px-4 py-2.5 text-sm font-medium text-carbon hover:border-verde-golf/50 disabled:opacity-50">
          <Download size={15} /> Exportar CSV
        </button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-arena p-10 text-center text-sm text-niebla">{filas.length === 0 ? "Aún no hay respuestas." : "Ninguna respuesta coincide."}</p>
      ) : (
        <ul className="space-y-2">
          {visibles.map((f) => {
            const e = ESTADOS[f.estado];
            const abiertaAhora = abierta === f.id;
            return (
              <li key={f.id} className="overflow-hidden rounded-2xl border border-arena bg-blanco-roto">
                <button type="button" onClick={() => setAbierta(abiertaAhora ? null : f.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left hover:bg-arena/20">
                  <span className="min-w-[10rem] flex-1">
                    <span className="block font-medium text-carbon">{f.nombre || f.email || "Sin nombre"}</span>
                    <span className="block text-xs text-niebla">{f.email}{f.telefono ? ` · ${f.telefono}` : ""}</span>
                  </span>
                  {f.monto_cop ? <span className="font-serif tabular-nums text-carbon">{pesos(f.monto_cop)}</span> : null}
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", e.tono)}>{e.texto}</span>
                  <span className="text-xs text-niebla">{fecha(f.created_at)}</span>
                </button>
                {abiertaAhora && (
                  <div className="space-y-4 border-t border-arena bg-white p-4">
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {preguntas.map((c) => (
                        <div key={c.id}>
                          <dt className="text-xs text-niebla">{c.etiqueta}</dt>
                          <dd className="text-sm text-carbon">{texto(f.datos[c.id]) || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                    {f.pago_referencia && <p className="text-xs text-niebla">Referencia de pago: <code>{f.pago_referencia}</code></p>}
                    <div className="flex flex-wrap items-center gap-2 border-t border-arena pt-3">
                      <select
                        value={f.estado}
                        disabled={pendiente}
                        onChange={(ev) =>
                          empezar(async () => {
                            const r = await cambiarEstadoInscripcion(f.id, ev.target.value as FilaRespuesta["estado"], formularioId);
                            if (r.ok) router.refresh();
                            else setError(r.error);
                          })
                        }
                        className={cn(estiloInput, "h-9 w-auto text-xs")}
                      >
                        {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}
                      </select>
                      <button
                        type="button"
                        disabled={pendiente}
                        onClick={() => {
                          if (!window.confirm("¿Eliminar esta respuesta? No se puede deshacer.")) return;
                          empezar(async () => {
                            const r = await eliminarInscripcion(f.id, formularioId);
                            if (r.ok) router.refresh();
                            else setError(r.error);
                          });
                        }}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-error hover:underline"
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
