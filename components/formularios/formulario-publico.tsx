"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Loader2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  calcularCobro,
  cobraAlgo,
  esCampoDeDato,
  esVisible,
  pasosDe,
  pesos,
  validar,
  validarCampo,
  vacio,
  type Cobro,
  type Valores,
} from "@/lib/formularios/esquema";
import type { CampoFormulario, ConfigFormulario, FormularioFila } from "@/lib/formularios/tipos";

const RADIO_PX = { recto: 4, suave: 14, redondo: 26 } as const;
const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function textoSobre(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0"), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 165 ? "#14251d" : "#ffffff";
}

/* ───────────── Campos ───────────── */

function Etiqueta({ c }: { c: CampoFormulario }) {
  return (
    <span className="fm-label">
      {c.etiqueta}
      {c.requerido && <span style={{ color: "var(--ac)" }}> *</span>}
    </span>
  );
}

function CampoUI({
  c,
  valor,
  onChange,
  error,
  sinEtiqueta = false,
  letras = false,
  alElegir,
}: {
  c: CampoFormulario;
  valor: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  error?: string;
  sinEtiqueta?: boolean;
  letras?: boolean;
  alElegir?: () => void;
}) {
  const texto = Array.isArray(valor) ? "" : (valor ?? "");
  const lista = Array.isArray(valor) ? valor : [];
  const opciones = c.opciones ?? [];
  const invalido = error ? true : undefined;

  let control: React.ReactNode = null;
  switch (c.tipo) {
    case "texto":
    case "email":
    case "telefono":
    case "fecha":
      control = (
        <input
          className="fm-input"
          type={c.tipo === "texto" ? "text" : c.tipo === "telefono" ? "tel" : c.tipo}
          value={texto}
          placeholder={c.placeholder}
          aria-invalid={invalido}
          autoComplete={c.mapeo === "nombre" ? "name" : c.tipo === "email" ? "email" : c.tipo === "telefono" ? "tel" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "parrafo":
      control = (
        <textarea
          className="fm-input"
          rows={4}
          style={{ resize: "vertical" }}
          value={texto}
          placeholder={c.placeholder}
          aria-invalid={invalido}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case "numero": {
      const n = Number(texto);
      const actual = Number.isFinite(n) && texto !== "" ? n : c.min ?? 0;
      const poner = (x: number) => {
        const min = c.min ?? -Infinity;
        const max = c.max ?? Infinity;
        onChange(String(Math.min(max, Math.max(min, x))));
      };
      control = (
        <div className="fm-stepper">
          <button type="button" aria-label="Menos" onClick={() => poner(actual - 1)}>
            <Minus size={16} />
          </button>
          <input type="number" value={texto} placeholder={c.min != null ? String(c.min) : "0"} aria-invalid={invalido} onChange={(e) => onChange(e.target.value)} />
          <button type="button" aria-label="Más" onClick={() => poner(actual + 1)}>
            <Plus size={16} />
          </button>
        </div>
      );
      break;
    }
    case "lista":
      control = (
        <div className="relative">
          <select className="fm-input pr-10" value={texto} aria-invalid={invalido} onChange={(e) => onChange(e.target.value)}>
            <option value="">{c.placeholder || "Seleccione…"}</option>
            {opciones.map((o) => (
              <option key={o.etiqueta} value={o.etiqueta}>
                {o.etiqueta}
                {o.precio ? ` (+${pesos(o.precio)})` : ""}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60" />
        </div>
      );
      break;
    case "opciones":
      control = (
        <div className={cn("grid gap-2", opciones.length > 2 && !letras && "@2xl:grid-cols-2")}>
          {opciones.map((o, i) => {
            const on = texto === o.etiqueta;
            return (
              <button
                key={o.etiqueta}
                type="button"
                className="fm-opcion"
                data-on={on}
                onClick={() => {
                  onChange(o.etiqueta);
                  alElegir?.();
                }}
              >
                <span className="fm-marca">{letras ? LETRAS[i] : on ? <Check size={12} /> : null}</span>
                <span className="flex-1">{o.etiqueta}</span>
                {o.precio ? <span className="text-xs opacity-70">+{pesos(o.precio)}</span> : null}
              </button>
            );
          })}
        </div>
      );
      break;
    case "casillas":
      control = (
        <div className={cn("grid gap-2", opciones.length > 2 && !letras && "@2xl:grid-cols-2")}>
          {opciones.map((o, i) => {
            const on = lista.includes(o.etiqueta);
            return (
              <button
                key={o.etiqueta}
                type="button"
                className="fm-opcion"
                data-on={on}
                onClick={() => onChange(on ? lista.filter((x) => x !== o.etiqueta) : [...lista, o.etiqueta])}
              >
                <span className="fm-marca fm-marca-caja">{letras ? LETRAS[i] : on ? <Check size={12} /> : null}</span>
                <span className="flex-1">{o.etiqueta}</span>
                {o.precio ? <span className="text-xs opacity-70">+{pesos(o.precio)}</span> : null}
              </button>
            );
          })}
        </div>
      );
      break;
    case "consentimiento": {
      const on = texto === "si";
      return (
        <div>
          <button type="button" className="fm-opcion" data-on={on} onClick={() => onChange(on ? "" : "si")}>
            <span className="fm-marca fm-marca-caja">{on ? <Check size={12} /> : null}</span>
            <span className="flex-1 text-[13px] leading-snug">
              {c.etiqueta}
              {c.requerido && <span style={{ color: "var(--ac)" }}> *</span>}
            </span>
          </button>
          {error && <span className="fm-error">{error}</span>}
        </div>
      );
    }
    default:
      return null;
  }

  return (
    <div>
      {!sinEtiqueta && (
        <div className="mb-1.5">
          <Etiqueta c={c} />
        </div>
      )}
      {control}
      {c.ayuda && !sinEtiqueta && <span className="fm-ayuda">{c.ayuda}</span>}
      {error && <span className="fm-error">{error}</span>}
    </div>
  );
}

/** Rejilla de campos de una página (los de «mitad» van de a dos). */
function Rejilla({
  campos,
  valores,
  errores,
  poner,
  claseTitulo,
}: {
  campos: CampoFormulario[];
  valores: Valores;
  errores: Record<string, string>;
  poner: (id: string, v: string | string[]) => void;
  claseTitulo: string;
}) {
  return (
    <div className="grid gap-x-5 gap-y-6 @2xl:grid-cols-2">
      {campos.map((c) => {
        if (c.tipo === "titulo" || c.tipo === "paso") {
          return (
            <div key={c.id} className="@2xl:col-span-2">
              <h3 className={cn(claseTitulo, "text-xl")}>{c.etiqueta}</h3>
              {c.ayuda && <p className="mt-1 text-sm" style={{ color: "var(--fm-suave)" }}>{c.ayuda}</p>}
            </div>
          );
        }
        return (
          <div key={c.id} className={c.ancho === "mitad" ? "" : "@2xl:col-span-2"}>
            <CampoUI c={c} valor={valores[c.id]} onChange={(v) => poner(c.id, v)} error={errores[c.id]} />
          </div>
        );
      })}
    </div>
  );
}

function ResumenPago({ cfg, cobro }: { cfg: ConfigFormulario; cobro: Cobro }) {
  if (!cobraAlgo(cfg, cobro)) return null;
  const anticipo = cobro.cobrarCop !== cobro.totalCop;
  return (
    <div className="fm-pago">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span style={{ color: "var(--fm-suave)" }}>
          {cfg.pago.concepto || "Total"}
          {cobro.personas > 1 ? ` · ${cobro.personas} personas` : ""}
        </span>
        <span className="font-medium">{pesos(cobro.totalCop)}</span>
      </div>
      {anticipo && (
        <div className="mt-2 flex items-baseline justify-between gap-3 border-t pt-2" style={{ borderColor: "var(--fm-borde)" }}>
          <span className="text-sm font-medium">Anticipo a pagar ahora ({cfg.pago.anticipoPct}%)</span>
          <span className="font-serif text-2xl" style={{ color: "var(--ac)" }}>{pesos(cobro.cobrarCop)}</span>
        </div>
      )}
      {!anticipo && (
        <p className="mt-1 text-xs" style={{ color: "var(--fm-suave)" }}>
          Al enviar pasará al pago seguro con Wompi (tarjeta, PSE, Nequi…).
        </p>
      )}
    </div>
  );
}

function Marca({ mostrar }: { mostrar: boolean }) {
  if (!mostrar) return null;
  return (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/icon.png" alt="" width={28} height={28} className="h-7 w-7" />
      <span className="text-sm font-semibold uppercase tracking-[0.18em]">Clubhouse</span>
    </div>
  );
}

function Exito({ exito, claseTitulo }: { exito: ConfigFormulario["exito"]; claseTitulo: string }) {
  useEffect(() => {
    if (!exito.redireccion) return;
    const t = setTimeout(() => {
      window.location.href = exito.redireccion;
    }, 2800);
    return () => clearTimeout(t);
  }, [exito.redireccion]);
  return (
    <div className="fm-entra py-6 text-center">
      <span
        className="relative mx-auto grid h-20 w-20 place-items-center rounded-full"
        style={{ background: "var(--ac)", color: "var(--ac-t)", boxShadow: "0 20px 40px -14px color-mix(in srgb, var(--ac) 70%, transparent)" }}
      >
        <Check size={38} strokeWidth={2.5} />
      </span>
      <h2 className={cn(claseTitulo, "mt-7 text-3xl @2xl:text-4xl")}>{exito.titulo}</h2>
      <p className="mx-auto mt-3 max-w-md" style={{ color: "var(--fm-suave)" }}>{exito.texto}</p>
    </div>
  );
}

/* ───────────── Formulario ───────────── */

function FormularioInterno({
  formulario,
  cerrado = false,
  vista = false,
}: {
  formulario: FormularioFila;
  cerrado?: boolean;
  /** Vista previa del admin: no envía nada y se ajusta a su contenedor. */
  vista?: boolean;
}) {
  const cfg = formulario.config;
  const plantilla = formulario.plantilla;
  const d = cfg.diseno;

  const [valores, setValores] = useState<Valores>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [exito, setExito] = useState<ConfigFormulario["exito"] | null>(null);
  const [paso, setPaso] = useState(0);
  const [atras, setAtras] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [t] = useState(() => Date.now());
  const contenedor = useRef<HTMLDivElement>(null);

  const cobro = useMemo(() => calcularCobro(cfg, valores), [cfg, valores]);

  const vars = {
    "--ac": d.acento,
    "--ac-t": textoSobre(d.acento),
    "--fr": `${RADIO_PX[d.radio]}px`,
  } as React.CSSProperties;
  const claseTitulo = d.fuente === "serif" ? "font-serif" : "font-sans font-semibold tracking-tight";

  const poner = (id: string, v: string | string[]) => {
    setValores((prev) => ({ ...prev, [id]: v }));
    setErrores((prev) => {
      if (!prev[id]) return prev;
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  // Estructuras por plantilla
  const planos = cfg.campos.filter((c) => esVisible(c, valores));
  const pasos = useMemo(() => pasosDe(cfg, valores), [cfg, valores]);
  const diapositivas = useMemo(
    () => cfg.campos.filter((c) => c.tipo !== "paso" && esVisible(c, valores)),
    [cfg, valores],
  );

  const validarLista = (lista: CampoFormulario[]): Record<string, string> => {
    const e: Record<string, string> = {};
    for (const c of lista) {
      if (!esCampoDeDato(c)) continue;
      const m = validarCampo(c, valores[c.id]);
      if (m) e[c.id] = m;
    }
    return e;
  };

  function irAPrimerError(e: Record<string, string>) {
    const primero = Object.keys(e)[0];
    if (!primero) return;
    if (plantilla === "pasos") {
      const i = pasos.findIndex((p) => p.campos.some((c) => c.id === primero));
      if (i >= 0) setPaso(i);
    } else if (plantilla === "conversacional") {
      const i = diapositivas.findIndex((c) => c.id === primero);
      if (i >= 0) setPaso(i + 1);
    }
  }

  async function enviar() {
    if (vista) {
      setAviso("Vista previa: aquí no se envía nada.");
      setTimeout(() => setAviso(null), 2500);
      return;
    }
    const { errores: e, limpio } = validar(cfg, valores);
    if (Object.keys(e).length > 0) {
      setErrores(e);
      irAPrimerError(e);
      return;
    }
    setEnviando(true);
    setErrorGeneral(null);
    let redirige = false;
    try {
      const res = await fetch(`/api/formularios/${formulario.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valores: limpio, t, website: "" }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; error?: string; errores?: Record<string, string>; pago?: string | null; exito?: ConfigFormulario["exito"] | null } | null;
      if (res.ok && j?.ok) {
        if (j.pago) {
          redirige = true;
          window.location.href = j.pago;
          return;
        }
        setExito(j.exito ?? cfg.exito);
      } else {
        if (j?.errores) {
          setErrores(j.errores);
          irAPrimerError(j.errores);
        }
        setErrorGeneral(j?.error ?? "No pudimos enviar su inscripción. Inténtelo de nuevo.");
      }
    } catch {
      setErrorGeneral("No hay conexión. Revise su internet e inténtelo de nuevo.");
    } finally {
      if (!redirige) setEnviando(false);
    }
  }

  const alto = vista ? "min-h-[640px]" : "min-h-dvh";
  const botonEnviar = (
    <button type="submit" className="fm-btn" disabled={enviando}>
      {enviando ? <Loader2 size={17} className="animate-spin" /> : null}
      {enviando ? "Enviando…" : cobraAlgo(cfg, cobro) ? `${cfg.boton} y pagar` : cfg.boton}
      {!enviando && <ArrowRight size={17} />}
    </button>
  );
  const pie = (
    <>
      <ResumenPago cfg={cfg} cobro={cobro} />
      {errorGeneral && (
        <p role="alert" className="text-sm" style={{ color: "#d92d20" }}>
          {errorGeneral}
        </p>
      )}
      {aviso && (
        <p role="status" className="text-sm" style={{ color: "var(--ac)" }}>
          {aviso}
        </p>
      )}
    </>
  );

  /* ── Cerrado ── */
  if (cerrado) {
    return (
      <div className={cn("fm grid place-items-center bg-[#f6f3ec] px-4", alto)} style={vars}>
        <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
          <h1 className={cn(claseTitulo, "text-3xl")}>Inscripciones cerradas</h1>
          <p className="mt-3" style={{ color: "var(--fm-suave)" }}>
            El plazo de este formulario terminó. Escríbanos y le ayudamos.
          </p>
        </div>
      </div>
    );
  }

  /* ── 1 · Clásico ── */
  if (plantilla === "clasico") {
    return (
      <div className={cn("fm bg-[#f6f3ec] px-4 py-10 @2xl:py-16", alto)} style={vars}>
        <div className="mx-auto max-w-2xl">
          <Marca mostrar={d.mostrarMarca} />
          <div className="mt-6 rounded-[calc(var(--fr)*1.7)] border border-[#e6ddc9] bg-white p-6 shadow-[0_30px_80px_-35px_rgba(11,43,33,0.4)] @2xl:p-10">
            {exito ? (
              <Exito exito={exito} claseTitulo={claseTitulo} />
            ) : (
              <>
                <h1 className={cn(claseTitulo, "text-3xl leading-tight @2xl:text-4xl")}>{cfg.titulo}</h1>
                {cfg.descripcion && <p className="mt-3" style={{ color: "var(--fm-suave)" }}>{cfg.descripcion}</p>}
                <div className="my-7 h-px" style={{ background: "linear-gradient(90deg, var(--ac), transparent)" }} />
                <form
                  noValidate
                  className="space-y-7"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void enviar();
                  }}
                >
                  <Rejilla campos={planos} valores={valores} errores={errores} poner={poner} claseTitulo={claseTitulo} />
                  {pie}
                  {botonEnviar}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── 2 · Por pasos ── */
  if (plantilla === "pasos") {
    const total = pasos.length + 1; // el último paso es el resumen
    const enResumen = paso >= pasos.length;
    const actual = pasos[Math.min(paso, pasos.length - 1)];
    const avanzar = () => {
      const e = validarLista(actual?.campos ?? []);
      if (Object.keys(e).length > 0) {
        setErrores((prev) => ({ ...prev, ...e }));
        return;
      }
      setAtras(false);
      setPaso((p) => Math.min(p + 1, total - 1));
      contenedor.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const retroceder = () => {
      setAtras(true);
      setPaso((p) => Math.max(0, p - 1));
    };
    const etapas = [...pasos.map((p, i) => p.titulo || `Paso ${i + 1}`), "Resumen"];

    return (
      <div className={cn("fm bg-[#f6f3ec] px-4 py-10 @2xl:py-16", alto)} style={vars}>
        <div ref={contenedor} className="mx-auto max-w-2xl">
          <Marca mostrar={d.mostrarMarca} />
          <div className="mt-6 overflow-hidden rounded-[calc(var(--fr)*1.7)] border border-[#e6ddc9] bg-white shadow-[0_30px_80px_-35px_rgba(11,43,33,0.4)]">
            {exito ? (
              <div className="p-6 @2xl:p-10">
                <Exito exito={exito} claseTitulo={claseTitulo} />
              </div>
            ) : (
              <>
                <div className="border-b border-[#e6ddc9] bg-[#fdfcf9] px-6 py-5 @2xl:px-10">
                  <h1 className={cn(claseTitulo, "text-2xl @2xl:text-3xl")}>{cfg.titulo}</h1>
                  <ol className="mt-5 flex items-center gap-2" aria-label="Progreso">
                    {etapas.map((nombre, i) => {
                      const hecho = i < paso;
                      const activo = i === paso;
                      return (
                        <li key={`${nombre}-${i}`} className="flex flex-1 items-center gap-2 last:flex-none">
                          <span
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors"
                            style={{
                              background: hecho || activo ? "var(--ac)" : "#ece6d6",
                              color: hecho || activo ? "var(--ac-t)" : "#5c6470",
                            }}
                          >
                            {hecho ? <Check size={14} /> : i + 1}
                          </span>
                          <span className={cn("hidden text-xs @2xl:block", activo ? "font-semibold text-[#1a1a1a]" : "text-[#5c6470]")}>{nombre}</span>
                          {i < etapas.length - 1 && (
                            <span className="h-0.5 flex-1 rounded-full transition-colors" style={{ background: hecho ? "var(--ac)" : "#ece6d6" }} />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <form
                  noValidate
                  className="p-6 @2xl:p-10"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (enResumen) void enviar();
                    else avanzar();
                  }}
                >
                  <div key={paso} className={atras ? "fm-entra-atras" : "fm-desliza"}>
                    {!enResumen ? (
                      <div className="space-y-6">
                        {actual?.titulo && <h2 className={cn(claseTitulo, "text-xl")}>{actual.titulo}</h2>}
                        <Rejilla campos={actual?.campos ?? []} valores={valores} errores={errores} poner={poner} claseTitulo={claseTitulo} />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h2 className={cn(claseTitulo, "text-xl")}>Revise su información</h2>
                        <dl className="divide-y divide-[#ece6d6] rounded-[var(--fr)] border border-[#e6ddc9]">
                          {cfg.campos
                            .filter((c) => esCampoDeDato(c) && esVisible(c, valores) && !vacio(valores[c.id]))
                            .map((c) => {
                              const v = valores[c.id];
                              const idx = pasos.findIndex((p) => p.campos.some((x) => x.id === c.id));
                              return (
                                <div key={c.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
                                  <dt className="text-[#5c6470]">{c.etiqueta}</dt>
                                  <dd className="flex items-center gap-3 text-right font-medium">
                                    <span>{Array.isArray(v) ? v.join(", ") : v === "si" ? "Sí" : v}</span>
                                    {idx >= 0 && (
                                      <button type="button" onClick={() => { setAtras(true); setPaso(idx); }} className="text-xs font-normal underline" style={{ color: "var(--ac)" }}>
                                        Editar
                                      </button>
                                    )}
                                  </dd>
                                </div>
                              );
                            })}
                        </dl>
                        {pie}
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3">
                    {paso > 0 ? (
                      <button type="button" className="fm-btn-sec" onClick={retroceder}>
                        <ArrowLeft size={16} /> Atrás
                      </button>
                    ) : (
                      <span />
                    )}
                    {enResumen ? (
                      botonEnviar
                    ) : (
                      <button type="submit" className="fm-btn">
                        Continuar <ArrowRight size={17} />
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── 3 · Portada ── */
  if (plantilla === "portada") {
    return (
      <div className={cn("fm fm-linea grid bg-[#fdfcf9] @5xl:grid-cols-[1.05fr_1fr]", alto)} style={vars}>
        <aside className="relative min-h-[280px] overflow-hidden bg-[#0a2a20] @5xl:min-h-full">
          {d.imagen && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.imagen} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#04140e]/90 via-[#04140e]/40 to-[#04140e]/20" />
          <div className="relative flex h-full min-h-[280px] flex-col justify-between p-7 text-white @2xl:p-10 @5xl:p-14">
            <Marca mostrar={d.mostrarMarca} />
            <div>
              <span className="mb-4 block h-1 w-12 rounded-full" style={{ background: "var(--ac)" }} />
              <h1 className={cn(claseTitulo, "text-4xl leading-[1.05] @2xl:text-5xl")}>{cfg.titulo}</h1>
              {cfg.descripcion && <p className="mt-4 max-w-md text-base text-white/75">{cfg.descripcion}</p>}
            </div>
          </div>
        </aside>
        <main className="flex items-center px-6 py-10 @2xl:px-12 @5xl:px-16 @5xl:py-16">
          <div className="mx-auto w-full max-w-xl">
            {exito ? (
              <Exito exito={exito} claseTitulo={claseTitulo} />
            ) : (
              <form
                noValidate
                className="space-y-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  void enviar();
                }}
              >
                <Rejilla campos={planos} valores={valores} errores={errores} poner={poner} claseTitulo={claseTitulo} />
                {pie}
                {botonEnviar}
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  /* ── 4 · Cristal oscuro ── */
  if (plantilla === "cristal") {
    return (
      <div className={cn("fm fm-oscuro relative isolate overflow-hidden bg-[#061a13] px-4 py-10 @2xl:py-16", alto)} style={vars}>
        <div aria-hidden className="fm-orbe absolute -left-24 -top-24 -z-10 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: "var(--ac)" }} />
        <div aria-hidden className="fm-orbe absolute -bottom-32 -right-20 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#2f8a63] opacity-30 blur-3xl [animation-delay:-6s]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

        <div className="mx-auto max-w-2xl">
          <Marca mostrar={d.mostrarMarca} />
          <div className="mt-6 rounded-[calc(var(--fr)*1.8)] border border-white/15 bg-white/[0.06] p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl @2xl:p-10">
            {exito ? (
              <Exito exito={exito} claseTitulo={claseTitulo} />
            ) : (
              <>
                <h1 className={cn(claseTitulo, "text-3xl leading-tight @2xl:text-4xl")}>{cfg.titulo}</h1>
                {cfg.descripcion && <p className="mt-3" style={{ color: "var(--fm-suave)" }}>{cfg.descripcion}</p>}
                <div className="my-7 h-px" style={{ background: "linear-gradient(90deg, var(--ac), transparent)" }} />
                <form
                  noValidate
                  className="space-y-7"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void enviar();
                  }}
                >
                  <Rejilla campos={planos} valores={valores} errores={errores} poner={poner} claseTitulo={claseTitulo} />
                  {pie}
                  {botonEnviar}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── 5 · Conversacional ── */
  const total = diapositivas.length + 2; // portada + preguntas + envío
  const esPortada = paso === 0;
  const esFin = paso >= total - 1;
  const campo = !esPortada && !esFin ? diapositivas[paso - 1] : null;

  const siguiente = () => {
    if (campo && esCampoDeDato(campo)) {
      const m = validarCampo(campo, valores[campo.id]);
      if (m) {
        setErrores((prev) => ({ ...prev, [campo.id]: m }));
        return;
      }
    }
    setAtras(false);
    setPaso((p) => Math.min(p + 1, total - 1));
  };
  /** Avanza sin validar: se usa justo después de elegir una opción (la respuesta ya es válida). */
  const saltar = () => {
    setAtras(false);
    setPaso((p) => Math.min(p + 1, total - 1));
  };
  const anterior = () => {
    setAtras(true);
    setPaso((p) => Math.max(0, p - 1));
  };

  const alTeclear = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const objetivo = e.target as HTMLElement;
    const escribiendo = objetivo.tagName === "TEXTAREA";
    if (e.key === "Enter" && !e.shiftKey && (!escribiendo || e.metaKey || e.ctrlKey) && objetivo.tagName !== "BUTTON") {
      e.preventDefault();
      if (esFin) void enviar();
      else siguiente();
      return;
    }
    // Letras A, B, C… eligen opciones cuando no se está escribiendo.
    if (campo && (campo.tipo === "opciones" || campo.tipo === "casillas") && objetivo.tagName !== "INPUT" && objetivo.tagName !== "TEXTAREA") {
      const i = LETRAS.indexOf(e.key.toUpperCase());
      const o = i >= 0 ? campo.opciones?.[i] : undefined;
      if (o && e.key.length === 1) {
        e.preventDefault();
        if (campo.tipo === "opciones") {
          poner(campo.id, o.etiqueta);
          setTimeout(saltar, 260);
        } else {
          const lista = Array.isArray(valores[campo.id]) ? (valores[campo.id] as string[]) : [];
          poner(campo.id, lista.includes(o.etiqueta) ? lista.filter((x) => x !== o.etiqueta) : [...lista, o.etiqueta]);
        }
      }
    }
  };

  return (
    <div
      className={cn("fm fm-grande flex flex-col bg-[#fdfcf9]", vista ? "relative h-[640px] overflow-hidden" : "fixed inset-0 overflow-auto")}
      style={vars}
      tabIndex={-1}
      onKeyDown={alTeclear}
    >
      <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-[#ece6d6]">
        <div className="h-full transition-all duration-500" style={{ width: `${(paso / (total - 1)) * 100}%`, background: "var(--ac)" }} />
      </div>
      <div className="flex items-center justify-between px-6 pb-2 pt-6 @2xl:px-10">
        <Marca mostrar={d.mostrarMarca} />
        {!esPortada && !exito && (
          <span className="text-xs tabular-nums" style={{ color: "var(--fm-suave)" }}>
            {paso} / {total - 2}
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center px-6 py-8 @2xl:px-10">
        <div key={paso} className={cn("mx-auto w-full max-w-2xl", atras ? "fm-entra-atras" : "fm-entra")}>
          {exito ? (
            <Exito exito={exito} claseTitulo={claseTitulo} />
          ) : esPortada ? (
            <div>
              <h1 className={cn(claseTitulo, "text-4xl leading-[1.05] @2xl:text-6xl")}>{cfg.titulo}</h1>
              {cfg.descripcion && <p className="mt-5 text-lg" style={{ color: "var(--fm-suave)" }}>{cfg.descripcion}</p>}
              <button type="button" className="fm-btn mt-9" onClick={siguiente} autoFocus={!vista}>
                Comenzar <ArrowRight size={17} />
              </button>
              <p className="mt-3 text-xs" style={{ color: "var(--fm-suave)" }}>Presione Enter ↵</p>
            </div>
          ) : esFin ? (
            <form
              noValidate
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                void enviar();
              }}
            >
              <h2 className={cn(claseTitulo, "text-3xl @2xl:text-5xl")}>¡Listo para enviar!</h2>
              {pie}
              {botonEnviar}
              <p className="text-xs" style={{ color: "var(--fm-suave)" }}>Presione Enter ↵</p>
            </form>
          ) : campo && (campo.tipo === "titulo") ? (
            <div>
              <h2 className={cn(claseTitulo, "text-3xl @2xl:text-5xl")}>{campo.etiqueta}</h2>
              {campo.ayuda && <p className="mt-4 text-lg" style={{ color: "var(--fm-suave)" }}>{campo.ayuda}</p>}
              <button type="button" className="fm-btn mt-8" onClick={siguiente}>
                Continuar <ArrowRight size={17} />
              </button>
            </div>
          ) : campo ? (
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--ac)" }}>
                {paso} <ArrowRight size={14} />
              </p>
              <h2 className={cn(claseTitulo, "text-2xl leading-tight @2xl:text-4xl")}>
                {campo.etiqueta}
                {campo.requerido && <span style={{ color: "var(--ac)" }}> *</span>}
              </h2>
              {campo.ayuda && <p className="mt-2" style={{ color: "var(--fm-suave)" }}>{campo.ayuda}</p>}
              <div className="mt-7">
                <CampoUI
                  c={campo}
                  valor={valores[campo.id]}
                  onChange={(v) => poner(campo.id, v)}
                  error={errores[campo.id]}
                  sinEtiqueta
                  letras
                  alElegir={() => setTimeout(saltar, 260)}
                />
              </div>
              <button type="button" className="fm-btn mt-8" onClick={siguiente}>
                Aceptar <Check size={17} />
              </button>
              <span className="ml-3 text-xs" style={{ color: "var(--fm-suave)" }}>o presione Enter ↵</span>
            </div>
          ) : null}
        </div>
      </div>

      {!exito && !esPortada && (
        <div className="flex items-center justify-end gap-2 px-6 pb-6 @2xl:px-10">
          <button type="button" aria-label="Pregunta anterior" onClick={anterior} className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: "var(--ac)", color: "var(--ac-t)" }}>
            <ChevronUp size={18} />
          </button>
          <button type="button" aria-label="Pregunta siguiente" onClick={siguiente} disabled={esFin} className="grid h-11 w-11 place-items-center rounded-full disabled:opacity-40" style={{ background: "var(--ac)", color: "var(--ac-t)" }}>
            <ChevronDown size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

/** El formulario se adapta al ancho de su contenedor (container queries), no al de la ventana. */
export function FormularioPublico(props: { formulario: FormularioFila; cerrado?: boolean; vista?: boolean }) {
  return (
    <div className="@container">
      <FormularioInterno {...props} />
    </div>
  );
}
