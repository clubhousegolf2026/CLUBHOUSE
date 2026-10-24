"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronsRight,
  CircleDot,
  Copy,
  CreditCard,
  ExternalLink,
  Hash,
  Heading,
  Inbox,
  List,
  ListChecks,
  Loader2,
  Mail,
  Palette,
  Phone,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { alturaInput, estiloInput } from "@/components/admin/form-ui";
import { MiniaturaPlantilla } from "@/components/admin/formularios/miniaturas";
import { VistaPrevia } from "@/components/admin/formularios/vista-previa";
import { calcularCobro, pesos } from "@/lib/formularios/esquema";
import { parsePrecio, trmTexto, usd, type ViajeTarifas } from "@/lib/precios";
import type { Trm } from "@/lib/trm";
import {
  campoNuevo,
  PALETA_ACENTOS,
  PLANTILLAS,
  TIPOS_CAMPO,
  TIPOS_CON_OPCIONES,
  TIPOS_SIN_DATO,
  type CampoFormulario,
  type ConfigFormulario,
  type FormularioFila,
  type OpcionCampo,
  type Plantilla,
  type TipoCampo,
} from "@/lib/formularios/tipos";
import {
  eliminarFormulario,
  guardarFormulario,
} from "@/app/admin/(panel)/formularios/actions";

const ICONOS: Record<TipoCampo, React.ComponentType<{ size?: number; className?: string }>> = {
  texto: Type,
  email: Mail,
  telefono: Phone,
  parrafo: AlignLeft,
  numero: Hash,
  fecha: CalendarDays,
  lista: List,
  opciones: CircleDot,
  casillas: ListChecks,
  consentimiento: ShieldCheck,
  titulo: Heading,
  paso: ChevronsRight,
};

const FOTOS = ["utah", "tailandia", "alcaidesa", "dubai-creek", "chee-chan", "alpine", "the-ledges", "black-desert"];

const optsATexto = (o?: OpcionCampo[]) => (o ?? []).map((x) => (x.precio ? `${x.etiqueta} | ${x.precio}` : x.etiqueta)).join("\n");
const textoAOpts = (t: string): OpcionCampo[] =>
  t
    .split("\n")
    .map((l) => {
      const [e, p] = l.split("|");
      const precio = Number((p ?? "").replace(/\D/g, ""));
      return { etiqueta: (e ?? "").trim(), ...(precio > 0 ? { precio } : {}) };
    })
    .filter((o) => o.etiqueta);

const Etiqueta = ({ children }: { children: React.ReactNode }) => <span className="text-sm font-medium text-carbon">{children}</span>;
const Ayuda = ({ children }: { children: React.ReactNode }) => <span className="mt-1 block text-xs text-niebla">{children}</span>;

function Interruptor({ valor, onChange, titulo, ayuda }: { valor: boolean; onChange: (v: boolean) => void; titulo: string; ayuda?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-carbon">{titulo}</span>
        {ayuda && <span className="block text-xs text-niebla">{ayuda}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        onClick={() => onChange(!valor)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors", valor ? "bg-verde-golf" : "bg-arena")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", valor ? "left-[1.4rem]" : "left-0.5")} />
      </button>
    </label>
  );
}

/* ───────────── Un campo del formulario ───────────── */

