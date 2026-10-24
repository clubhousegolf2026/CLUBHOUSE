"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { crearContacto } from "@/app/admin/(panel)/crm/actions";
import { INTERESES } from "./tipos";

const campo =
  "w-full rounded-xl border border-arena bg-white px-3.5 py-2.5 text-sm text-carbon outline-none transition focus:border-verde-golf/60 focus:ring-4 focus:ring-verde-golf/10";

export function NuevoLeadModal({
  onCerrar,
  onCreado,
}: {
  onCerrar: () => void;
  onCreado: () => void;
}) {
  const [pendiente, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const valor = String(f.get("valor") ?? "").replace(/\D/g, "");
    setError(null);
    startTransition(async () => {
      const r = await crearContacto({
        nombre: String(f.get("nombre") ?? ""),
        email: String(f.get("email") ?? ""),
        telefono: String(f.get("telefono") ?? ""),
        valorEstimadoCop: valor ? Number(valor) : null,
        notas: String(f.get("notas") ?? ""),
        etiquetas: f.get("interes") ? [String(f.get("interes"))] : undefined,
        fechaTentativa: String(f.get("fecha") ?? "") || null,
      });
      if (!r.ok) return setError(r.error);
      onCreado();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[#04140e]/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <form
        onSubmit={enviar}
        role="dialog"
        aria-label="Nuevo lead"
        className="w-full max-w-lg rounded-[1.75rem] border border-arena bg-blanco-roto p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl text-carbon">Nuevo lead</h2>
            <p className="text-sm text-niebla">Para clientes que llegan por WhatsApp, teléfono o referido.</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full text-niebla hover:bg-arena/50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-niebla">Nombre *</span>
            <input name="nombre" required autoFocus className={campo} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-niebla">Correo *</span>
            <input name="email" type="email" required className={campo} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-niebla">Teléfono / WhatsApp</span>
            <input name="telefono" inputMode="tel" className={campo} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-niebla">Valor estimado (COP)</span>
            <input name="valor" inputMode="numeric" placeholder="0" className={campo} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-niebla">Fecha tentativa de viaje</span>
            <input name="fecha" type="date" className={campo} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-niebla">Experiencia de interés</span>
            <select name="interes" className={campo} defaultValue="">
              <option value="">Aún no definida</option>
              {INTERESES.map((i) => (
                <option key={i.id} value={i.nombre}>{i.nombre}</option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-niebla">Notas</span>
            <textarea name="notas" rows={3} className={campo} />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl px-5 py-2.5 text-sm text-niebla hover:bg-arena/40"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pendiente}
            className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-6 py-2.5 text-sm font-semibold text-crema transition hover:bg-verde-calle disabled:opacity-60"
          >
            {pendiente && <Loader2 size={15} className="animate-spin" />} Crear lead
          </button>
        </div>
      </form>
    </div>
  );
}
