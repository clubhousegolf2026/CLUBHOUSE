"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { actualizarReserva, eliminarReserva } from "@/app/admin/(panel)/reservas/actions";

type EstadoPago = "pendiente" | "pagado" | "fallido" | "reembolsado";
const campo =
  "w-full rounded-xl border border-arena bg-white px-3.5 py-2.5 text-sm text-carbon outline-none focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";
const etiqueta = "mb-1 block text-xs font-medium uppercase tracking-wider text-niebla";

export function ReservaEdicion({
  id,
  estado,
  anticipo,
  pasarela,
  referencia,
}: {
  id: string;
  estado: EstadoPago;
  anticipo: number;
  pasarela: string | null;
  referencia: string | null;
}) {
  const router = useRouter();
  const [pendiente, start] = useTransition();
  const [f, setF] = useState({ estado, anticipo: String(anticipo), pasarela: pasarela ?? "", referencia: referencia ?? "" });
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      const r = await actualizarReserva(id, {
        estadoPago: f.estado,
        anticipoCop: Number(f.anticipo.replace(/\D/g, "") || 0),
        pasarela: f.pasarela,
        referencia: f.referencia,
      });
      if (!r.ok) return setMsg({ ok: false, texto: r.error });
      setMsg({ ok: true, texto: "Cambios guardados" });
      router.refresh();
    });
  }

  function borrar() {
    start(async () => {
      const r = await eliminarReserva(id);
      if (!r.ok) return setMsg({ ok: false, texto: r.error });
      router.push("/admin/reservas");
    });
  }

  return (
    <form onSubmit={guardar} className="space-y-4 rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4">
      <h3 className="font-serif text-base text-carbon">Editar reserva</h3>
      <label className="block">
        <span className={etiqueta}>Estado del pago</span>
        <select className={campo} value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value as EstadoPago })}>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="fallido">Fallido</option>
          <option value="reembolsado">Reembolsado</option>
        </select>
      </label>
      <label className="block">
        <span className={etiqueta}>Anticipo (COP)</span>
        <input inputMode="numeric" className={campo} value={f.anticipo} onChange={(e) => setF({ ...f, anticipo: e.target.value })} />
      </label>
      <label className="block">
        <span className={etiqueta}>Pasarela / medio de pago</span>
        <input className={campo} placeholder="Transferencia, efectivo…" value={f.pasarela} onChange={(e) => setF({ ...f, pasarela: e.target.value })} />
      </label>
      <label className="block">
        <span className={etiqueta}>Referencia</span>
        <input className={campo} value={f.referencia} onChange={(e) => setF({ ...f, referencia: e.target.value })} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pendiente} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60">
          {pendiente && <Loader2 size={15} className="animate-spin" />} Guardar
        </button>
        {msg && <span role="status" className={`text-sm ${msg.ok ? "text-exito" : "text-error"}`}>{msg.texto}</span>}
      </div>
      <div className="border-t border-arena pt-3">
        {confirmar ? (
          <span className="flex flex-wrap items-center gap-3 text-sm">
            ¿Eliminar esta reserva?
            <button type="button" onClick={borrar} disabled={pendiente} className="font-semibold text-error hover:underline">Sí, eliminar</button>
            <button type="button" onClick={() => setConfirmar(false)} className="text-niebla hover:underline">Cancelar</button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmar(true)} className="inline-flex items-center gap-1.5 text-sm text-niebla hover:text-error">
            <Trash2 size={15} /> Eliminar reserva
          </button>
        )}
      </div>
    </form>
  );
}
