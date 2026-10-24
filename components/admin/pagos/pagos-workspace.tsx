"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, CircleCheck, CircleX, Copy, CreditCard, Link2, Loader2, MessageCircle, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { alturaInput, estiloInput } from "@/components/admin/form-ui";
import { pesos } from "@/lib/formularios/esquema";
import { crearEnlacePago, eliminarPago } from "@/app/admin/(panel)/pagos/actions";

export type FilaPago = {
  id: string;
  referencia: string;
  monto_cop: number;
  concepto: string;
  estado: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR";
  nombre: string | null;
  email: string | null;
  origen: "inscripcion" | "reserva" | "manual";
  metodo: string | null;
  created_at: string;
  pagado_at: string | null;
};

export type ReservaPendiente = { id: string; etiqueta: string; monto: number; nombre: string; email: string; telefono: string };

export type EstadoConexion = {
  publica: boolean;
  integridad: boolean;
  eventos: boolean;
  servicio: boolean;
  sandbox: boolean;
};

const ESTADOS: Record<FilaPago["estado"], { texto: string; tono: string }> = {
  PENDING: { texto: "Pendiente", tono: "bg-champagne/20 text-[#8a6d1f]" },
  APPROVED: { texto: "Aprobado", tono: "bg-exito/15 text-exito" },
  DECLINED: { texto: "Rechazado", tono: "bg-error/10 text-error" },
  VOIDED: { texto: "Anulado", tono: "bg-arena text-niebla" },
  ERROR: { texto: "Error", tono: "bg-error/10 text-error" },
};

const ORIGEN = { inscripcion: "Formulario", reserva: "Reserva", manual: "Enlace manual" } as const;

const fecha = (iso: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function Copiar({ texto, etiqueta = "Copiar" }: { texto: string; etiqueta?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        } catch {}
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-arena bg-white px-2.5 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"
    >
      {ok ? <Check size={13} className="text-exito" /> : <Copy size={13} />} {ok ? "Copiado" : etiqueta}
    </button>
  );
}

