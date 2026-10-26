"use client";

import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { validarContrasena } from "@/lib/admin/contrasena";
import { MedidorClave } from "@/components/admin/usuarios/medidor-clave";
import { botonAcceso, campoAcceso } from "@/components/admin/marco-acceso";

/** Crear contraseña nueva desde el enlace del correo (recuperación o invitación).
 *  Entiende los tres formatos de enlace de Supabase: ?code, ?token_hash y #access_token. */
export function NuevaClaveForm() {
  const [estado, setEstado] = useState<"cargando" | "listo" | "invalido">("cargando");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (hash.get("error") || hash.get("error_description")) return setEstado("invalido");
      try {
        // Al iniciar, el cliente ya procesa ?code y #access_token por su cuenta.
        let { data } = await supabase.auth.getSession();
        const tokenHash = url.searchParams.get("token_hash");
        const tipo = url.searchParams.get("type");
        if (!data.session && tokenHash && tipo) {
          await supabase.auth.verifyOtp({ type: tipo as EmailOtpType, token_hash: tokenHash });
          data = (await supabase.auth.getSession()).data;
        }
        if (!data.session && hash.get("access_token") && hash.get("refresh_token")) {
          await supabase.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! });
          data = (await supabase.auth.getSession()).data;
        }
        window.history.replaceState(null, "", window.location.pathname);
        setEstado(data.session ? "listo" : "invalido");
      } catch {
        setEstado("invalido");
      }
    })();
  }, []);

  if (estado === "cargando") return <p className="flex items-center gap-2 text-sm text-crema/70"><Loader2 size={16} className="animate-spin" /> Verificando el enlace…</p>;
  if (estado === "invalido") {
    return (
      <div className="space-y-3 text-sm text-crema/80">
        <p className="font-serif text-xl text-white">El enlace ya no es válido</p>
        <p>Puede haber vencido o haberse usado. Pide uno nuevo.</p>
        <a href="/admin/recuperar" className="inline-block font-medium text-[#ecd396] underline">Pedir un enlace nuevo</a>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (nueva !== repetir) return setError("Las contraseñas no coinciden.");
        const malo = validarContrasena(nueva);
        if (malo) return setError(malo);
        setGuardando(true);
        const { error: err } = await createBrowserSupabase().auth.updateUser({ password: nueva, data: { debe_cambiar_clave: false } });
        if (err) {
          setGuardando(false);
          return setError(err.message);
        }
        window.location.href = "/admin";
      }}
    >
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-crema/60">Contraseña nueva</span>
        <span className="relative block">
          <input type={ver ? "text" : "password"} required autoFocus autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} className={`${campoAcceso} pr-12`} />
          <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? "Ocultar" : "Mostrar"} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/45 hover:bg-white/10 hover:text-white">
            {ver ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
        <div className="[&_p]:text-crema/70 [&_span]:bg-white/20"><MedidorClave valor={nueva} /></div>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-crema/60">Repítela</span>
        <input type={ver ? "text" : "password"} required autoComplete="new-password" value={repetir} onChange={(e) => setRepetir(e.target.value)} className={campoAcceso} />
      </label>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/15 px-3.5 py-2.5 text-sm text-red-100">{error}</p>}
      <button type="submit" disabled={guardando} className={botonAcceso}>
        {guardando && <Loader2 size={16} className="animate-spin" />} Guardar y entrar
      </button>
    </form>
  );
}
