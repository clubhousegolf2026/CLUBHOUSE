"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-champagne via-[#d4b473] to-champagne bg-[length:200%_100%] text-sm font-semibold text-carbon shadow-[0_10px_30px_-8px_rgba(198,166,100,0.7)] transition-[background-position,transform] duration-500 hover:bg-[position:100%_0] active:scale-[0.98] disabled:opacity-70"
    >
      <span className="admin-brillo pointer-events-none absolute inset-0" />
      {pending ? (
        <>
          <Loader2 size={17} className="animate-spin" /> Entrando…
        </>
      ) : (
        <>
          Entrar al panel
          <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

const campo =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.07] pl-11 pr-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-champagne/70 focus:bg-white/[0.11] focus:ring-4 focus:ring-champagne/15";

export function LoginForm({
  action,
  mensaje,
}: {
  action: (formData: FormData) => void | Promise<void>;
  mensaje?: string;
}) {
  const [ver, setVer] = useState(false);

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="relative block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-crema/60">
          Correo
        </span>
        <span className="relative block">
          <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@clubhouse.com"
            className={campo}
          />
        </span>
      </label>

      <label className="relative block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-crema/60">
          Contraseña
        </span>
        <span className="relative block">
          <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            name="password"
            type={ver ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${campo} pr-12`}
          />
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
          >
            {ver ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
      </label>

      {mensaje && (
        <p
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-500/15 px-3.5 py-2.5 text-sm text-red-100"
        >
          {mensaje}
        </p>
      )}

      <BotonEntrar />
    </form>
  );
}
