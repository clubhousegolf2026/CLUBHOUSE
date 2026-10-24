"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, KeyRound, Loader2, Lock, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import { alturaInput, estiloInput } from "@/components/admin/form-ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Obj = Record<string, any>;

const COLOR_METODO: Record<string, string> = {
  get: "bg-[#2563eb] text-white",
  post: "bg-[#1f7a4d] text-white",
  patch: "bg-[#b7791f] text-white",
  put: "bg-[#b7791f] text-white",
  delete: "bg-[#b42318] text-white",
};
const FONDO_METODO: Record<string, string> = {
  get: "border-[#2563eb]/30 bg-[#2563eb]/[0.05]",
  post: "border-[#1f7a4d]/30 bg-[#1f7a4d]/[0.05]",
  patch: "border-[#b7791f]/30 bg-[#b7791f]/[0.06]",
  put: "border-[#b7791f]/30 bg-[#b7791f]/[0.06]",
  delete: "border-[#b42318]/30 bg-[#b42318]/[0.05]",
};

/* ───── utilidades ───── */

function resolver(spec: Obj, s: Obj | undefined): Obj {
  if (!s) return {};
  if (s.$ref) {
    const nombre = String(s.$ref).split("/").pop()!;
    return spec.components?.schemas?.[nombre] ?? {};
  }
  return s;
}

function tipoTexto(spec: Obj, s: Obj | undefined): string {
  if (!s) return "";
  if (s.$ref) return String(s.$ref).split("/").pop()!;
  if (s.type === "array") return `${tipoTexto(spec, s.items) || "any"}[]`;
  if (s.enum) return s.type ?? "string";
  return `${s.type ?? "object"}${s.format ? ` · ${s.format}` : ""}`;
}

/** Ejemplo plausible a partir del esquema, por si la operación no trae uno. */
function ejemploDe(spec: Obj, s: Obj | undefined, prof = 0): unknown {
  const r = resolver(spec, s);
  if (r.example !== undefined) return r.example;
  if (prof > 4) return null;
  if (r.enum) return r.enum[0];
  if (r.type === "array") return [ejemploDe(spec, r.items, prof + 1)];
  if (r.type === "object" || r.properties) {
    const o: Obj = {};
    for (const [k, v] of Object.entries<Obj>(r.properties ?? {})) o[k] = ejemploDe(spec, v, prof + 1);
    return o;
  }
  if (r.type === "integer" || r.type === "number") return 0;
  if (r.type === "boolean") return false;
  if (r.format === "date-time") return "2026-01-01T00:00:00.000Z";
  if (r.format === "date") return "2026-01-01";
  if (r.format === "uuid") return "00000000-0000-0000-0000-000000000000";
  return "string";
}

