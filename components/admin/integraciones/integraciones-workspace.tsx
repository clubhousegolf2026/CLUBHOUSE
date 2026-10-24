"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { EVENTOS, SCOPES } from "@/lib/api/catalogo";
import { alturaInput, estiloInput } from "@/components/admin/form-ui";
import {
  actualizarWebhook,
  crearClaveApi,
  crearWebhook,
  eliminarClaveApi,
  eliminarWebhook,
  obtenerEntregas,
  probarWebhook,
  regenerarSecretoWebhook,
  revocarClaveApi,
  type EntregaFila,
} from "@/app/admin/(panel)/integraciones/actions";

export type ClaveFila = {
  id: string;
  nombre: string;
  prefijo: string;
  scopes: string[];
  activa: boolean;
  ultimo_uso: string | null;
  created_at: string;
  revocada_at: string | null;
};

export type WebhookFila = {
  id: string;
  nombre: string;
  url: string;
  eventos: string[];
  secreto: string;
  activo: boolean;
  created_at: string;
};

const fecha = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso))
    : "—";

const etiquetaScope = (id: string) => SCOPES.find((s) => s.id === id)?.etiqueta ?? id;
const etiquetaEvento = (id: string) => EVENTOS.find((e) => e.id === id)?.etiqueta ?? id;

function Copiar({ texto, etiqueta = "Copiar" }: { texto: string; etiqueta?: string }) {
  const [listo, setListo] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setListo(true);
          setTimeout(() => setListo(false), 1800);
        } catch {}
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-2.5 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"
    >
      {listo ? <Check size={13} className="text-exito" /> : <Copy size={13} />}
      {listo ? "Copiado" : etiqueta}
    </button>
  );
}

