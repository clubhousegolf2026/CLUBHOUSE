"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, Loader2, Mail, MessageCircle, Phone, StickyNote, Trash2, X } from "lucide-react";
import {
  actualizarContacto,
  agregarNota,
  eliminarContacto,
  obtenerActividad,
  type ItemActividad,
} from "@/app/admin/(panel)/crm/actions";
import { ORDEN_ESTADOS_CONTACTO, ETIQUETA_ESTADO_CONTACTO } from "@/components/admin/estado-badge";
import { cop } from "@/lib/format";
import {
  COLOR_ESTADO,
  enlaceWhatsApp,
  fechaCorta,
  fechaHora,
  iniciales,
  textoHace,
  vencida,
  type Estado,
  type Lead,
} from "./tipos";

const campo =
  "w-full rounded-xl border border-arena bg-white px-3.5 py-2.5 text-sm text-carbon outline-none transition focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";
const etiqueta = "mb-1 block text-xs font-medium uppercase tracking-wider text-niebla";

export function LeadDrawer({
  lead,
  onCerrar,
  onCambio,
  onMover,
  onEliminado,
}: {
  lead: Lead;
  onCerrar: () => void;
  onCambio: (id: string, patch: Partial<Lead>) => void;
  onMover: (id: string, estado: Estado) => void;
  onEliminado: (id: string) => void;
}) {
  const [guardando, startGuardar] = useTransition();
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [actividad, setActividad] = useState<ItemActividad[] | null>(null);
  const [errorActividad, setErrorActividad] = useState<string | null>(null);
  const [notasOk, setNotasOk] = useState(true);
  const [nota, setNota] = useState("");
  const [enviandoNota, startNota] = useTransition();
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  const [f, setF] = useState({
    nombre: lead.nombre,
    email: lead.email,
    telefono: lead.telefono ?? "",
    valor: lead.valor_estimado_cop ? String(lead.valor_estimado_cop) : "",
    proximaAccion: lead.proxima_accion ?? "",
    proximaFecha: lead.proxima_fecha ?? "",
    notas: lead.notas ?? "",
    etiquetas: lead.etiquetas.join(", "),
  });

  function cargarActividad() {
    obtenerActividad(lead.id).then((r) => {
      if (!r.ok) return setErrorActividad(r.error);
      setActividad(r.items);
      setNotasOk(r.notasDisponibles);
    });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(cargarActividad, [lead.id, lead.estado]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    const valor = f.valor.replace(/\D/g, "");
    const etiquetas = f.etiquetas.split(",").map((t) => t.trim()).filter(Boolean);
    startGuardar(async () => {
      const r = await actualizarContacto(lead.id, {
        nombre: f.nombre,
        email: f.email,
        telefono: f.telefono,
        valorEstimadoCop: valor ? Number(valor) : null,
        notas: f.notas,
        proximaAccion: f.proximaAccion,
        proximaFecha: f.proximaFecha,
        etiquetas,
      });
      if (!r.ok) return setMensaje({ tipo: "error", texto: r.error });
      onCambio(lead.id, {
        nombre: f.nombre.trim(),
        email: f.email.trim(),
        telefono: f.telefono.trim() || null,
        valor_estimado_cop: valor ? Number(valor) : null,
        notas: f.notas.trim() || null,
        proxima_accion: f.proximaAccion.trim() || null,
        proxima_fecha: f.proximaFecha || null,
        etiquetas,
      });
      setMensaje({ tipo: "ok", texto: "Cambios guardados" });
    });
  }

  function guardarNota() {
    if (!nota.trim()) return;
    startNota(async () => {
      const r = await agregarNota(lead.id, nota);
      if (!r.ok) return setMensaje({ tipo: "error", texto: r.error });
      setNota("");
      onCambio(lead.id, { updated_at: new Date().toISOString() });
      cargarActividad();
    });
  }

  function borrar() {
    startGuardar(async () => {
      const r = await eliminarContacto(lead.id);
      if (!r.ok) return setMensaje({ tipo: "error", texto: r.error });
      onEliminado(lead.id);
    });
  }

  const wa = enlaceWhatsApp(lead.telefono);

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-[#04140e]/50 backdrop-blur-[2px]" onClick={onCerrar} />
      <aside
        role="dialog"
        aria-label={`Lead ${lead.nombre}`}
        className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-blanco-roto shadow-[-30px_0_80px_-20px_rgba(0,0,0,0.5)]"
      >
        <header className="border-b border-arena px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-semibold text-white"
                style={{ background: COLOR_ESTADO[lead.estado] }}
              >
                {iniciales(lead.nombre)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-serif text-xl text-carbon">{lead.nombre}</h2>
                <p className="text-xs text-niebla">
                  Creado {fechaCorta(lead.created_at)} · actividad {textoHace(lead.updated_at)} · origen {lead.origen}
                </p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              aria-label="Cerrar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-niebla hover:bg-arena/50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#1b8a5a] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
            <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-arena bg-white px-4 py-2 text-xs font-medium text-carbon hover:border-verde-golf/40">
              <Mail size={14} /> Correo
            </a>
            {lead.telefono && (
              <a href={`tel:${lead.telefono}`} className="inline-flex items-center gap-1.5 rounded-full border border-arena bg-white px-4 py-2 text-xs font-medium text-carbon hover:border-verde-golf/40">
                <Phone size={14} /> Llamar
              </a>
            )}
          </div>
        </header>

        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
          <section>
            <h3 className={etiqueta}>Etapa</h3>
            <div className="flex flex-wrap gap-2">
              {ORDEN_ESTADOS_CONTACTO.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => e !== lead.estado && onMover(lead.id, e)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                    e === lead.estado ? "border-transparent text-white" : "border-arena bg-white text-niebla hover:border-verde-golf/40 hover:text-carbon"
                  }`}
                  style={e === lead.estado ? { background: COLOR_ESTADO[e] } : undefined}
                >
                  {ETIQUETA_ESTADO_CONTACTO[e]}
                </button>
              ))}
            </div>
          </section>

          {lead.mensaje && (
            <section className="rounded-2xl border border-arena bg-white p-4">
              <h3 className={etiqueta}>Mensaje del cliente</h3>
              <p className="text-sm leading-relaxed text-carbon">{lead.mensaje}</p>
              {lead.fecha_tentativa && (
                <p className="mt-2 text-xs text-niebla">Fecha tentativa: {fechaCorta(lead.fecha_tentativa)}</p>
              )}
            </section>
          )}

          {lead.cotizaciones > 0 && (
            <section className="rounded-2xl border border-arena bg-white p-4 text-sm">
              <span className="text-niebla">Cotizaciones:</span>{" "}
              <strong className="text-carbon">{lead.cotizaciones}</strong>
              <span className="text-niebla"> · total </span>
              <strong className="text-carbon">{cop(lead.total_cotizado)}</strong>
            </section>
          )}

          <form onSubmit={guardar} className="space-y-4">
            <h3 className="font-serif text-lg text-carbon">Datos y seguimiento</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className={etiqueta}>Nombre</span><input className={campo} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></label>
              <label><span className={etiqueta}>Correo</span><input type="email" className={campo} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></label>
              <label><span className={etiqueta}>Teléfono</span><input className={campo} value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} /></label>
              <label><span className={etiqueta}>Valor estimado (COP)</span><input inputMode="numeric" className={campo} value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} /></label>
              <label className="sm:col-span-2"><span className={etiqueta}>Próxima acción</span><input className={campo} placeholder="Ej. Llamar para confirmar fechas" value={f.proximaAccion} onChange={(e) => setF({ ...f, proximaAccion: e.target.value })} /></label>
              <label><span className={etiqueta}>Fecha de la acción</span><input type="date" className={campo} value={f.proximaFecha} onChange={(e) => setF({ ...f, proximaFecha: e.target.value })} /></label>
              <label><span className={etiqueta}>Etiquetas (separadas por coma)</span><input className={campo} placeholder="VIP, grupo, Tailandia" value={f.etiquetas} onChange={(e) => setF({ ...f, etiquetas: e.target.value })} /></label>
              <label className="sm:col-span-2"><span className={etiqueta}>Notas internas</span><textarea rows={3} className={campo} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></label>
            </div>
            {lead.proxima_fecha && vencida(lead.proxima_fecha) && (
              <p className="flex items-center gap-2 text-xs font-medium text-error"><CalendarClock size={14} /> La acción programada ya venció.</p>
            )}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={guardando} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-6 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60">
                {guardando && <Loader2 size={15} className="animate-spin" />} Guardar cambios
              </button>
              {mensaje && (
                <span role="status" className={`text-sm ${mensaje.tipo === "ok" ? "text-exito" : "text-error"}`}>{mensaje.texto}</span>
              )}
            </div>
          </form>

          <section>
            <h3 className="font-serif text-lg text-carbon">Actividad</h3>
            <div className="mt-3 flex gap-2">
              <input
                className={campo}
                placeholder="Agregar una nota (llamada, acuerdo, recordatorio)…"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), guardarNota())}
              />
              <button type="button" onClick={guardarNota} disabled={enviandoNota || !nota.trim()} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-verde-golf/40 px-4 text-sm font-medium text-verde-golf hover:bg-verde-golf/5 disabled:opacity-50">
                {enviandoNota ? <Loader2 size={14} className="animate-spin" /> : <StickyNote size={14} />} Nota
              </button>
            </div>
            {!notasOk && (
              <p className="mt-2 text-xs text-alerta">Para guardar notas falta aplicar la migración 0003 en Supabase.</p>
            )}
            {errorActividad && <p className="mt-3 text-sm text-error">{errorActividad}</p>}
            {actividad === null && !errorActividad && <p className="mt-3 text-sm text-niebla">Cargando…</p>}
            {actividad && actividad.length === 0 && <p className="mt-3 text-sm text-niebla">Sin actividad todavía.</p>}
            {actividad && actividad.length > 0 && (
              <ol className="mt-4 space-y-4 border-l border-arena pl-5">
                {actividad.map((a) => (
                  <li key={a.clave} className="relative">
                    <span className={`absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ${a.tipo === "nota" ? "bg-champagne" : "bg-verde-golf"}`} />
                    <p className="text-sm text-carbon">
                      {a.tipo === "nota" ? a.texto : <span className="capitalize">{a.texto}</span>}
                    </p>
                    {a.detalle && <p className="text-sm text-niebla">{a.detalle}</p>}
                    <p className="text-xs text-niebla">{a.tipo === "nota" ? "Nota · " : "Cambio de etapa · "}{fechaHora(a.fecha)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-arena px-6 py-4">
          {confirmarBorrado ? (
            <span className="flex items-center gap-3 text-sm">
              ¿Eliminar este lead y todo su historial?
              <button onClick={borrar} className="font-semibold text-error hover:underline">Sí, eliminar</button>
              <button onClick={() => setConfirmarBorrado(false)} className="text-niebla hover:underline">Cancelar</button>
            </span>
          ) : (
            <button onClick={() => setConfirmarBorrado(true)} className="inline-flex items-center gap-1.5 text-sm text-niebla hover:text-error">
              <Trash2 size={15} /> Eliminar lead
            </button>
          )}
          <a href={`/admin/crm/${lead.id}`} className="text-sm text-verde-golf hover:underline">Ficha completa →</a>
        </footer>
      </aside>
    </div>
  );
}
