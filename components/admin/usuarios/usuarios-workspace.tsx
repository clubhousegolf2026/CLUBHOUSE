"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  MailCheck,
  MessageCircle,
  Pencil,
  Power,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { alturaInput, estiloInput } from "@/components/admin/form-ui";
import { MedidorClave } from "@/components/admin/usuarios/medidor-clave";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  darAcceso,
  eliminarUsuario,
  restablecerContrasena,
} from "@/app/admin/(panel)/usuarios/actions";

export type UsuarioFila = {
  id: string;
  email: string;
  nombre: string;
  rol: "admin" | "asesor";
  activo: boolean;
  creado: string;
  ultimoAcceso: string | null;
  debeCambiar: boolean;
  invitacionPendiente: boolean;
};

const ROLES = {
  admin: { nombre: "Administrador", ayuda: "Todo el panel y gestiona usuarios.", tono: "bg-champagne/20 text-[#8a6d1f]" },
  asesor: { nombre: "Asesor", ayuda: "Trabaja en el panel, pero no gestiona usuarios.", tono: "bg-verde-golf/10 text-verde-golf" },
} as const;

const fecha = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "Nunca";

const iniciales = (n: string) => n.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

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

type Resultado = {
  titulo: string;
  usuario: string;
  email: string;
  contrasena?: string;
  enlace?: string;
  mensaje?: string;
};

function PanelResultado({ r, origen, alCerrar }: { r: Resultado; origen: string; alCerrar: () => void }) {
  const texto = r.contrasena
    ? `Hola ${r.usuario.split(" ")[0]}, este es tu acceso al panel de Clubhouse:\n${origen}/admin/login\nUsuario: ${r.email}\nContraseña temporal: ${r.contrasena}\nAl entrar te pedirá crear una contraseña nueva.`
    : r.enlace
      ? `Hola ${r.usuario.split(" ")[0]}, para crear tu contraseña del panel de Clubhouse entra aquí:\n${r.enlace}`
      : "";
  return (
    <section className="space-y-3 rounded-2xl border border-champagne/50 bg-champagne/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg text-carbon">{r.titulo}</p>
          {r.mensaje && <p className="text-sm text-niebla">{r.mensaje}</p>}
        </div>
        <button type="button" onClick={alCerrar} aria-label="Cerrar" className="text-niebla hover:text-carbon"><X size={16} /></button>
      </div>
      {r.contrasena && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-niebla">Usuario</span>
            <code className="rounded-lg border border-arena bg-white px-3 py-1.5 text-sm">{r.email}</code>
            <Copiar texto={r.email} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-niebla">Contraseña temporal</span>
            <code className="rounded-lg border border-arena bg-white px-3 py-1.5 font-mono text-base tracking-wide">{r.contrasena}</code>
            <Copiar texto={r.contrasena} />
          </div>
          <p className="text-xs text-alerta">Guárdala ahora: no se puede volver a ver. La persona deberá cambiarla al entrar.</p>
        </div>
      )}
      {r.enlace && (
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg border border-arena bg-white px-3 py-2 text-xs">{r.enlace}</code>
          <Copiar texto={r.enlace} />
        </div>
      )}
      {texto && (
        <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#25d366] px-3 py-1.5 text-xs font-semibold text-white">
          <MessageCircle size={13} /> Enviar por WhatsApp
        </a>
      )}
    </section>
  );
}

