"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { alturaInput, estiloInput } from "@/components/admin/form-ui";
import { MedidorClave } from "@/components/admin/usuarios/medidor-clave";
import { validarContrasena } from "@/lib/admin/contrasena";
import { actualizarMiNombre, cambiarMiContrasena } from "@/app/admin/(panel)/cuenta/actions";

export function CuentaWorkspace({
  nombre: nombreInicial,
  email,
  rol,
  debeCambiar,
}: {
  nombre: string;
  email: string;
  rol: "admin" | "asesor";
  debeCambiar: boolean;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(nombreInicial);
  const [msgNombre, setMsgNombre] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [ver, setVer] = useState(false);
  const [msgClave, setMsgClave] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [pendienteNombre, empezarNombre] = useTransition();
  const [pendienteClave, empezarClave] = useTransition();

  const coincide = nueva === repetir;

  function guardarNombre() {
    setMsgNombre(null);
    empezarNombre(async () => {
      const r = await actualizarMiNombre(nombre);
      setMsgNombre(r.ok ? { tipo: "ok", texto: r.aviso ?? "Nombre guardado." } : { tipo: "error", texto: r.error });
      if (r.ok) router.refresh();
    });
  }

  function cambiarClave() {
    setMsgClave(null);
    if (!coincide) return setMsgClave({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
    const malo = validarContrasena(nueva);
    if (malo) return setMsgClave({ tipo: "error", texto: malo });
    empezarClave(async () => {
      const r = await cambiarMiContrasena({ actual, nueva });
      if (!r.ok) return setMsgClave({ tipo: "error", texto: r.error });
      setActual("");
      setNueva("");
      setRepetir("");
      setMsgClave({ tipo: "ok", texto: "Contraseña cambiada. Úsala la próxima vez que entres." });
      router.refresh();
    });
  }

  const Mensaje = ({ m }: { m: { tipo: "ok" | "error"; texto: string } | null }) =>
    m ? (
      <p role={m.tipo === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-2.5 text-sm", m.tipo === "ok" ? "border-exito/30 bg-exito/10 text-exito" : "border-error/30 bg-error/10 text-error")}>
        {m.texto}
      </p>
    ) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-carbon">Mi cuenta</h1>
        <p className="text-sm text-niebla">Tu perfil y tu contraseña de acceso al panel.</p>
      </div>

      {debeCambiar && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-champagne/60 bg-champagne/15 p-4 text-sm text-carbon">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#8a6d1f]" />
          <div>
            <strong className="block">Tienes una contraseña temporal.</strong>
            Crea una contraseña propia antes de seguir usando el panel.
          </div>
        </div>
      )}

      <section className="space-y-4 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6">
        <h2 className="font-serif text-lg text-carbon">Perfil</h2>
        <label className="block">
          <span className="text-sm font-medium text-carbon">Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={cn(estiloInput, alturaInput, "mt-1.5")} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm font-medium text-carbon">Correo</span>
            <p className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-arena bg-arena/20 px-3.5 text-sm text-niebla"><Mail size={14} /> {email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-carbon">Rol</span>
            <p className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-arena bg-arena/20 px-3.5 text-sm text-niebla"><ShieldCheck size={14} /> {rol === "admin" ? "Administrador" : "Asesor"}</p>
          </div>
        </div>
        <Mensaje m={msgNombre} />
        <button type="button" disabled={pendienteNombre || nombre.trim() === nombreInicial} onClick={guardarNombre} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-50">
          {pendienteNombre && <Loader2 size={15} className="animate-spin" />} Guardar nombre
        </button>
      </section>

      <section className="space-y-4 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg text-carbon"><KeyRound size={18} className="text-verde-golf" /> Cambiar contraseña</h2>
        <label className="block">
          <span className="text-sm font-medium text-carbon">Contraseña actual</span>
          <input type={ver ? "text" : "password"} value={actual} onChange={(e) => setActual(e.target.value)} autoComplete="current-password" className={cn(estiloInput, alturaInput, "mt-1.5")} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-carbon">Contraseña nueva</span>
            <input type={ver ? "text" : "password"} value={nueva} onChange={(e) => setNueva(e.target.value)} autoComplete="new-password" className={cn(estiloInput, alturaInput, "mt-1.5")} />
            <MedidorClave valor={nueva} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-carbon">Repite la nueva</span>
            <input type={ver ? "text" : "password"} value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" className={cn(estiloInput, alturaInput, "mt-1.5")} />
            {repetir && (
              <span className={cn("mt-2 flex items-center gap-1 text-xs", coincide ? "text-exito" : "text-error")}>
                {coincide ? <Check size={13} /> : null} {coincide ? "Coinciden" : "No coinciden"}
              </span>
            )}
          </label>
        </div>
        <button type="button" onClick={() => setVer((v) => !v)} className="inline-flex items-center gap-1.5 text-xs text-niebla hover:text-carbon">
          {ver ? <EyeOff size={13} /> : <Eye size={13} />} {ver ? "Ocultar contraseñas" : "Mostrar contraseñas"}
        </button>
        <Mensaje m={msgClave} />
        <button type="button" disabled={pendienteClave || !actual || !nueva} onClick={cambiarClave} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-50">
          {pendienteClave && <Loader2 size={15} className="animate-spin" />} Cambiar contraseña
        </button>
      </section>
    </div>
  );
}