/** Markdown mínimo: párrafos, **negrita** y `código`. */
function Texto({ md, className }: { md?: string; className?: string }) {
  if (!md) return null;
  return (
    <div className={cn("space-y-2 text-sm leading-relaxed text-niebla", className)}>
      {md.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>
          {p.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((t, j) =>
            t.startsWith("**") ? (
              <strong key={j} className="font-semibold text-carbon">{t.slice(2, -2)}</strong>
            ) : t.startsWith("`") ? (
              <code key={j} className="rounded bg-arena/50 px-1 py-0.5 text-[12px] text-carbon">{t.slice(1, -1)}</code>
            ) : (
              <Fragment key={j}>{t}</Fragment>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

function Json({ valor }: { valor: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-xl bg-carbon p-4 text-[12px] leading-relaxed text-crema">
      {typeof valor === "string" ? valor : JSON.stringify(valor, null, 2)}
    </pre>
  );
}

function Codigo({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-auto rounded-xl bg-carbon p-4 pr-16 text-[12px] leading-relaxed text-crema">{texto}</pre>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(texto);
            setOk(true);
            setTimeout(() => setOk(false), 1500);
          } catch {}
        }}
        className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-[11px] text-crema hover:bg-white/20"
      >
        {ok ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function TablaPropiedades({ spec, esquema }: { spec: Obj; esquema: Obj | undefined }) {
  const r = resolver(spec, esquema);
  const props = Object.entries<Obj>(r.properties ?? {});
  if (props.length === 0) return null;
  const requeridos = new Set<string>(r.required ?? []);
  return (
    <div className="overflow-x-auto rounded-xl border border-arena bg-white">
      <table className="w-full text-left text-xs">
        <tbody className="divide-y divide-arena">
          {props.map(([nombre, p]) => {
            const pr = resolver(spec, p);
            return (
              <tr key={nombre} className="align-top">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-carbon">
                  {nombre}
                  {requeridos.has(nombre) && <span className="ml-1 text-error">*</span>}
                </td>
                <td className="px-3 py-2 text-niebla">
                  <span className="font-mono">{tipoTexto(spec, p)}</span>
                  {pr.nullable && <span className="ml-1">· nulo</span>}
                  {pr.enum && <span className="mt-0.5 block">Valores: {pr.enum.map((v: string) => `«${v}»`).join(", ")}</span>}
                  {pr.description && <span className="mt-0.5 block">{pr.description}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ───── operación ───── */

function curl(origen: string, metodo: string, ruta: string, usaClave: boolean, cuerpo?: string, consulta?: string) {
  const l = [`curl -X ${metodo.toUpperCase()} "${origen}${ruta}${consulta ? `?${consulta}` : ""}"`];
  if (usaClave) l.push(`  -H "Authorization: Bearer ch_live_TU_CLAVE"`);
  if (cuerpo) {
    l.push(`  -H "Content-Type: application/json"`);
    l.push(`  -d '${cuerpo.replace(/\s*\n\s*/g, " ")}'`);
  }
  return l.join(" \\\n");
}

function Operacion({ spec, ruta, metodo, op, clave, origen }: { spec: Obj; ruta: string; metodo: string; op: Obj; clave: string; origen: string }) {
  const [abierta, setAbierta] = useState(false);
  const [probando, setProbando] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const parametros: Obj[] = op.parameters ?? [];
  const cuerpoSchema = op.requestBody?.content?.["application/json"];
  const ejemploCuerpo = cuerpoSchema
    ? JSON.stringify(cuerpoSchema.example ?? ejemploDe(spec, cuerpoSchema.schema), null, 2)
    : "";
  const [cuerpo, setCuerpo] = useState(ejemploCuerpo);
  const [respuesta, setRespuesta] = useState<{ status: number; ms: number; cuerpo: string } | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const publica = Array.isArray(op.security) && op.security.length === 0;

  const rutaReal = ruta.replace(/\{(\w+)\}/g, (_, n) => encodeURIComponent(valores[n] ?? `{${n}}`));
  const consulta = parametros
    .filter((p) => p.in === "query" && valores[p.name])
    .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(valores[p.name])}`)
    .join("&");

  async function ejecutar() {
    setProbando(true);
    setFallo(null);
    setRespuesta(null);
    const t0 = performance.now();
    try {
      const res = await fetch(`${rutaReal}${consulta ? `?${consulta}` : ""}`, {
        method: metodo.toUpperCase(),
        headers: {
          ...(publica || !clave ? {} : { Authorization: `Bearer ${clave}` }),
          ...(cuerpoSchema ? { "Content-Type": "application/json" } : {}),
        },
        body: cuerpoSchema && metodo !== "get" ? cuerpo : undefined,
      });
      const texto = await res.text();
      let bonito = texto;
      try {
        bonito = JSON.stringify(JSON.parse(texto), null, 2);
      } catch {}
      setRespuesta({ status: res.status, ms: Math.round(performance.now() - t0), cuerpo: bonito || "(sin contenido)" });
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se pudo conectar.");
    } finally {
      setProbando(false);
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border", FONDO_METODO[metodo])}>
      <button type="button" onClick={() => setAbierta((v) => !v)} aria-expanded={abierta} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
        <span className={cn("w-16 shrink-0 rounded-md py-1 text-center text-[11px] font-bold uppercase tracking-wide", COLOR_METODO[metodo])}>{metodo}</span>
        <code className="min-w-0 truncate text-sm font-semibold text-carbon">{ruta}</code>
        <span className="ml-auto hidden truncate text-xs text-niebla sm:block">{op.summary}</span>
        {!publica && <Lock size={14} className="shrink-0 text-niebla" aria-label="Requiere clave" />}
        <ChevronDown size={16} className={cn("shrink-0 text-niebla transition-transform", abierta && "rotate-180")} />
      </button>

      {abierta && (
        <div className="space-y-5 border-t border-inherit bg-blanco-roto p-4">
          <div>
            <p className="font-medium text-carbon sm:hidden">{op.summary}</p>
            <Texto md={op.description} />
          </div>

          {parametros.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-niebla">Parámetros</h4>
              <div className="space-y-2">
                {parametros.map((p) => (
                  <div key={p.name} className="grid gap-2 rounded-xl border border-arena bg-white p-3 sm:grid-cols-[200px_1fr]">
                    <div>
                      <code className="text-sm font-semibold text-carbon">{p.name}</code>
                      {p.required && <span className="ml-1 text-error">*</span>}
                      <p className="text-[11px] text-niebla">{p.in === "path" ? "en la ruta" : "en la consulta"} · {tipoTexto(spec, p.schema)}</p>
                    </div>
                    <div className="space-y-1">
                      <Texto md={p.description} />
                      {p.schema?.enum ? (
                        <select
                          value={valores[p.name] ?? ""}
                          onChange={(e) => setValores((v) => ({ ...v, [p.name]: e.target.value }))}
                          className={cn(estiloInput, "h-9")}
                        >
                          <option value="">—</option>
                          {p.schema.enum.map((o: string) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          value={valores[p.name] ?? ""}
                          onChange={(e) => setValores((v) => ({ ...v, [p.name]: e.target.value }))}
                          placeholder={p.schema?.default !== undefined ? String(p.schema.default) : ""}
                          className={cn(estiloInput, "h-9")}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cuerpoSchema && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-niebla">Cuerpo (JSON)</h4>
              <TablaPropiedades spec={spec} esquema={cuerpoSchema.schema} />
              <textarea
                value={cuerpo}
                onChange={(e) => setCuerpo(e.target.value)}
                spellCheck={false}
                rows={Math.min(14, cuerpo.split("\n").length + 1)}
                className={cn(estiloInput, "py-3 font-mono text-[12px] leading-relaxed")}
              />
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-niebla">Respuestas</h4>
            <div className="space-y-2">
              {Object.entries<Obj>(op.responses ?? {}).map(([codigo, r]) => {
                const ej = r.content?.["application/json"];
                const ejemplo = ej ? (ej.example ?? ejemploDe(spec, ej.schema)) : null;
                return (
                  <details key={codigo} className="rounded-xl border border-arena bg-white" open={codigo.startsWith("2")}>
                    <summary className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                      <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs font-bold", codigo.startsWith("2") ? "bg-exito/10 text-exito" : "bg-error/10 text-error")}>{codigo}</span>
                      <span className="text-niebla">{r.description}</span>
                    </summary>
                    {ejemplo != null && <div className="p-3 pt-0"><Json valor={ejemplo} /></div>}
                  </details>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-niebla">Ejemplo con curl</h4>
            <Codigo texto={curl(origen, metodo, rutaReal, !publica, cuerpoSchema && metodo !== "get" ? cuerpo : undefined, consulta)} />
          </div>

          <div className="space-y-3 rounded-xl border border-arena bg-crema/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-carbon">Probar (Try it out)</h4>
              {!publica && !clave && <span className="text-xs text-alerta">Pega una clave arriba en «Authorize».</span>}
            </div>
            <button
              type="button"
              onClick={ejecutar}
              disabled={probando}
              className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-4 py-2 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60"
            >
              {probando ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />} Ejecutar
            </button>
            {fallo && <p className="text-sm text-error">{fallo}</p>}
            {respuesta && (
              <div className="space-y-2">
                <p className="text-xs text-niebla">
                  Estado{" "}
                  <span className={cn("rounded-md px-2 py-0.5 font-mono font-bold", respuesta.status < 300 ? "bg-exito/10 text-exito" : "bg-error/10 text-error")}>{respuesta.status}</span>{" "}
                  · {respuesta.ms} ms
                </p>
                <Json valor={respuesta.cuerpo} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── pantalla ───── */

const EJEMPLO_NODE = `import { createHmac, timingSafeEqual } from "node:crypto";

export function verificar(cuerpoCrudo, cabecera, secreto) {
  const partes = Object.fromEntries(cabecera.split(",").map((p) => p.split("=")));
  const t = Number(partes.t);
  if (Math.abs(Date.now() / 1000 - t) > 300) return false; // más de 5 min
  const esperada = createHmac("sha256", secreto).update(\`\${t}.\${cuerpoCrudo}\`).digest("hex");
  return timingSafeEqual(Buffer.from(esperada), Buffer.from(partes.v1));
}`;

const EJEMPLO_PY = `import hmac, hashlib, time

def verificar(cuerpo_crudo: bytes, cabecera: str, secreto: str) -> bool:
    partes = dict(p.split("=", 1) for p in cabecera.split(","))
    t = int(partes["t"])
    if abs(time.time() - t) > 300:
        return False  # más de 5 minutos
    firmado = f"{t}.".encode() + cuerpo_crudo
    esperada = hmac.new(secreto.encode(), firmado, hashlib.sha256).hexdigest()
    return hmac.compare_digest(esperada, partes["v1"])`;

export function DocumentacionApi({ spec, origen }: { spec: Obj; origen: string }) {
  const [clave, setClave] = useState("");
  const [autorizando, setAutorizando] = useState(false);

  const grupos = useMemo(() => {
    const porTag = new Map<string, { ruta: string; metodo: string; op: Obj }[]>();
    for (const [ruta, metodos] of Object.entries<Obj>(spec.paths)) {
      for (const [metodo, op] of Object.entries<Obj>(metodos)) {
        const tag = op.tags?.[0] ?? "General";
        porTag.set(tag, [...(porTag.get(tag) ?? []), { ruta, metodo, op }]);
      }
    }
    return (spec.tags as { name: string; description?: string }[]).map((t) => ({
      name: t.name,
      description: t.description ?? "",
      ops: porTag.get(t.name) ?? [],
    }));
  }, [spec]);

  const webhooks = spec["x-webhooks"] as Obj;
  const esquemas = Object.entries<Obj>(spec.components?.schemas ?? {});

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-3xl text-carbon">{spec.info.title}</h1>
          <span className="rounded-full bg-verde-golf/10 px-2.5 py-0.5 text-xs font-semibold text-verde-golf">v{spec.info.version}</span>
          <span className="rounded-full bg-arena/60 px-2.5 py-0.5 text-xs font-semibold text-niebla">OpenAPI {spec.openapi}</span>
        </div>
        <Texto md={spec.info.description} />
        <div className="flex flex-wrap items-center gap-3 text-xs text-niebla">
          <span>Base: <code className="rounded bg-arena/50 px-1.5 py-0.5 text-carbon">{origen}</code></span>
          <a href="/api/v1/openapi.json" target="_blank" rel="noreferrer" className="font-medium text-verde-golf underline underline-offset-2">
            Descargar openapi.json
          </a>
          <span className="text-niebla/70">· impórtalo en Postman, Insomnia o n8n.</span>
        </div>
      </header>

      <div className="sticky top-16 z-10 rounded-2xl border border-arena bg-blanco-roto/95 p-3 shadow-[var(--shadow-suave)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setAutorizando((v) => !v)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
              clave ? "border-exito/40 bg-exito/10 text-exito" : "border-arena bg-white text-carbon hover:border-verde-golf/50",
            )}
          >
            {clave ? <Lock size={15} /> : <KeyRound size={15} />} Authorize
          </button>
          <span className="text-xs text-niebla">{clave ? "Clave lista: «Ejecutar» la enviará." : "Pega una clave de API para probar los endpoints protegidos."}</span>
        </div>
        {autorizando && (
          <div className="mt-3 space-y-1.5">
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value.trim())}
              placeholder="ch_live_…"
              autoComplete="off"
              className={cn(estiloInput, alturaInput, "font-mono")}
            />
            <p className="text-xs text-niebla">La clave solo vive en esta pestaña; no se guarda.</p>
          </div>
        )}
      </div>

      {grupos.map((g) => (
        <section key={g.name} className="space-y-3">
          <div>
            <h2 className="font-serif text-xl text-carbon">{g.name}</h2>
            <p className="text-sm text-niebla">{g.description}</p>
          </div>
          <div className="space-y-2">
            {g.ops.map((o) => (
              <Operacion key={`${o.metodo}${o.ruta}`} spec={spec} ruta={o.ruta} metodo={o.metodo} op={o.op} clave={clave} origen={origen} />
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl text-carbon">Webhooks</h2>
          <p className="text-sm text-niebla">Avisos que Clubhouse envía a tu sistema.</p>
        </div>
        <Texto md={webhooks.descripcion} />

        <h3 className="text-sm font-semibold text-carbon">Verificar la firma</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-niebla">Node.js</p>
            <Codigo texto={EJEMPLO_NODE} />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-niebla">Python</p>
            <Codigo texto={EJEMPLO_PY} />
          </div>
        </div>

        <h3 className="text-sm font-semibold text-carbon">Eventos</h3>
        <div className="space-y-2">
          {Object.entries<Obj>(webhooks.eventos).map(([id, ev]) => (
            <details key={id} className="rounded-xl border border-arena bg-white">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3 px-3 py-2.5 text-sm">
                <span className="rounded-md bg-[#6d28d9] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">evento</span>
                <code className="font-semibold text-carbon">{id}</code>
                <span className="text-xs text-niebla">{ev.description}</span>
              </summary>
              <div className="p-3 pt-0">
                <Json valor={ev.requestBody.content["application/json"].example} />
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl text-carbon">Esquemas</h2>
        <div className="space-y-2">
          {esquemas.map(([nombre, s]) => (
            <details key={nombre} className="rounded-xl border border-arena bg-white">
              <summary className="cursor-pointer px-3 py-2.5 font-mono text-sm font-semibold text-carbon">{nombre}</summary>
              <div className="space-y-2 p-3 pt-0">
                {s.description && <Texto md={s.description} />}
                <TablaPropiedades spec={spec} esquema={s} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
