"use client";

import { useState, useTransition } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { botonAcceso, campoAcceso } from "@/components/admin/marco-acceso";
import { solicitarRecuperacion } from "@/app/admin/recuperar/actions";

export function RecuperarForm() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  if (enviado) {
    return (
      <div className="space-y-3 text-center text-crema/80">
        <MailCheck size={34} className="mx-auto text-[#ecd396]" />
        <p className="font-serif text-xl text-white">Revisa tu correo</p>
        <p className="text-sm">Si <strong>{email}</strong> tiene cuenta, te enviamos un enlace para crear una contraseña nueva. Puede tardar un par de minutos; mira también el spam.</p>
      </div>
    );
  }
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        empezar(async () => {
          const r = await solicitarRecuperacion(email);
          if (r.ok) setEnviado(true);
          else setError(r.error);
        });
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-crema/60">Correo de tu cuenta</span>
        <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@clubhousetravel.com.co" className={campoAcceso} />
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/15 px-3.5 py-2.5 text-sm text-red-100">{error}</p>}
      <button type="submit" disabled={pendiente} className={botonAcceso}>
        {pendiente && <Loader2 size={16} className="animate-spin" />} Enviar enlace
      </button>
    </form>
  );
}
