"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { crearReserva } from "@/app/admin/(panel)/reservas/actions";

const campo =
  "w-full rounded-xl border border-arena bg-white px-3.5 py-2.5 text-sm text-carbon outline-none focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";
const etiqueta = "mb-1 block text-xs font-medium uppercase tracking-wider text-niebla";
const soloDigitos = (v: string) => Number(v.replace(/\D/g, "") || 0);

export function ReservaNuevaForm({ contactos }: { contactos: { id: string; nombre: string; email: string }[] }) {
  const router = useRouter();
  const [pendiente, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const r = await crearReserva({
        contactoId: String(f.get("contacto") ?? ""),
        concepto: String(f.get("concepto") ?? ""),
        totalCop: soloDigitos(String(f.get("total") ?? "")),
        anticipoCop: soloDigitos(String(f.get("anticipo") ?? "")),
        personas: Number(f.get("personas") ?? 1),
      });
      if (!r.ok) return setError(r.error);
      router.push(`/admin/reservas/${r.id}`);
    });
  }

  return (
    <form onSubmit={enviar} className="max-w-2xl space-y-5 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-6">
      <label className="block">
        <span className={etiqueta}>Cliente *</span>
        <select name="contacto" required defaultValue="" className={campo}>
          <option value="" disabled>Elige un lead del CRM…</option>
          {contactos.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} · {c.email}</option>
          ))}
        </select>
        {contactos.length === 0 && (
          <span className="mt-1 block text-xs text-alerta">Primero crea el lead en el CRM.</span>
        )}
      </label>
      <label className="block">
        <span className={etiqueta}>Qué se reservó *</span>
        <input name="concepto" required placeholder="Ej. Utah Experience · 4 golfistas · 28 jun – 5 jul 2027" className={campo} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={etiqueta}>Total (COP) *</span>
          <input name="total" required inputMode="numeric" className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Anticipo (COP)</span>
          <input name="anticipo" inputMode="numeric" defaultValue="0" className={campo} />
        </label>
        <label className="block">
          <span className={etiqueta}>Personas</span>
          <input name="personas" type="number" min={1} defaultValue={1} className={campo} />
        </label>
      </div>
      {error && <p role="alert" className="rounded-xl border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error">{error}</p>}
      <button type="submit" disabled={pendiente} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-6 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60">
        {pendiente && <Loader2 size={15} className="animate-spin" />} Crear reserva
      </button>
    </form>
  );
}