function FormNuevo({ alTerminar, alResultado }: { alTerminar: () => void; alResultado: (r: Resultado) => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<"admin" | "asesor">("asesor");
  const [modo, setModo] = useState<"contrasena" | "invitacion">("contrasena");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  function crear() {
    setError(null);
    empezar(async () => {
      const r = await crearUsuario({ nombre, email, rol, modo, contrasena: modo === "contrasena" ? contrasena : undefined });
      if (!r.ok) return setError(r.error);
      alResultado(
        r.invitado
          ? { titulo: "Invitación enviada", usuario: nombre, email, mensaje: `Le llegó un correo a ${email} para crear su contraseña. Si no lo ve, que revise el spam.` }
          : { titulo: "Usuario creado", usuario: nombre, email, contrasena: r.contrasenaTemporal, mensaje: "Compártele estos datos de forma segura." },
      );
      alTerminar();
    });
  }

  return (
    <section className="space-y-5 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-5 shadow-[var(--shadow-suave)] sm:p-6">
      <h2 className="flex items-center gap-2 font-serif text-lg text-carbon"><UserPlus size={18} className="text-verde-golf" /> Nuevo usuario</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block"><span className="text-sm font-medium text-carbon">Nombre completo</span><input value={nombre} onChange={(e) => setNombre(e.target.value)} className={cn(estiloInput, alturaInput, "mt-1.5")} autoFocus /></label>
        <label className="block"><span className="text-sm font-medium text-carbon">Correo</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@clubhousetravel.com.co" className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
      </div>

      <div>
        <span className="text-sm font-medium text-carbon">Rol</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(ROLES) as (keyof typeof ROLES)[]).map((k) => (
            <button key={k} type="button" aria-pressed={rol === k} onClick={() => setRol(k)} className={cn("rounded-xl border-2 p-3 text-left transition", rol === k ? "border-verde-golf bg-verde-golf/[0.05]" : "border-arena bg-white hover:border-verde-golf/40")}>
              <span className="block text-sm font-semibold text-carbon">{ROLES[k].nombre}</span>
              <span className="block text-xs text-niebla">{ROLES[k].ayuda}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-carbon">¿Cómo recibe su acceso?</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["contrasena", KeyRound, "Contraseña temporal", "Se la das tú. Al entrar debe cambiarla."],
              ["invitacion", MailCheck, "Invitación por correo", "Recibe un enlace para crear su contraseña."],
            ] as const
          ).map(([id, Icono, titulo, ayuda]) => (
            <button key={id} type="button" aria-pressed={modo === id} onClick={() => setModo(id)} className={cn("flex items-start gap-3 rounded-xl border-2 p-3 text-left transition", modo === id ? "border-verde-golf bg-verde-golf/[0.05]" : "border-arena bg-white hover:border-verde-golf/40")}>
              <Icono size={18} className="mt-0.5 shrink-0 text-verde-golf" />
              <span><span className="block text-sm font-semibold text-carbon">{titulo}</span><span className="block text-xs text-niebla">{ayuda}</span></span>
            </button>
          ))}
        </div>
        {modo === "contrasena" && (
          <label className="mt-3 block">
            <span className="text-xs text-niebla">Déjala vacía para que el sistema genere una segura, o escribe la tuya.</span>
            <input value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Se genera sola" autoComplete="new-password" className={cn(estiloInput, alturaInput, "mt-1 max-w-sm font-mono")} />
            <MedidorClave valor={contrasena} />
          </label>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex gap-2">
        <button type="button" disabled={pendiente} onClick={crear} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60">
          {pendiente && <Loader2 size={16} className="animate-spin" />} Crear usuario
        </button>
        <button type="button" onClick={alTerminar} className="rounded-xl border border-arena bg-white px-4 py-2.5 text-sm text-carbon hover:border-verde-golf/40">Cancelar</button>
      </div>
    </section>
  );
}

function TarjetaUsuario({
  u,
  yo,
  alResultado,
  alError,
}: {
  u: UsuarioFila;
  yo: boolean;
  alResultado: (r: Resultado) => void;
  alError: (e: string | null) => void;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(u.nombre);
  const [rol, setRol] = useState(u.rol);
  const [menu, setMenu] = useState(false);
  const [pendiente, empezar] = useTransition();

  const correr = (f: () => Promise<{ ok: boolean; error?: string }>, despues?: () => void) => {
    alError(null);
    empezar(async () => {
      const r = await f();
      if (!r.ok) return alError(r.error ?? "No se pudo completar.");
      despues?.();
      router.refresh();
    });
  };

  const restablecer = (modo: "temporal" | "correo" | "enlace") => {
    setMenu(false);
    alError(null);
    empezar(async () => {
      const r = await restablecerContrasena(u.id, u.email, modo);
      if (!r.ok) return alError(r.error);
      if (modo === "correo") alResultado({ titulo: "Correo enviado", usuario: u.nombre, email: u.email, mensaje: `Le llegó a ${u.email} un enlace para crear una contraseña nueva.` });
      else if (modo === "enlace") alResultado({ titulo: "Enlace de restablecimiento", usuario: u.nombre, email: u.email, enlace: r.enlace, mensaje: "Envíaselo a la persona: sirve para crear su contraseña nueva." });
      else alResultado({ titulo: "Contraseña restablecida", usuario: u.nombre, email: u.email, contrasena: r.contrasenaTemporal, mensaje: "La anterior ya no sirve." });
      router.refresh();
    });
  };

  return (
    <li className={cn("rounded-2xl border bg-blanco-roto p-4 shadow-[var(--shadow-suave)]", u.activo ? "border-arena" : "border-arena/60 opacity-75")}>
      <div className="flex flex-wrap items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-champagne to-[#7d6230] text-sm font-semibold text-white">{iniciales(u.nombre)}</span>
        <div className="min-w-0 flex-1">
          {editando ? (
            <div className="flex flex-wrap items-center gap-2">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={cn(estiloInput, "h-10 max-w-xs")} />
              <select value={rol} onChange={(e) => setRol(e.target.value as "admin" | "asesor")} className={cn(estiloInput, "h-10 w-auto")}>
                <option value="asesor">Asesor</option>
                <option value="admin">Administrador</option>
              </select>
              <button type="button" disabled={pendiente} onClick={() => correr(() => actualizarUsuario(u.id, { nombre, rol }), () => setEditando(false))} className="rounded-lg bg-verde-golf px-3 py-2 text-xs font-semibold text-crema">Guardar</button>
              <button type="button" onClick={() => { setEditando(false); setNombre(u.nombre); setRol(u.rol); }} className="rounded-lg border border-arena px-3 py-2 text-xs text-carbon">Cancelar</button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-carbon">{u.nombre}</span>
                {yo && <span className="rounded-full bg-carbon px-2 py-0.5 text-[11px] font-semibold text-crema">Tú</span>}
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", ROLES[u.rol].tono)}>{ROLES[u.rol].nombre}</span>
                {!u.activo && <span className="rounded-full bg-error/10 px-2.5 py-0.5 text-[11px] font-semibold text-error">Desactivado</span>}
                {u.debeCambiar && <span className="rounded-full bg-champagne/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#8a6d1f]">Debe cambiar la contraseña</span>}
                {u.invitacionPendiente && <span className="rounded-full bg-arena px-2.5 py-0.5 text-[11px] font-semibold text-niebla">Invitación pendiente</span>}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-niebla"><Mail size={13} /> {u.email}</p>
              <p className="mt-0.5 text-xs text-niebla">Último acceso: {fecha(u.ultimoAcceso)} · Creado: {fecha(u.creado)}</p>
            </>
          )}
        </div>

        {!editando && (
          <div className="relative flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setEditando(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"><Pencil size={13} /> Editar</button>
            <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu} className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"><KeyRound size={13} /> Restablecer contraseña</button>
            {!yo && (
              <>
                <button type="button" disabled={pendiente} onClick={() => correr(() => cambiarEstadoUsuario(u.id, !u.activo))} className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"><Power size={13} /> {u.activo ? "Desactivar" : "Activar"}</button>
                <button
                  type="button"
                  disabled={pendiente}
                  aria-label={`Eliminar a ${u.nombre}`}
                  onClick={() => {
                    if (!window.confirm(`¿Eliminar a ${u.nombre}? Pierde el acceso para siempre. Si solo quieres bloquearlo, usa Desactivar.`)) return;
                    correr(() => eliminarUsuario(u.id));
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-arena bg-white text-error hover:border-error/50"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
            {menu && (
              <div className="absolute right-0 top-full z-20 mt-2 w-72 space-y-1 rounded-2xl border border-arena bg-white p-2 shadow-xl">
                {(
                  [
                    ["temporal", RefreshCw, "Contraseña temporal nueva", "La generas aquí y se la das a la persona."],
                    ["correo", MailCheck, "Enviar correo de restablecimiento", "Le llega un enlace a su correo."],
                    ["enlace", Link2, "Copiar enlace de restablecimiento", "Para mandarlo por WhatsApp."],
                  ] as const
                ).map(([id, Icono, titulo, ayuda]) => (
                  <button key={id} type="button" onClick={() => restablecer(id)} className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left hover:bg-verde-golf/[0.06]">
                    <Icono size={16} className="mt-0.5 shrink-0 text-verde-golf" />
                    <span><span className="block text-sm font-medium text-carbon">{titulo}</span><span className="block text-xs text-niebla">{ayuda}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {pendiente && <p className="mt-2 flex items-center gap-2 text-xs text-niebla"><Loader2 size={13} className="animate-spin" /> Procesando…</p>}
    </li>
  );
}

export function UsuariosWorkspace({
  usuarios,
  sinAcceso,
  yoId,
  servicioActivo,
  errorCarga,
  origen,
}: {
  usuarios: UsuarioFila[];
  sinAcceso: UsuarioFila[];
  yoId: string;
  servicioActivo: boolean;
  errorCarga: string | null;
  origen: string;
}) {
  const router = useRouter();
  const [creando, setCreando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">Usuarios</h1>
          <p className="max-w-2xl text-sm text-niebla">Quién del equipo puede entrar al panel. Crea cuentas, cambia roles y restablece contraseñas.</p>
        </div>
        {servicioActivo && !creando && (
          <button type="button" onClick={() => { setCreando(true); setResultado(null); }} className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-3 text-sm font-semibold text-crema hover:bg-verde-calle">
            <UserPlus size={16} /> Nuevo usuario
          </button>
        )}
      </div>

      {!servicioActivo && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-alerta/30 bg-alerta/10 p-4 text-sm text-alerta">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <strong className="block">La gestión de usuarios no está activada en el servidor.</strong>
            Añade la variable <code>SUPABASE_SERVICE_ROLE_KEY</code> (Supabase → Settings → API → service_role) en Vercel y vuelve a desplegar.
          </div>
        </div>
      )}
      {errorCarga && <p role="alert" className="text-sm text-error">{errorCarga}</p>}

      {resultado && <PanelResultado r={resultado} origen={origen} alCerrar={() => setResultado(null)} />}
      {creando && <FormNuevo alTerminar={() => { setCreando(false); router.refresh(); }} alResultado={setResultado} />}
      {error && <p role="alert" className="rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">{error}</p>}

      <ul className="space-y-3">
        {usuarios.map((u) => (
          <TarjetaUsuario key={u.id} u={u} yo={u.id === yoId} alResultado={setResultado} alError={setError} />
        ))}
        {usuarios.length === 0 && servicioActivo && <li className="rounded-2xl border border-dashed border-arena p-10 text-center text-sm text-niebla">Todavía no hay usuarios.</li>}
      </ul>

      {sinAcceso.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-serif text-lg text-carbon"><ShieldCheck size={17} className="text-verde-golf" /> Cuentas sin acceso al panel</h2>
          <p className="text-sm text-niebla">Existen en Supabase pero no pueden entrar. Puedes darles acceso.</p>
          <ul className="space-y-2">
            {sinAcceso.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-arena bg-white p-3">
                <span className="text-sm text-carbon">{u.email}</span>
                <span className="flex gap-2">
                  {(["asesor", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      disabled={pendiente}
                      onClick={() =>
                        empezar(async () => {
                          const x = await darAcceso(u.id, r, u.nombre);
                          if (x.ok) router.refresh();
                          else setError(x.error);
                        })
                      }
                      className="rounded-lg border border-verde-golf/40 px-3 py-1.5 text-xs font-medium text-verde-golf hover:bg-verde-golf/5"
                    >
                      Dar acceso como {ROLES[r].nombre.toLowerCase()}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