function Aviso({ tono, children }: { tono: "alerta" | "error"; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-sm",
        tono === "error" ? "border-error/30 bg-error/10 text-error" : "border-alerta/30 bg-alerta/10 text-alerta",
      )}
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function Casillas({
  opciones,
  valor,
  onChange,
}: {
  opciones: readonly { id: string; etiqueta: string; ayuda: string }[];
  valor: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {opciones.map((o) => {
        const activo = valor.includes(o.id);
        return (
          <label
            key={o.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
              activo ? "border-verde-golf bg-verde-golf/[0.06]" : "border-arena bg-white hover:border-verde-golf/40",
            )}
          >
            <input
              type="checkbox"
              checked={activo}
              onChange={() => onChange(activo ? valor.filter((x) => x !== o.id) : [...valor, o.id])}
              className="mt-0.5 h-4 w-4 accent-[var(--color-verde-golf)]"
            />
            <span>
              <span className="block text-sm font-medium text-carbon">{o.etiqueta}</span>
              <span className="block text-xs text-niebla">{o.ayuda}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ───────────── Claves ───────────── */

function FormClave({ alCrear }: { alCrear: (clave: string) => void }) {
  const [nombre, setNombre] = useState("");
  const [scopes, setScopes] = useState<string[]>(["leads:read"]);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  return (
    <div className="space-y-4 rounded-2xl border border-arena bg-blanco-roto p-5">
      <h3 className="font-serif text-lg text-carbon">Nueva clave de API</h3>
      <label className="block">
        <span className="text-sm font-medium text-carbon">Nombre</span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej.: n8n, Contabilidad, Mi app"
          className={cn(estiloInput, alturaInput, "mt-1.5")}
        />
        <span className="mt-1 block text-xs text-niebla">Solo para que reconozcas quién la usa.</span>
      </label>
      <div>
        <span className="text-sm font-medium text-carbon">Permisos</span>
        <div className="mt-1.5">
          <Casillas opciones={SCOPES} valor={scopes} onChange={setScopes} />
        </div>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="button"
        disabled={pendiente}
        onClick={() =>
          empezar(async () => {
            setError(null);
            const r = await crearClaveApi({ nombre, scopes });
            if (r.ok) {
              setNombre("");
              alCrear(r.clave);
            } else setError(r.error);
          })
        }
        className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60"
      >
        {pendiente ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        Crear clave
      </button>
    </div>
  );
}

function SeccionClaves({ claves }: { claves: ClaveFila[] }) {
  const [creando, setCreando] = useState(false);
  const [nueva, setNueva] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-niebla">
          Una clave deja que otro sistema (n8n, Zapier, tu app) lea o escriba en el CRM. Se muestra completa
          <strong className="text-carbon"> una sola vez</strong>; después solo verás su inicio.
        </p>
        {!creando && (
          <button
            type="button"
            onClick={() => {
              setCreando(true);
              setNueva(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-4 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle"
          >
            <Plus size={16} /> Nueva clave
          </button>
        )}
      </div>

      {nueva && (
        <div className="space-y-3 rounded-2xl border border-champagne/50 bg-champagne/10 p-5">
          <p className="text-sm font-semibold text-carbon">Copia tu clave ahora: no volverá a mostrarse.</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 break-all rounded-lg border border-arena bg-white px-3 py-2 text-sm text-carbon">{nueva}</code>
            <Copiar texto={nueva} />
          </div>
          <button type="button" onClick={() => setNueva(null)} className="text-xs text-niebla underline">
            Ya la guardé
          </button>
        </div>
      )}

      {creando && !nueva && (
        <FormClave
          alCrear={(c) => {
            setNueva(c);
            setCreando(false);
          }}
        />
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {claves.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-arena p-8 text-center text-sm text-niebla">
          Aún no hay claves. Crea la primera para conectar otro sistema.
        </div>
      ) : (
        <ul className="space-y-3">
          {claves.map((c) => {
            const viva = c.activa && !c.revocada_at;
            return (
              <li key={c.id} className="rounded-2xl border border-arena bg-blanco-roto p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-carbon">{c.nombre}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", viva ? "bg-exito/10 text-exito" : "bg-error/10 text-error")}>
                        {viva ? "Activa" : "Revocada"}
                      </span>
                    </div>
                    <code className="mt-1 block text-xs text-niebla">{c.prefijo}…</code>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {c.scopes.map((s) => (
                        <span key={s} className="rounded-full bg-arena/50 px-2 py-0.5 text-[11px] text-carbon">
                          {etiquetaScope(s)}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-niebla">
                      Creada {fecha(c.created_at)} · Último uso {fecha(c.ultimo_uso)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {viva && (
                      <button
                        type="button"
                        disabled={pendiente}
                        onClick={() => {
                          if (!window.confirm(`¿Revocar la clave «${c.nombre}»? Los sistemas que la usen dejarán de funcionar.`)) return;
                          empezar(async () => {
                            const r = await revocarClaveApi(c.id);
                            if (!r.ok) setError(r.error);
                          });
                        }}
                        className="rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-alerta/50"
                      >
                        Revocar
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={pendiente}
                      aria-label={`Eliminar ${c.nombre}`}
                      onClick={() => {
                        if (!window.confirm(`¿Eliminar la clave «${c.nombre}» definitivamente?`)) return;
                        empezar(async () => {
                          const r = await eliminarClaveApi(c.id);
                          if (!r.ok) setError(r.error);
                        });
                      }}
                      className="rounded-lg border border-arena bg-white p-2 text-niebla hover:border-error/50 hover:text-error"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────────── Webhooks ───────────── */

function FormWebhook({
  inicial,
  alTerminar,
}: {
  inicial?: WebhookFila;
  alTerminar: () => void;
}) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [url, setUrl] = useState(inicial?.url ?? "");
  const [eventos, setEventos] = useState<string[]>(inicial?.eventos ?? ["lead.creado"]);
  const [activo, setActivo] = useState(inicial?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  return (
    <div className="space-y-4 rounded-2xl border border-arena bg-blanco-roto p-5">
      <h3 className="font-serif text-lg text-carbon">{inicial ? "Editar webhook" : "Nuevo webhook"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-carbon">Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.: n8n · nuevos leads" className={cn(estiloInput, alturaInput, "mt-1.5")} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-carbon">URL de destino</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/webhook" inputMode="url" className={cn(estiloInput, alturaInput, "mt-1.5")} />
        </label>
      </div>
      <div>
        <span className="text-sm font-medium text-carbon">Avisar cuando…</span>
        <div className="mt-1.5">
          <Casillas opciones={EVENTOS} valor={eventos} onChange={setEventos} />
        </div>
      </div>
      {inicial && (
        <label className="flex items-center gap-2 text-sm text-carbon">
          <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="h-4 w-4 accent-[var(--color-verde-golf)]" />
          Webhook activo
        </label>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pendiente}
          onClick={() =>
            empezar(async () => {
              setError(null);
              const r = inicial
                ? await actualizarWebhook(inicial.id, { nombre, url, eventos, activo })
                : await crearWebhook({ nombre, url, eventos });
              if (r.ok) alTerminar();
              else setError(r.error);
            })
          }
          className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60"
        >
          {pendiente && <Loader2 size={16} className="animate-spin" />}
          {inicial ? "Guardar cambios" : "Crear webhook"}
        </button>
        <button type="button" onClick={alTerminar} className="rounded-xl border border-arena bg-white px-4 py-2.5 text-sm text-carbon hover:border-verde-golf/40">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function TarjetaWebhook({ w, alEditar }: { w: WebhookFila; alEditar: () => void }) {
  const [verSecreto, setVerSecreto] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [entregas, setEntregas] = useState<EntregaFila[] | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, empezar] = useTransition();

  const cargarEntregas = () =>
    empezar(async () => {
      const r = await obtenerEntregas(w.id);
      if (r.ok) setEntregas(r.entregas);
      else setError(r.error);
    });

  return (
    <li className="rounded-2xl border border-arena bg-blanco-roto p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-carbon">{w.nombre}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", w.activo ? "bg-exito/10 text-exito" : "bg-arena text-niebla")}>
              {w.activo ? "Activo" : "Pausado"}
            </span>
          </div>
          <code className="mt-1 block break-all text-xs text-niebla">{w.url}</code>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {w.eventos.map((e) => (
              <span key={e} className="rounded-full bg-arena/50 px-2 py-0.5 text-[11px] text-carbon">
                {etiquetaEvento(e)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pendiente}
            onClick={() =>
              empezar(async () => {
                setResultado(null);
                setError(null);
                const r = await probarWebhook(w.id);
                if (!r.ok) setError(r.error);
                else setResultado(r.exito ? `Respondió ${r.status} en ${r.ms} ms ✔` : `Falló: ${r.error ?? "sin respuesta"}`);
                if (abierto) cargarEntregas();
              })
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-1.5 text-xs font-medium text-carbon hover:border-verde-golf/50"
          >
            {pendiente ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Enviar prueba
          </button>
          <button type="button" onClick={alEditar} aria-label="Editar" className="rounded-lg border border-arena bg-white p-2 text-niebla hover:border-verde-golf/50 hover:text-carbon">
            <Pencil size={14} />
          </button>
          <button
            type="button"
            disabled={pendiente}
            aria-label="Eliminar"
            onClick={() => {
              if (!window.confirm(`¿Eliminar el webhook «${w.nombre}» y su historial?`)) return;
              empezar(async () => {
                const r = await eliminarWebhook(w.id);
                if (!r.ok) setError(r.error);
              });
            }}
            className="rounded-lg border border-arena bg-white p-2 text-niebla hover:border-error/50 hover:text-error"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {resultado && <p className="mt-3 text-sm text-carbon">{resultado}</p>}
      {error && <p className="mt-3 text-sm text-error">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-crema px-3 py-2">
        <span className="text-xs text-niebla">Secreto de firma</span>
        <code className="min-w-0 flex-1 truncate text-xs text-carbon">{verSecreto ? w.secreto : "whsec_••••••••••••••••••••"}</code>
        <button type="button" onClick={() => setVerSecreto((v) => !v)} aria-label={verSecreto ? "Ocultar secreto" : "Ver secreto"} className="text-niebla hover:text-carbon">
          {verSecreto ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <Copiar texto={w.secreto} />
        <button
          type="button"
          disabled={pendiente}
          onClick={() => {
            if (!window.confirm("¿Generar un secreto nuevo? El anterior dejará de ser válido y deberás actualizarlo en el sistema que recibe los avisos.")) return;
            empezar(async () => {
              const r = await regenerarSecretoWebhook(w.id);
              if (!r.ok) setError(r.error);
            });
          }}
          className="inline-flex items-center gap-1 text-xs text-niebla hover:text-carbon"
        >
          <RefreshCw size={12} /> Regenerar
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          const siguiente = !abierto;
          setAbierto(siguiente);
          if (siguiente && entregas === null) cargarEntregas();
        }}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-verde-golf hover:text-verde-calle"
      >
        <ChevronDown size={14} className={cn("transition-transform", abierto && "rotate-180")} />
        Historial de entregas
      </button>

      {abierto && (
        <div className="mt-2 overflow-hidden rounded-xl border border-arena bg-white">
          {entregas === null ? (
            <p className="p-4 text-sm text-niebla">Cargando…</p>
          ) : entregas.length === 0 ? (
            <p className="p-4 text-sm text-niebla">Todavía no se ha enviado ningún aviso. Usa «Enviar prueba».</p>
          ) : (
            <ul className="divide-y divide-arena">
              {entregas.map((e) => (
                <li key={e.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2 text-xs">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", e.ok ? "bg-exito" : "bg-error")} />
                      <span className="font-medium text-carbon">{e.evento}</span>
                      <span className="text-niebla">{e.http_estado ?? "sin respuesta"}</span>
                      <span className="text-niebla">{e.duracion_ms != null ? `${e.duracion_ms} ms` : ""}</span>
                      <span className="ml-auto text-niebla">{fecha(e.created_at)}</span>
                    </summary>
                    <div className="space-y-2 border-t border-arena bg-crema/60 p-3">
                      {e.error && <p className="text-xs text-error">{e.error}</p>}
                      <pre className="max-h-56 overflow-auto rounded-lg bg-carbon p-3 text-[11px] leading-relaxed text-crema">
                        {JSON.stringify(e.payload, null, 2)}
                      </pre>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function SeccionWebhooks({ webhooks }: { webhooks: WebhookFila[] }) {
  const [modo, setModo] = useState<"lista" | "nuevo" | string>("lista");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-niebla">
          Un webhook es una dirección web a la que Clubhouse <strong className="text-carbon">avisa</strong> cuando pasa algo
          (un lead nuevo, un pago…), firmando cada mensaje para que puedas comprobar que es auténtico.
        </p>
        {modo === "lista" && (
          <button
            type="button"
            onClick={() => setModo("nuevo")}
            className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-4 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle"
          >
            <Plus size={16} /> Nuevo webhook
          </button>
        )}
      </div>

      {modo === "nuevo" && <FormWebhook alTerminar={() => setModo("lista")} />}

      {webhooks.length === 0 && modo !== "nuevo" ? (
        <div className="rounded-2xl border border-dashed border-arena p-8 text-center text-sm text-niebla">
          Aún no hay webhooks. Crea uno para recibir avisos en tu automatización.
        </div>
      ) : (
        <ul className="space-y-3">
          {webhooks.map((w) =>
            modo === w.id ? (
              <li key={w.id}>
                <FormWebhook inicial={w} alTerminar={() => setModo("lista")} />
              </li>
            ) : (
              <TarjetaWebhook key={w.id} w={w} alEditar={() => setModo(w.id)} />
            ),
          )}
        </ul>
      )}
    </div>
  );
}

/* ───────────── Pantalla ───────────── */

export function IntegracionesWorkspace({
  claves,
  webhooks,
  migracionPendiente,
  errorCarga,
  servicioActivo,
}: {
  claves: ClaveFila[];
  webhooks: WebhookFila[];
  migracionPendiente: boolean;
  errorCarga: string | null;
  servicioActivo: boolean;
}) {
  const [tab, setTab] = useState<"claves" | "webhooks">("claves");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">Integraciones</h1>
          <p className="text-sm text-niebla">Conecta Clubhouse con n8n, Zapier, tu contabilidad o tu propia app.</p>
        </div>
        <Link
          href="/admin/integraciones/documentacion"
          className="inline-flex items-center gap-2 rounded-xl border border-arena bg-white px-4 py-2.5 text-sm font-semibold text-carbon hover:border-verde-golf/50"
        >
          <BookOpen size={16} /> Documentación de la API
        </Link>
      </div>

      {migracionPendiente && (
        <Aviso tono="alerta">
          <strong className="block">Falta crear las tablas en Supabase.</strong>
          Ejecuta <code>supabase/migrations/0007_api_webhooks.sql</code> en el SQL Editor y recarga esta página.
        </Aviso>
      )}
      {errorCarga && (
        <Aviso tono="error">
          <strong className="block">No se pudo cargar.</strong>
          {errorCarga}
        </Aviso>
      )}
      {!servicioActivo && !migracionPendiente && (
        <Aviso tono="alerta">
          <strong className="block">La API todavía no está activada en el servidor.</strong>
          Añade la variable <code>SUPABASE_SERVICE_ROLE_KEY</code> (Supabase → Settings → API → service_role) en Vercel y vuelve a desplegar.
          Hasta entonces las claves se crean, pero las llamadas responderán 503 y los webhooks usarán tu sesión.
        </Aviso>
      )}

      <div role="tablist" className="inline-flex rounded-xl border border-arena bg-white p-1">
        {(
          [
            ["claves", "Claves de API", KeyRound, claves.length],
            ["webhooks", "Webhooks", Webhook, webhooks.length],
          ] as const
        ).map(([id, etiqueta, Icono, n]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition",
              tab === id ? "bg-verde-golf text-crema" : "text-niebla hover:text-carbon",
            )}
          >
            <Icono size={15} /> {etiqueta}
            <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", tab === id ? "bg-white/20" : "bg-arena/60")}>{n}</span>
          </button>
        ))}
      </div>

      {tab === "claves" ? <SeccionClaves claves={claves} /> : <SeccionWebhooks webhooks={webhooks} />}
    </div>
  );
}