export function PagosWorkspace({
  pagos,
  reservas,
  conexion,
  origen,
  migracionPendiente,
}: {
  pagos: FilaPago[];
  reservas: ReservaPendiente[];
  conexion: EstadoConexion;
  origen: string;
  migracionPendiente: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ concepto: "", monto: "", nombre: "", email: "", telefono: "", reservaId: "" });
  const [nuevo, setNuevo] = useState<{ referencia: string; monto: number; concepto: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verPasos, setVerPasos] = useState(false);
  const [pendiente, empezar] = useTransition();

  const listo = conexion.publica && conexion.integridad;
  const aprobados = pagos.filter((p) => p.estado === "APPROVED");
  const recaudado = aprobados.reduce((a, p) => a + p.monto_cop, 0);

  const filasEstado: { clave: string; ok: boolean; nombre: string; ayuda: string }[] = [
    { clave: "WOMPI_PUBLIC_KEY", ok: conexion.publica, nombre: "Llave pública", ayuda: "Empieza por pub_test_ (pruebas) o pub_prod_ (real)." },
    { clave: "WOMPI_INTEGRITY_SECRET", ok: conexion.integridad, nombre: "Secreto de integridad", ayuda: "Firma cada cobro para que no se pueda alterar el valor." },
    { clave: "WOMPI_EVENTS_SECRET", ok: conexion.eventos, nombre: "Secreto de eventos", ayuda: "Verifica que los avisos de pago vienen de Wompi." },
    { clave: "SUPABASE_SERVICE_ROLE_KEY", ok: conexion.servicio, nombre: "Clave de servicio de Supabase", ayuda: "Permite guardar inscripciones y pagos desde el servidor." },
  ];

  function elegirReserva(id: string) {
    const r = reservas.find((x) => x.id === id);
    setForm((f) =>
      r
        ? { ...f, reservaId: id, concepto: `Anticipo · ${r.etiqueta}`, monto: String(r.monto || ""), nombre: r.nombre, email: r.email, telefono: r.telefono }
        : { ...f, reservaId: "" },
    );
  }

  function crear() {
    setError(null);
    setNuevo(null);
    empezar(async () => {
      const r = await crearEnlacePago({
        concepto: form.concepto,
        montoCop: Number(form.monto.replace(/\D/g, "")),
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        reservaId: form.reservaId || null,
      });
      if (!r.ok) return setError(r.error);
      setNuevo({ referencia: r.referencia, monto: Number(form.monto.replace(/\D/g, "")), concepto: form.concepto });
      setForm({ concepto: "", monto: "", nombre: "", email: "", telefono: "", reservaId: "" });
      router.refresh();
    });
  }

  const enlaceNuevo = nuevo ? `${origen}/pagar/${nuevo.referencia}` : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-carbon">Pagos</h1>
        <p className="max-w-2xl text-sm text-niebla">Cobros con Wompi: de los formularios de inscripción, de las reservas o con un enlace que mandas por WhatsApp.</p>
      </div>

      {migracionPendiente && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-alerta/30 bg-alerta/10 p-4 text-sm text-alerta">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div><strong className="block">Falta crear las tablas en Supabase.</strong>Ejecuta <code>supabase/migrations/0010_formularios_pagos.sql</code> y recarga.</div>
        </div>
      )}

      {/* Conexión */}
      <section className="space-y-4 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl", listo ? "bg-exito/15 text-exito" : "bg-alerta/15 text-alerta")}><CreditCard size={20} /></span>
            <div>
              <h2 className="font-serif text-lg leading-tight text-carbon">Conexión con Wompi</h2>
              <p className="text-sm text-niebla">
                {listo ? (conexion.sandbox ? "Conectado en modo de PRUEBAS: no se cobra dinero real." : "Conectado en producción: los cobros son reales.") : "Aún no está conectado."}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setVerPasos((v) => !v)} className="rounded-xl border border-arena bg-white px-4 py-2 text-sm font-medium text-carbon hover:border-verde-golf/50">
            {verPasos ? "Ocultar pasos" : "Cómo conectarlo"}
          </button>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2">
          {filasEstado.map((f) => (
            <li key={f.clave} className="flex items-start gap-3 rounded-xl border border-arena bg-white p-3">
              {f.ok ? <CircleCheck size={18} className="mt-0.5 shrink-0 text-exito" /> : <CircleX size={18} className="mt-0.5 shrink-0 text-error/70" />}
              <div className="min-w-0">
                <p className="text-sm font-medium text-carbon">{f.nombre} <code className="ml-1 text-[11px] font-normal text-niebla">{f.clave}</code></p>
                <p className="text-xs text-niebla">{f.ayuda}</p>
              </div>
            </li>
          ))}
        </ul>

        {verPasos && (
          <ol className="space-y-3 rounded-2xl bg-crema/60 p-4 text-sm text-carbon">
            <li><strong>1.</strong> Entra a tu cuenta de Wompi → <em>Desarrolladores</em> y copia la llave pública, el secreto de integridad y el secreto de eventos (empieza con las de pruebas).</li>
            <li><strong>2.</strong> En Vercel → tu proyecto → <em>Settings → Environment Variables</em>, crea <code>WOMPI_PUBLIC_KEY</code>, <code>WOMPI_INTEGRITY_SECRET</code> y <code>WOMPI_EVENTS_SECRET</code>, y vuelve a desplegar.</li>
            <li className="space-y-1.5">
              <span><strong>3.</strong> En Wompi → <em>Desarrolladores → URL de eventos</em>, pega esta dirección:</span>
              <span className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-arena bg-white px-3 py-2 text-xs">{origen}/api/wompi/webhook</code>
                <Copiar texto={`${origen}/api/wompi/webhook`} />
              </span>
            </li>
            <li><strong>4.</strong> Haz un pago de prueba con un enlace de abajo (tarjeta de prueba <code>4242 4242 4242 4242</code>, cualquier fecha futura y CVC <code>123</code>). Debe aparecer como «Aprobado».</li>
            <li><strong>5.</strong> Cuando todo funcione, cambia las tres variables por las llaves de producción (<code>pub_prod_…</code>) y vuelve a desplegar.</li>
          </ol>
        )}
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { t: "Recaudado", v: pesos(recaudado) },
          { t: "Aprobados", v: String(aprobados.length) },
          { t: "Pendientes", v: String(pagos.filter((p) => p.estado === "PENDING").length) },
          { t: "Rechazados / error", v: String(pagos.filter((p) => ["DECLINED", "ERROR", "VOIDED"].includes(p.estado)).length) },
        ].map((k) => (
          <div key={k.t} className="rounded-2xl border border-arena bg-blanco-roto p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-niebla">{k.t}</p>
            <p className="mt-1 font-serif text-2xl tabular-nums text-carbon">{k.v}</p>
          </div>
        ))}
      </div>

      {/* Nuevo enlace */}
      <section className="space-y-4 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg text-carbon"><Link2 size={18} className="text-verde-golf" /> Nuevo enlace de cobro</h2>
        {reservas.length > 0 && (
          <label className="block">
            <span className="text-sm font-medium text-carbon">Cobrar una reserva pendiente (opcional)</span>
            <select value={form.reservaId} onChange={(e) => elegirReserva(e.target.value)} className={cn(estiloInput, alturaInput, "mt-1.5")}>
              <option value="">Ninguna: enlace suelto</option>
              {reservas.map((r) => <option key={r.id} value={r.id}>{r.etiqueta} · anticipo {pesos(r.monto)}</option>)}
            </select>
            <span className="mt-1 block text-xs text-niebla">Al pagarse, la reserva pasa sola a «pagado».</span>
          </label>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="text-sm font-medium text-carbon">Concepto</span><input value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} placeholder="Anticipo Utah Experience · Carlos Gómez" className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
          <label className="block"><span className="text-sm font-medium text-carbon">Valor (COP)</span><input inputMode="numeric" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} placeholder="4500000" className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
          <label className="block"><span className="text-sm font-medium text-carbon">Nombre del cliente</span><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
          <label className="block"><span className="text-sm font-medium text-carbon">Correo</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
          <label className="block"><span className="text-sm font-medium text-carbon">Celular</span><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="button" disabled={pendiente} onClick={crear} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60">
          {pendiente ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Crear enlace
        </button>

        {nuevo && (
          <div className="space-y-3 rounded-2xl border border-champagne/50 bg-champagne/10 p-4">
            <p className="text-sm font-medium text-carbon">Listo: {nuevo.concepto} · {pesos(nuevo.monto)}</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-arena bg-white px-3 py-2 text-xs">{enlaceNuevo}</code>
              <Copiar texto={enlaceNuevo} />
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${nuevo.concepto} · ${pesos(nuevo.monto)}\nPague de forma segura aquí: ${enlaceNuevo}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25d366] px-3 py-1.5 text-xs font-semibold text-white"
              >
                <MessageCircle size={13} /> Enviar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Historial */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg text-carbon">Historial</h2>
        {pagos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-arena p-10 text-center text-sm text-niebla">Todavía no hay cobros.</p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
                  <th className="px-4 py-3">Cobro</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Origen</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => {
                  const e = ESTADOS[p.estado];
                  return (
                    <tr key={p.id} className="border-b border-arena last:border-0">
                      <td className="px-4 py-3">
                        <span className="block font-medium text-carbon">{p.concepto}</span>
                        <span className="block text-xs text-niebla">{p.referencia} · {fecha(p.created_at)}</span>
                      </td>
                      <td className="px-4 py-3 text-niebla">{p.nombre || p.email || "—"}</td>
                      <td className="px-4 py-3 text-right font-serif tabular-nums text-carbon">{pesos(p.monto_cop)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", e.tono)}>{e.texto}</span>
                        {p.metodo && <span className="ml-2 text-xs text-niebla">{p.metodo}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-niebla">{ORIGEN[p.origen]}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          {p.estado !== "APPROVED" && <Copiar texto={`${origen}/pagar/${p.referencia}`} etiqueta="Enlace" />}
                          {p.estado !== "APPROVED" && (
                            <button
                              type="button"
                              disabled={pendiente}
                              aria-label="Eliminar"
                              onClick={() => {
                                if (!window.confirm("¿Eliminar este cobro?")) return;
                                empezar(async () => {
                                  const r = await eliminarPago(p.id);
                                  if (r.ok) router.refresh();
                                  else setError(r.error);
                                });
                              }}
                              className="grid h-8 w-8 place-items-center rounded-lg text-error hover:bg-error/10"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