function FilaCampo({
  c,
  i,
  total,
  todos,
  abierto,
  onAbrir,
  onCambiar,
  onMover,
  onDuplicar,
  onEliminar,
}: {
  c: CampoFormulario;
  i: number;
  total: number;
  todos: CampoFormulario[];
  abierto: boolean;
  onAbrir: () => void;
  onCambiar: (p: Partial<CampoFormulario>) => void;
  onMover: (d: number) => void;
  onDuplicar: () => void;
  onEliminar: () => void;
}) {
  const Icono = ICONOS[c.tipo];
  const [textoOpciones, setTextoOpciones] = useState(() => optsATexto(c.opciones));
  const esDato = !TIPOS_SIN_DATO.includes(c.tipo);
  const conOpciones = TIPOS_CON_OPCIONES.includes(c.tipo);
  const otros = todos.filter((x) => x.id !== c.id && !TIPOS_SIN_DATO.includes(x.tipo));
  const objetivo = otros.find((x) => x.id === c.condicion?.campo);
  const esEncabezado = c.tipo === "titulo" || c.tipo === "paso";

  return (
    <li className={cn("rounded-2xl border bg-white transition-colors", abierto ? "border-verde-golf/50 shadow-md" : "border-arena")}>
      <div className="flex items-center gap-2 p-2.5">
        <button type="button" onClick={onAbrir} aria-expanded={abierto} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 text-left hover:bg-arena/30">
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", esEncabezado ? "bg-champagne/20 text-[#8a6d1f]" : "bg-verde-golf/10 text-verde-golf")}>
            <Icono size={17} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-carbon">{c.etiqueta || "(sin título)"}</span>
            <span className="flex flex-wrap items-center gap-x-2 text-[11px] text-niebla">
              {TIPOS_CAMPO.find((t) => t.id === c.tipo)?.etiqueta}
              {c.requerido && <span className="text-alerta">· obligatorio</span>}
              {c.mapeo && <span className="text-verde-golf">· va al CRM</span>}
              {c.condicion?.campo && <span>· condicional</span>}
              {c.ancho === "mitad" && esDato && <span>· media columna</span>}
            </span>
          </span>
          <ChevronDown size={16} className={cn("ml-auto shrink-0 text-niebla transition-transform", abierto && "rotate-180")} />
        </button>
        <span className="flex shrink-0 items-center">
          <button type="button" onClick={() => onMover(-1)} disabled={i === 0} aria-label="Subir" className="grid h-8 w-8 place-items-center rounded-lg text-niebla hover:bg-arena/50 disabled:opacity-30"><ArrowUp size={14} /></button>
          <button type="button" onClick={() => onMover(1)} disabled={i === total - 1} aria-label="Bajar" className="grid h-8 w-8 place-items-center rounded-lg text-niebla hover:bg-arena/50 disabled:opacity-30"><ArrowDown size={14} /></button>
          <button type="button" onClick={onDuplicar} aria-label="Duplicar" className="grid h-8 w-8 place-items-center rounded-lg text-niebla hover:bg-arena/50"><Copy size={13} /></button>
          <button type="button" onClick={onEliminar} aria-label="Eliminar" className="grid h-8 w-8 place-items-center rounded-lg text-error hover:bg-error/10"><Trash2 size={14} /></button>
        </span>
      </div>

      {abierto && (
        <div className="space-y-4 border-t border-arena p-4">
          <label className="block">
            <Etiqueta>{c.tipo === "titulo" ? "Título" : c.tipo === "paso" ? "Nombre del paso" : "Pregunta o etiqueta"}</Etiqueta>
            <input value={c.etiqueta} onChange={(e) => onCambiar({ etiqueta: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
          </label>

          {(c.tipo === "titulo" || esDato) && (
            <label className="block">
              <Etiqueta>{c.tipo === "titulo" ? "Texto de apoyo" : "Ayuda bajo el campo"}</Etiqueta>
              <input value={c.ayuda ?? ""} onChange={(e) => onCambiar({ ayuda: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
            </label>
          )}

          {["texto", "email", "telefono", "parrafo", "lista", "numero"].includes(c.tipo) && (
            <label className="block">
              <Etiqueta>Texto de ejemplo (placeholder)</Etiqueta>
              <input value={c.placeholder ?? ""} onChange={(e) => onCambiar({ placeholder: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
            </label>
          )}

          {conOpciones && (
            <label className="block">
              <Etiqueta>Opciones (una por línea)</Etiqueta>
              <textarea
                rows={5}
                value={textoOpciones}
                onChange={(e) => {
                  setTextoOpciones(e.target.value);
                  onCambiar({ opciones: textoAOpts(e.target.value) });
                }}
                className={cn(estiloInput, "mt-1.5 py-3 font-mono text-[13px]")}
                placeholder={"Habitación doble\nHabitación sencilla | 450000"}
              />
              <Ayuda>Para sumar un valor al pago, escribe «|» y el precio en pesos: <code>Habitación sencilla | 450000</code></Ayuda>
            </label>
          )}

          {c.tipo === "numero" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <Etiqueta>Mínimo</Etiqueta>
                  <input type="number" value={c.min ?? ""} onChange={(e) => onCambiar({ min: e.target.value === "" ? null : Number(e.target.value) })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
                </label>
                <label className="block">
                  <Etiqueta>Máximo</Etiqueta>
                  <input type="number" value={c.max ?? ""} onChange={(e) => onCambiar({ max: e.target.value === "" ? null : Number(e.target.value) })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
                </label>
              </div>
              <Interruptor valor={Boolean(c.personas)} onChange={(v) => onCambiar({ personas: v })} titulo="Es el número de personas" ayuda="El pago base se multiplica por este número." />
            </div>
          )}

          {["texto", "email", "telefono"].includes(c.tipo) && (
            <label className="block">
              <Etiqueta>Dato del CRM</Etiqueta>
              <select
                value={c.mapeo ?? ""}
                onChange={(e) => onCambiar({ mapeo: (e.target.value || null) as CampoFormulario["mapeo"] })}
                className={cn(estiloInput, alturaInput, "mt-1.5")}
              >
                <option value="">Solo guardar la respuesta</option>
                <option value="nombre">Nombre del contacto</option>
                <option value="email">Correo del contacto</option>
                <option value="telefono">Teléfono del contacto</option>
              </select>
              <Ayuda>El correo es obligatorio para crear el lead en el CRM.</Ayuda>
            </label>
          )}

          {esDato && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Interruptor valor={Boolean(c.requerido)} onChange={(v) => onCambiar({ requerido: v })} titulo="Obligatorio" />
              {c.tipo !== "consentimiento" && (
                <label className="block">
                  <Etiqueta>Ancho</Etiqueta>
                  <select value={c.ancho ?? "completo"} onChange={(e) => onCambiar({ ancho: e.target.value as "completo" | "mitad" })} className={cn(estiloInput, alturaInput, "mt-1.5")}>
                    <option value="completo">Ancho completo</option>
                    <option value="mitad">Media columna</option>
                  </select>
                </label>
              )}
            </div>
          )}

          {c.tipo !== "paso" && otros.length > 0 && (
            <div className="rounded-xl bg-crema/60 p-3">
              <Etiqueta>Mostrar solo si…</Etiqueta>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <select
                  value={c.condicion?.campo ?? ""}
                  onChange={(e) => onCambiar({ condicion: e.target.value ? { campo: e.target.value, valor: "" } : null })}
                  className={cn(estiloInput, "h-10")}
                >
                  <option value="">Siempre visible</option>
                  {otros.map((o) => (
                    <option key={o.id} value={o.id}>{o.etiqueta || "(sin título)"}</option>
                  ))}
                </select>
                {c.condicion?.campo &&
                  (objetivo && (objetivo.opciones ?? []).length > 0 ? (
                    <select value={c.condicion.valor} onChange={(e) => onCambiar({ condicion: { campo: c.condicion!.campo, valor: e.target.value } })} className={cn(estiloInput, "h-10")}>
                      <option value="">es…</option>
                      {(objetivo.opciones ?? []).map((o) => (
                        <option key={o.etiqueta} value={o.etiqueta}>{o.etiqueta}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={c.condicion.valor}
                      placeholder="es igual a…"
                      onChange={(e) => onCambiar({ condicion: { campo: c.condicion!.campo, valor: e.target.value } })}
                      className={cn(estiloInput, "h-10")}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/* ───────────── Editor ───────────── */

type Pestana = "campos" | "diseno" | "pago" | "ajustes";

export function EditorFormulario({
  inicial,
  experiencias,
  wompiListo,
  respuestas,
  origen,
  viajes,
  trm,
}: {
  inicial: FormularioFila;
  experiencias: { slug: string; nombre: string }[];
  wompiListo: boolean;
  respuestas: number;
  origen: string;
  viajes: ViajeTarifas[];
  trm: Trm;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(inicial.nombre);
  const [slug, setSlug] = useState(inicial.slug);
  const [plantilla, setPlantilla] = useState<Plantilla>(inicial.plantilla);
  const [publicado, setPublicado] = useState(inicial.publicado);
  const [cfg, setCfg] = useState<ConfigFormulario>(inicial.config);
  const [pestana, setPestana] = useState<Pestana>("campos");
  const [abierto, setAbierto] = useState<string | null>(null);
  const [menuAgregar, setMenuAgregar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [sucio, setSucio] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [personasSim, setPersonasSim] = useState(2);
  const [pendiente, empezar] = useTransition();

  const tocar = <T,>(f: (v: T) => void) => (v: T) => {
    setGuardado(false);
    setSucio(true);
    f(v);
  };
  const act = (p: Partial<ConfigFormulario>) => {
    setGuardado(false);
    setSucio(true);
    setCfg((prev) => ({ ...prev, ...p }));
  };
  const actDiseno = (p: Partial<ConfigFormulario["diseno"]>) => act({ diseno: { ...cfg.diseno, ...p } });
  const actPago = (p: Partial<ConfigFormulario["pago"]>) => act({ pago: { ...cfg.pago, ...p } });

  const campos = cfg.campos;
  const cambiarCampo = (id: string, p: Partial<CampoFormulario>) => act({ campos: campos.map((c) => (c.id === id ? { ...c, ...p } : c)) });
  const moverCampo = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= campos.length) return;
    const copia = [...campos];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    act({ campos: copia });
  };
  const duplicarCampo = (i: number) => {
    const c = campos[i];
    const copia = { ...JSON.parse(JSON.stringify(c)), id: `c_${Math.random().toString(36).slice(2, 8)}`, mapeo: null, personas: false } as CampoFormulario;
    act({ campos: [...campos.slice(0, i + 1), copia, ...campos.slice(i + 1)] });
    setAbierto(copia.id);
  };
  const agregarCampo = (tipo: TipoCampo) => {
    const c = campoNuevo(tipo);
    act({ campos: [...campos, c] });
    setAbierto(c.id);
    setMenuAgregar(false);
  };

  /** Divide el formulario en pasos: uno por cada grupo de 3-4 campos. */
  const crearPasosAutomaticos = () => {
    const datos = campos.filter((c) => c.tipo !== "paso");
    const grupos: CampoFormulario[][] = [];
    for (let i = 0; i < datos.length; i += 4) grupos.push(datos.slice(i, i + 4));
    const nombres = ["Sus datos", "Su viaje", "Detalles", "Confirmación"];
    act({
      campos: grupos.flatMap((g, i) => [{ ...campoNuevo("paso"), etiqueta: nombres[i] ?? `Paso ${i + 1}` }, ...g]),
    });
  };

  const hayPasos = campos.some((c) => c.tipo === "paso");
  const tieneEmail = campos.some((c) => c.mapeo === "email");

  function elegirPlantilla(p: Plantilla) {
    setPlantilla(p);
    setGuardado(false);
    setSucio(true);
  }

  function guardar(nuevoPublicado = publicado) {
    setError(null);
    empezar(async () => {
      const r = await guardarFormulario(inicial.id, { nombre, slug, plantilla, publicado: nuevoPublicado, config: cfg });
      if (!r.ok) return setError(r.error);
      setPublicado(nuevoPublicado);
      setGuardado(true);
      setSucio(false);
      router.refresh();
    });
  }

  const guardarRef = useRef<() => void>(() => {});
  useEffect(() => {
    guardarRef.current = () => guardar();
  });
  useEffect(() => {
    const f = (ev: KeyboardEvent) => {
      if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        guardarRef.current();
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  useEffect(() => {
    if (!sucio) return;
    const f = (ev: BeforeUnloadEvent) => {
      ev.preventDefault();
      ev.returnValue = "";
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [sucio]);

  const formularioVista: FormularioFila = { ...inicial, nombre, slug, plantilla, publicado, config: cfg };
  const enlace = `${origen}/f/${slug}`;
  const copiar = async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 1800);
    } catch {}
  };

  // Simulador del cobro con N personas
  const campoPersonas = campos.find((c) => c.personas && c.tipo === "numero");
  const viajePago = cfg.pago.fuente === "viaje" ? viajes.find((v) => v.slug === cfg.pago.viajeSlug) : undefined;
  const tarifaPago = viajePago?.tarifas.find((t) => t.perfil === cfg.pago.viajePerfil) ?? viajePago?.tarifas[0];
  const precioViaje = tarifaPago ? parsePrecio(tarifaPago.precio) : null;
  const pagoEfectivo = {
    ...cfg.pago,
    ...(precioViaje ? { base: precioViaje.valor, moneda: precioViaje.moneda } : {}),
  };
  if (pagoEfectivo.moneda === "USD" && pagoEfectivo.trmAuto) pagoEfectivo.tasaUsd = trm.valor;
  const simulado = calcularCobro({ ...cfg, pago: pagoEfectivo }, campoPersonas ? { [campoPersonas.id]: String(personasSim) } : {});

  const pestanas: { id: Pestana; etiqueta: string; icono: React.ComponentType<{ size?: number }> }[] = [
    { id: "campos", etiqueta: "Campos", icono: List },
    { id: "diseno", etiqueta: "Diseño", icono: Palette },
    { id: "pago", etiqueta: "Pago", icono: CreditCard },
    { id: "ajustes", etiqueta: "Ajustes", icono: Settings2 },
  ];

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/formularios" className="text-sm text-niebla hover:text-carbon">← Formularios</Link>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", publicado ? "bg-exito/10 text-exito" : "bg-arena text-niebla")}>{publicado ? "Publicado" : "Borrador"}</span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <Link href={`/admin/formularios/${inicial.id}/respuestas`} className="inline-flex items-center gap-1.5 rounded-xl border border-arena bg-white px-3.5 py-2 text-sm text-carbon hover:border-verde-golf/50">
            <Inbox size={15} /> Respuestas <strong className="tabular-nums">{respuestas}</strong>
          </Link>
          {publicado && (
            <a href={`/f/${slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-arena bg-white px-3.5 py-2 text-sm text-carbon hover:border-verde-golf/50">
              <ExternalLink size={14} /> Abrir
            </a>
          )}
          <button
            type="button"
            onClick={() => guardar(!publicado)}
            disabled={pendiente}
            className="rounded-xl border border-verde-golf/40 bg-white px-3.5 py-2 text-sm font-medium text-verde-golf hover:bg-verde-golf/5 disabled:opacity-60"
          >
            {publicado ? "Pasar a borrador" : "Publicar"}
          </button>
          <button
            type="button"
            onClick={() => guardar()}
            disabled={pendiente}
            className="inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle disabled:opacity-60"
          >
            {pendiente ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar
          </button>
        </span>
      </div>
      <input
        value={nombre}
        onChange={(e) => tocar(setNombre)(e.target.value)}
        aria-label="Nombre del formulario"
        className="w-full border-0 border-b border-transparent bg-transparent font-serif text-3xl text-carbon outline-none transition hover:border-arena focus:border-verde-golf"
      />

      {error && <p role="alert" className="rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">{error}</p>}
      {guardado && !error && <p role="status" className="rounded-xl border border-exito/30 bg-exito/10 px-4 py-2.5 text-sm text-exito">Guardado.{publicado ? " Ya está publicado." : ""}</p>}
      {sucio && !pendiente && !guardado && <p className="text-xs text-niebla">Tienes cambios sin guardar · Ctrl/⌘ + S para guardar.</p>}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        {/* Columna de edición */}
        <div className="space-y-4">
          <div role="tablist" className="flex gap-1 rounded-2xl bg-arena/30 p-1.5">
            {pestanas.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={pestana === p.id}
                type="button"
                onClick={() => setPestana(p.id)}
                className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition", pestana === p.id ? "bg-white text-carbon shadow" : "text-niebla hover:text-carbon")}
              >
                <p.icono size={15} /> <span className="hidden sm:inline">{p.etiqueta}</span>
              </button>
            ))}
          </div>

          {/* ── Campos ── */}
          {pestana === "campos" && (
            <div className="space-y-3">
              {!tieneEmail && (
                <p className="rounded-xl border border-alerta/30 bg-alerta/10 px-4 py-2.5 text-sm text-alerta">
                  Falta un campo de <strong>correo</strong> marcado como «Correo del contacto»: sin él no se puede crear el lead ni publicar.
                </p>
              )}
              {plantilla === "pasos" && !hayPasos && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-champagne/50 bg-champagne/10 px-4 py-3 text-sm">
                  <span className="text-carbon">Esta plantilla divide el formulario en pasos con los campos «Salto de paso».</span>
                  <button type="button" onClick={crearPasosAutomaticos} className="rounded-lg bg-verde-golf px-3 py-1.5 text-xs font-semibold text-crema">Crear pasos automáticamente</button>
                </div>
              )}
              <ul className="space-y-2">
                {campos.map((c, i) => (
                  <FilaCampo
                    key={c.id}
                    c={c}
                    i={i}
                    total={campos.length}
                    todos={campos}
                    abierto={abierto === c.id}
                    onAbrir={() => setAbierto(abierto === c.id ? null : c.id)}
                    onCambiar={(p) => cambiarCampo(c.id, p)}
                    onMover={(d) => moverCampo(i, d)}
                    onDuplicar={() => duplicarCampo(i)}
                    onEliminar={() => {
                      if (window.confirm(`¿Eliminar «${c.etiqueta || "este campo"}»?`)) act({ campos: campos.filter((x) => x.id !== c.id) });
                    }}
                  />
                ))}
              </ul>
              <div className="relative">
                <button type="button" onClick={() => setMenuAgregar((v) => !v)} className="inline-flex items-center gap-2 rounded-xl border border-verde-golf/40 px-4 py-2.5 text-sm font-medium text-verde-golf hover:bg-verde-golf/5">
                  {menuAgregar ? <X size={15} /> : <Plus size={15} />} Agregar campo
                </button>
                {menuAgregar && (
                  <div className="mt-3 grid gap-2 rounded-2xl border border-arena bg-white p-3 shadow-lg sm:grid-cols-2 lg:grid-cols-3">
                    {TIPOS_CAMPO.map((t) => {
                      const I = ICONOS[t.id];
                      return (
                        <button key={t.id} type="button" onClick={() => agregarCampo(t.id)} className="flex items-center gap-3 rounded-xl border border-arena p-2.5 text-left transition hover:border-verde-golf/50 hover:bg-verde-golf/[0.04]">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-verde-golf/10 text-verde-golf"><I size={16} /></span>
                          <span>
                            <span className="block text-sm font-medium text-carbon">{t.etiqueta}</span>
                            <span className="block text-[11px] text-niebla">{t.ayuda}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Diseño ── */}
          {pestana === "diseno" && (
            <div className="space-y-6">
              <section className="space-y-3 rounded-2xl border border-arena bg-blanco-roto p-5">
                <h3 className="font-serif text-lg text-carbon">Plantilla</h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {PLANTILLAS.map((p) => (
                    <button key={p.id} type="button" onClick={() => elegirPlantilla(p.id)} aria-pressed={plantilla === p.id} className={cn("overflow-hidden rounded-2xl border-2 bg-white text-left transition hover:-translate-y-0.5", plantilla === p.id ? "border-verde-golf shadow-lg" : "border-arena")}>
                      <div className="aspect-[16/10] border-b border-arena"><MiniaturaPlantilla plantilla={p.id} acento={cfg.diseno.acento} /></div>
                      <div className="p-2.5">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-carbon">{plantilla === p.id && <Check size={13} className="text-verde-golf" />} {p.nombre}</p>
                        <p className="text-[11px] leading-snug text-niebla">{p.descripcion}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-arena bg-blanco-roto p-5">
                <h3 className="font-serif text-lg text-carbon">Estilo</h3>
                <div>
                  <Etiqueta>Color de acento</Etiqueta>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {PALETA_ACENTOS.map((c) => (
                      <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={cfg.diseno.acento === c} onClick={() => actDiseno({ acento: c })} className={cn("h-8 w-8 rounded-full ring-offset-2 transition", cfg.diseno.acento === c ? "ring-2 ring-carbon" : "hover:scale-110")} style={{ background: c }} />
                    ))}
                    <input type="color" value={cfg.diseno.acento} onChange={(e) => actDiseno({ acento: e.target.value })} aria-label="Color personalizado" className="h-8 w-10 cursor-pointer rounded border border-arena bg-white p-0.5" />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Etiqueta>Esquinas</Etiqueta>
                    <div className="mt-2 inline-flex rounded-xl border border-arena bg-white p-1">
                      {(["recto", "suave", "redondo"] as const).map((r) => (
                        <button key={r} type="button" onClick={() => actDiseno({ radio: r })} className={cn("rounded-lg px-3.5 py-1.5 text-sm capitalize", cfg.diseno.radio === r ? "bg-verde-golf text-crema" : "text-niebla")}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Etiqueta>Tipo de letra de los títulos</Etiqueta>
                    <div className="mt-2 inline-flex rounded-xl border border-arena bg-white p-1">
                      {(["serif", "sans"] as const).map((f) => (
                        <button key={f} type="button" onClick={() => actDiseno({ fuente: f })} className={cn("rounded-lg px-3.5 py-1.5 text-sm", cfg.diseno.fuente === f ? "bg-verde-golf text-crema" : "text-niebla")}>{f === "serif" ? "Elegante (serif)" : "Moderna (sans)"}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <Interruptor valor={cfg.diseno.mostrarMarca} onChange={(v) => actDiseno({ mostrarMarca: v })} titulo="Mostrar la marca Clubhouse" />
                {plantilla === "portada" && (
                  <div>
                    <Etiqueta>Foto de portada</Etiqueta>
                    <input value={cfg.diseno.imagen} onChange={(e) => actDiseno({ imagen: e.target.value })} placeholder="/fotos/utah.webp o https://…" className={cn(estiloInput, alturaInput, "mt-1.5")} />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {FOTOS.map((f) => (
                        <button key={f} type="button" onClick={() => actDiseno({ imagen: `/fotos/${f}.webp` })} className={cn("h-12 w-16 overflow-hidden rounded-lg border-2", cfg.diseno.imagen === `/fotos/${f}.webp` ? "border-verde-golf" : "border-arena")}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/fotos/${f}.webp`} alt={f} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="space-y-4 rounded-2xl border border-arena bg-blanco-roto p-5">
                <h3 className="font-serif text-lg text-carbon">Textos</h3>
                <label className="block"><Etiqueta>Título</Etiqueta><input value={cfg.titulo} onChange={(e) => act({ titulo: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
                <label className="block"><Etiqueta>Descripción</Etiqueta><textarea rows={2} value={cfg.descripcion} onChange={(e) => act({ descripcion: e.target.value })} className={cn(estiloInput, "mt-1.5 py-3")} /></label>
                <label className="block"><Etiqueta>Texto del botón</Etiqueta><input value={cfg.boton} onChange={(e) => act({ boton: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} /></label>
                <div className="space-y-3 rounded-xl bg-crema/60 p-4">
                  <p className="text-sm font-medium text-carbon">Cuando envían el formulario</p>
                  <input value={cfg.exito.titulo} onChange={(e) => act({ exito: { ...cfg.exito, titulo: e.target.value } })} placeholder="Título de agradecimiento" className={cn(estiloInput, "h-10")} />
                  <textarea rows={2} value={cfg.exito.texto} onChange={(e) => act({ exito: { ...cfg.exito, texto: e.target.value } })} placeholder="Mensaje" className={cn(estiloInput, "py-2.5")} />
                  <input value={cfg.exito.redireccion} onChange={(e) => act({ exito: { ...cfg.exito, redireccion: e.target.value } })} placeholder="Redirigir a (opcional): https://…" className={cn(estiloInput, "h-10")} />
                  <Ayuda>Si el formulario cobra, la persona va directo al pago y vuelve a una página de resultado.</Ayuda>
                </div>
              </section>
            </div>
          )}

          {/* ── Pago ── */}
          {pestana === "pago" && (
            <div className="space-y-5">
              <section className="space-y-4 rounded-2xl border border-arena bg-blanco-roto p-5">
                <Interruptor valor={cfg.pago.activo} onChange={(v) => actPago({ activo: v })} titulo="Cobrar con Wompi al inscribirse" ayuda="Tarjetas, PSE, Nequi, Bancolombia y más. Tras enviar, la persona pasa al pago seguro." />
                {cfg.pago.activo && !wompiListo && (
                  <p className="rounded-xl border border-alerta/30 bg-alerta/10 px-4 py-2.5 text-sm text-alerta">
                    Wompi todavía no está conectado en el servidor. Mira <Link href="/admin/pagos" className="font-semibold underline">Pagos</Link> para añadir las llaves.
                  </p>
                )}
              </section>

              {cfg.pago.activo && (
                <>
                  <section className="space-y-5 rounded-2xl border border-arena bg-blanco-roto p-5">
                    <label className="block">
                      <Etiqueta>Concepto del cobro</Etiqueta>
                      <input value={cfg.pago.concepto} onChange={(e) => actPago({ concepto: e.target.value })} placeholder="Inscripción Utah Experience" className={cn(estiloInput, alturaInput, "mt-1.5")} />
                      <Ayuda>Es lo que verá la persona en el resumen y en Wompi.</Ayuda>
                    </label>

                    <div>
                      <Etiqueta>¿De dónde sale el precio?</Etiqueta>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {(
                          [
                            ["viaje", "Del precio de un viaje", "Se toma de la tarifa del viaje y siempre está al día."],
                            ["fijo", "Un valor fijo", "Lo escribes tú, en pesos o en dólares."],
                          ] as const
                        ).map(([id, titulo, ayuda]) => (
                          <button
                            key={id}
                            type="button"
                            disabled={id === "viaje" && viajes.length === 0}
                            onClick={() => actPago({ fuente: id, ...(id === "viaje" && !cfg.pago.viajeSlug ? { viajeSlug: viajes[0]?.slug ?? "", viajePerfil: viajes[0]?.tarifas[0]?.perfil ?? "" } : {}) })}
                            aria-pressed={cfg.pago.fuente === id}
                            className={cn("rounded-xl border-2 p-3 text-left transition disabled:opacity-40", cfg.pago.fuente === id ? "border-verde-golf bg-verde-golf/[0.05]" : "border-arena bg-white hover:border-verde-golf/40")}
                          >
                            <span className="block text-sm font-semibold text-carbon">{titulo}</span>
                            <span className="block text-xs text-niebla">{ayuda}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {cfg.pago.fuente === "viaje" ? (
                      <div className="space-y-3">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <Etiqueta>Viaje (plan)</Etiqueta>
                            <select
                              value={cfg.pago.viajeSlug}
                              onChange={(e) => actPago({ viajeSlug: e.target.value, viajePerfil: viajes.find((v) => v.slug === e.target.value)?.tarifas[0]?.perfil ?? "" })}
                              className={cn(estiloInput, alturaInput, "mt-1.5")}
                            >
                              {viajes.map((v) => <option key={v.slug} value={v.slug}>{v.nombre}</option>)}
                            </select>
                          </label>
                          <label className="block">
                            <Etiqueta>Tarifa</Etiqueta>
                            <select value={cfg.pago.viajePerfil} onChange={(e) => actPago({ viajePerfil: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")}>
                              {(viajePago?.tarifas ?? []).map((t, i) => <option key={`${t.perfil}-${i}`} value={t.perfil}>{t.perfil}{t.detalle ? ` · ${t.detalle}` : ""} · {t.precio}</option>)}
                            </select>
                          </label>
                        </div>
                        <p className="rounded-xl bg-crema/60 px-3.5 py-2.5 text-xs text-niebla">
                          Precio actual: <strong className="text-carbon">{tarifaPago?.precio ?? "—"}</strong> {tarifaPago?.unidad ? `(${tarifaPago.unidad})` : ""}. Si cambias la tarifa del viaje en Experiencias, el cobro de este formulario se actualiza solo.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <Etiqueta>Moneda de la tarifa</Etiqueta>
                          <select value={cfg.pago.moneda} onChange={(e) => actPago({ moneda: e.target.value as "COP" | "USD" })} className={cn(estiloInput, alturaInput, "mt-1.5")}>
                            <option value="COP">Pesos (COP)</option>
                            <option value="USD">Dólares (USD)</option>
                          </select>
                        </label>
                        <label className="block">
                          <Etiqueta>Tarifa base {campoPersonas ? "por persona" : "total"}</Etiqueta>
                          <input type="number" min={0} value={cfg.pago.base || ""} onChange={(e) => actPago({ base: Number(e.target.value) })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
                        </label>
                      </div>
                    )}

                    {(pagoEfectivo.moneda === "USD") && (
                      <div className="space-y-3 rounded-xl border border-champagne/40 bg-champagne/[0.08] p-4">
                        <Interruptor valor={cfg.pago.trmAuto} onChange={(v) => actPago({ trmAuto: v })} titulo="Convertir a pesos con la TRM del día" ayuda="Cada inscripción se cobra con el dólar vigente ese día (Superfinanciera)." />
                        {cfg.pago.trmAuto ? (
                          <p className="text-sm text-carbon">
                            TRM de hoy: <strong className="tabular-nums">{trmTexto(trm.valor)}</strong> <span className="text-xs text-niebla">· rige desde el {trm.fecha}</span>
                          </p>
                        ) : (
                          <label className="block">
                            <Etiqueta>Pesos por dólar (fijo)</Etiqueta>
                            <input type="number" min={0} value={cfg.pago.tasaUsd || ""} onChange={(e) => actPago({ tasaUsd: Number(e.target.value) })} className={cn(estiloInput, alturaInput, "mt-1.5 sm:max-w-xs")} />
                          </label>
                        )}
                      </div>
                    )}

                    <label className="block">
                      <Etiqueta>Cobrar solo un anticipo (%)</Etiqueta>
                      <input type="number" min={1} max={99} placeholder="Vacío = cobrar el total" value={cfg.pago.anticipoPct ?? ""} onChange={(e) => actPago({ anticipoPct: e.target.value === "" ? null : Number(e.target.value) })} className={cn(estiloInput, alturaInput, "mt-1.5 sm:max-w-xs")} />
                    </label>
                    <p className="text-xs text-niebla">
                      El total = tarifa{campoPersonas ? " × número de personas" : ""} + los precios de las opciones elegidas.
                      {!campoPersonas && " Para multiplicar por personas, marca un campo numérico como «Es el número de personas»."}
                    </p>
                  </section>

                  <section className="space-y-3 rounded-2xl border border-champagne/40 bg-champagne/[0.08] p-5">
                    <h3 className="font-serif text-lg text-carbon">Simulador</h3>
                    {campoPersonas && (
                      <label className="flex items-center gap-3 text-sm">
                        Personas
                        <input type="number" min={1} max={99} value={personasSim} onChange={(e) => setPersonasSim(Math.max(1, Number(e.target.value) || 1))} className={cn(estiloInput, "h-10 w-24")} />
                      </label>
                    )}
                    <dl className="text-sm">
                      {pagoEfectivo.moneda === "USD" && (
                        <div className="mb-1 flex justify-between text-xs"><dt className="text-niebla">{usd(pagoEfectivo.base)} × {campoPersonas ? personasSim : 1} × {trmTexto(pagoEfectivo.tasaUsd)}</dt><dd className="text-niebla">en pesos</dd></div>
                      )}
                      <div className="flex justify-between"><dt className="text-niebla">Total</dt><dd className="font-medium text-carbon">{pesos(simulado.totalCop)}</dd></div>
                      <div className="mt-1 flex justify-between"><dt className="text-niebla">Se cobra ahora</dt><dd className="font-serif text-xl text-verde-golf">{pesos(simulado.cobrarCop)}</dd></div>
                    </dl>
                    {simulado.cobrarCop < 1500 && <p className="text-xs text-alerta">El valor mínimo que acepta Wompi es $1.500 COP: con menos no se activa el cobro.</p>}
                  </section>
                </>
              )}
            </div>
          )}

          {/* ── Ajustes ── */}
          {pestana === "ajustes" && (
            <div className="space-y-5">
              <section className="space-y-4 rounded-2xl border border-arena bg-blanco-roto p-5">
                <label className="block">
                  <Etiqueta>Dirección del formulario</Etiqueta>
                  <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-arena bg-white">
                    <span className="hidden shrink-0 bg-arena/40 px-3 py-3 text-sm text-niebla sm:block">{origen.replace(/^https?:\/\//, "")}/f/</span>
                    <input value={slug} onChange={(e) => tocar(setSlug)(e.target.value)} className="h-11 w-full bg-transparent px-3 text-sm outline-none" />
                  </div>
                </label>
                {publicado ? (
                  <div className="space-y-3 rounded-xl bg-crema/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded-lg border border-arena bg-white px-3 py-2 text-xs">{enlace}</code>
                      <button type="button" onClick={() => copiar(enlace, "enlace")} className="inline-flex items-center gap-1.5 rounded-lg border border-arena bg-white px-3 py-2 text-xs font-medium hover:border-verde-golf/50">
                        {copiado === "enlace" ? <Check size={13} className="text-exito" /> : <Copy size={13} />} Copiar enlace
                      </button>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-carbon">Incrustar en otra página</p>
                      <pre className="mt-1 overflow-x-auto rounded-lg bg-carbon p-3 text-[11px] text-crema">{`<iframe src="${enlace}" style="width:100%;height:900px;border:0" title="${nombre}"></iframe>`}</pre>
                      <button type="button" onClick={() => copiar(`<iframe src="${enlace}" style="width:100%;height:900px;border:0" title="${nombre}"></iframe>`, "iframe")} className="mt-1.5 text-xs text-verde-golf underline">
                        {copiado === "iframe" ? "Copiado" : "Copiar código"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-niebla">Publica el formulario para obtener su enlace y el código para incrustarlo.</p>
                )}
              </section>

              <section className="space-y-4 rounded-2xl border border-arena bg-blanco-roto p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <Etiqueta>Cupos máximos</Etiqueta>
                    <input type="number" min={1} placeholder="Sin límite" value={cfg.cupos ?? ""} onChange={(e) => act({ cupos: e.target.value === "" ? null : Number(e.target.value) })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
                    <Ayuda>Al llegar al número, el formulario deja de aceptar inscripciones.</Ayuda>
                  </label>
                  <label className="block">
                    <Etiqueta>Cierra el</Etiqueta>
                    <input type="date" value={cfg.cierre} onChange={(e) => act({ cierre: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")} />
                    <Ayuda>Vacío = sin fecha límite.</Ayuda>
                  </label>
                </div>
                <label className="block">
                  <Etiqueta>Viaje relacionado</Etiqueta>
                  <select value={cfg.experiencia} onChange={(e) => act({ experiencia: e.target.value })} className={cn(estiloInput, alturaInput, "mt-1.5")}>
                    <option value="">Ninguno</option>
                    {experiencias.map((x) => <option key={x.slug} value={x.slug}>{x.nombre}</option>)}
                  </select>
                </label>
                <label className="block">
                  <Etiqueta>Etiquetas que se ponen al lead en el CRM</Etiqueta>
                  <input value={cfg.etiquetas.join(", ")} onChange={(e) => act({ etiquetas: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} placeholder="Utah, grupo 2027" className={cn(estiloInput, alturaInput, "mt-1.5")} />
                  <Ayuda>Separadas por comas. Además se añade <code>form:{slug}</code> automáticamente.</Ayuda>
                </label>
              </section>

              <section className="rounded-2xl border border-error/20 bg-error/[0.04] p-5">
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`¿Eliminar «${nombre}» y todas sus respuestas? No se puede deshacer.`)) return;
                    empezar(async () => {
                      const r = await eliminarFormulario(inicial.id);
                      if (r.ok) router.push("/admin/formularios");
                      else setError(r.error);
                    });
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-error hover:underline"
                >
                  <Trash2 size={14} /> Eliminar este formulario
                </button>
              </section>
            </div>
          )}
        </div>

        {/* Vista previa */}
        <aside className="xl:sticky xl:top-6">
          <VistaPrevia formulario={formularioVista} />
        </aside>
      </div>
    </div>
  );
}
