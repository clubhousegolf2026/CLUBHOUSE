"use client";

import { createContext, useContext, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BedDouble,
  Check,
  ChevronDown,
  CalendarRange,
  FileText,
  Flag,
  Globe,
  ImageIcon,
  MapPin,
  Rocket,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import {
  AreaTexto,
  BarraGuardar,
  Campo,
  Entrada,
  Interruptor,
  Selector,
  Seccion as SeccionFija,
} from "@/components/admin/form-ui";
import { MapaMundoPicker, type CiudadMapa } from "@/components/admin/mapa-mundo-picker";
import { CampoFoto, GaleriaFotos, Lineas, Lista } from "@/components/admin/experiencias/piezas";
import { CosteoEditor } from "@/components/admin/experiencias/costeo-editor";
import {
  AccionesExperiencia,
  ChecklistPublicacion,
  HistorialVersiones,
  type ItemChecklist,
} from "@/components/admin/experiencias/herramientas";
import { calcular, type CostosExperiencia } from "@/lib/contenido/costeo";
import { eliminarExperiencia, guardarCostos, guardarExperiencia } from "@/app/admin/(panel)/experiencias/actions";
import {
  escribirFechas,
  leerFechas,
  nochesEntre,
  textoDuracion,
} from "@/lib/contenido/fechas-viaje";
import type { EstadoSalida, Experiencia } from "@/lib/contenido/experiencias";

const ESTADOS_SALIDA: { id: EstadoSalida; etiqueta: string }[] = [
  { id: "abierta", etiqueta: "Abierta" },
  { id: "ultimos", etiqueta: "Últimos cupos" },
  { id: "llena", etiqueta: "Llena" },
  { id: "cerrada", etiqueta: "Cerrada" },
];

const POLITICAS_SUGERIDAS = [
  "Pagos y anticipo",
  "Cancelación y cambios",
  "Documentos y visas",
  "Seguro de viaje",
  "Qué llevar",
];

const idCorto = () => Math.random().toString(36).slice(2, 8);

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIA_MS = 86_400_000;

/** "2027-03-08" → "Lun 8 mar". */
function etiquetaDia(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${DIAS_SEMANA[d.getUTCDay()]} ${d.getUTCDate()} ${MESES_CORTOS[d.getUTCMonth()]}`;
}

const LISTAS_OBLIGATORIAS = ["claves", "cifras", "programa", "rondas", "alojamiento", "masAllaDelGolf", "tarifas", "incluye", "noIncluye"] as const;

/** Mezcla datos importados o de una versión anterior sin romper el editor
 *  (conserva la dirección web y completa las listas que falten). */
function fusionar(prev: Experiencia, datos: Partial<Experiencia>): Experiencia {
  const salida: Experiencia = {
    ...prev,
    ...datos,
    slug: prev.slug,
    publicada: prev.publicada,
    destacada: prev.destacada,
    orden: prev.orden,
    coordenadas: Array.isArray(datos.coordenadas) ? datos.coordenadas : prev.coordenadas,
  };
  for (const k of LISTAS_OBLIGATORIAS) {
    if (!Array.isArray(salida[k])) (salida as unknown as Record<string, unknown>)[k] = prev[k];
  }
  return salida;
}

const TITULOS_SECCIONES = [
  "Información general",
  "Ubicación en el globo",
  "Fechas y salidas",
  "Costos y precio al público",
  "Precios y tarifas",
  "Programa día a día",
  "Campos de golf",
  "Alojamiento",
  "Destacados y más allá del golf",
  "Qué incluye y qué no",
  "Fotos",
  "Políticas y condiciones",
  "Preguntas frecuentes",
  "SEO y buscadores",
];

type NivelSeccion = "completa" | "parcial" | "vacia";

const AcordeonCtx = createContext<{
  abiertas: Set<string>;
  alternar: (titulo: string) => void;
  resumenes: Record<string, string>;
  niveles: Record<string, NivelSeccion>;
} | null>(null);

const ESTILO_NIVEL: Record<NivelSeccion, { tarjeta: string; icono: string; etiqueta: string; texto: string }> = {
  completa: {
    tarjeta: "border-exito/40 bg-exito/[0.07]",
    icono: "bg-exito text-white",
    etiqueta: "Completa",
    texto: "text-exito",
  },
  parcial: {
    tarjeta: "border-champagne/70 bg-champagne/[0.12]",
    icono: "bg-champagne/30 text-[#8a6d1f]",
    etiqueta: "Falta completar",
    texto: "text-[#8a6d1f]",
  },
  vacia: {
    tarjeta: "border-arena bg-blanco-roto",
    icono: "bg-verde-golf/10 text-verde-golf",
    etiqueta: "Sin empezar",
    texto: "text-niebla",
  },
};

/** Sección plegable: el contenido se monta la primera vez que se abre y luego
 *  solo se oculta, para no perder lo que se haya escrito ni recargar el mapa. */
function Seccion({
  icono,
  titulo,
  descripcion,
  children,
}: {
  icono?: React.ReactNode;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(AcordeonCtx)!;
  const abierta = ctx.abiertas.has(titulo);
  const montada = useRef(abierta);
  if (abierta) montada.current = true;
  const nivel = ctx.niveles[titulo] ?? "vacia";
  const estilo = ESTILO_NIVEL[nivel];

  return (
    <section data-seccion={titulo} className={`scroll-mt-6 overflow-hidden rounded-[var(--radius-panel)] border shadow-[var(--shadow-suave)] transition-colors ${estilo.tarjeta}`}>
      <button
        type="button"
        onClick={() => ctx.alternar(titulo)}
        aria-expanded={abierta}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-black/[0.02] sm:p-5"
      >
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${estilo.icono}`}>
          {nivel === "completa" ? <Check size={18} /> : icono}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-lg leading-tight text-carbon">{titulo}</span>
          {ctx.resumenes[titulo] && <span className="mt-0.5 block truncate text-sm text-niebla">{ctx.resumenes[titulo]}</span>}
        </span>
        <span className={`hidden shrink-0 text-xs font-medium sm:block ${estilo.texto}`}>{estilo.etiqueta}</span>
        <ChevronDown size={20} className={`shrink-0 text-niebla transition-transform duration-200 ${abierta ? "rotate-180" : ""}`} />
      </button>
      {montada.current && (
        <div hidden={!abierta} className="space-y-4 border-t border-arena p-5 sm:p-6">
          {descripcion && <p className="-mt-1 text-sm text-niebla">{descripcion}</p>}
          {children}
        </div>
      )}
    </section>
  );
}


export function ExperienciaEditor({
  inicial,
  esNueva,
  enBase,
  esDelCodigo,
  ciudades,
  costosIniciales,
}: {
  inicial: Experiencia;
  esNueva: boolean;
  enBase: boolean;
  esDelCodigo: boolean;
  ciudades: CiudadMapa[];
  costosIniciales: CostosExperiencia;
}) {
  const router = useRouter();
  const [costos, setCostos] = useState<CostosExperiencia>(costosIniciales);
  const [ubicacionTocada, setUbicacionTocada] = useState(!esNueva);
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set());
  const alternar = (titulo: string) =>
    setAbiertas((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(titulo)) nuevo.delete(titulo);
      else nuevo.add(titulo);
      return nuevo;
    });
  const [e, setE] = useState<Experiencia>(inicial);
  const [pendiente, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [{ inicio, fin }, setRango] = useState(() => leerFechas(inicial.fechas));
  const [sucio, setSucio] = useState(false);
  const [borrador, setBorrador] = useState<{ e: Experiencia; costos: CostosExperiencia; t: number } | null>(null);
  const claveBorrador = `exp-borrador:${inicial.slug || "nueva"}`;

  const act = (parche: Partial<Experiencia>) => {
    setGuardado(false);
    setSucio(true);
    setE((prev) => ({ ...prev, ...parche }));
  };
  const texto =
    (campo: keyof Experiencia) =>
    (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      act({ [campo]: ev.target.value } as Partial<Experiencia>);

  const lng = e.coordenadas[0];
  const lat = e.coordenadas[1];
  const rangoInvalido = Boolean(inicio && fin && fin < inicio);
  const galeria = e.galeria ?? [];
  const salidas = e.salidas ?? [];
  const politicas = e.politicas ?? [];
  const faq = e.faq ?? [];
  const carpeta = `experiencias/${e.slug || "nueva"}`;

  const lineasLlenas = (a: string[]) => a.filter((x) => x.trim()).length;
  const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
  const resumenes: Record<string, string> = {
    "Información general": [e.nombre || "Sin nombre", e.pais].filter(Boolean).join(" · "),
    "Ubicación en el globo": `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
    "Fechas y salidas": [e.fechas || "Sin fechas", salidas.length ? plural(salidas.length, "salida", "salidas") : ""].filter(Boolean).join(" · "),
    "Costos y precio al público": costos.costeos.length ? plural(costos.costeos.length, "hoja de costos", "hojas de costos") : "Sin costos todavía",
    "Precios y tarifas": [e.desde ? `Desde ${e.desde}` : "Sin precio", plural(e.tarifas.length, "tarifa", "tarifas")].join(" · "),
    "Programa día a día": plural(e.programa.length, "día", "días"),
    "Campos de golf": plural(e.rondas.length, "campo", "campos"),
    "Alojamiento": plural(e.alojamiento.length, "alojamiento", "alojamientos"),
    "Destacados y más allá del golf": `${plural(e.claves.length, "destacado", "destacados")} · ${plural(e.cifras.length, "cifra", "cifras")} · ${plural(e.masAllaDelGolf.length, "actividad", "actividades")}`,
    "Qué incluye y qué no": `${lineasLlenas(e.incluye)} incluye · ${lineasLlenas(e.noIncluye)} no incluye`,
    "Fotos": plural((e.foto ? 1 : 0) + (e.fotoSecundaria ? 1 : 0) + galeria.length, "foto", "fotos"),
    "Políticas y condiciones": plural(politicas.length, "política", "políticas"),
    "Preguntas frecuentes": plural(faq.length, "pregunta", "preguntas"),
    "SEO y buscadores": e.seoTitulo?.trim() || "Usa el nombre del viaje",
  };

  const lleno = (t: string | undefined) => Boolean(t && t.trim());
  const nivelDe = (listo: boolean[], algo: boolean): NivelSeccion =>
    listo.every(Boolean) ? "completa" : algo || listo.some(Boolean) ? "parcial" : "vacia";
  const niveles: Record<string, NivelSeccion> = {
    "Información general": nivelDe(
      [lleno(e.nombre), lleno(e.pais), lleno(e.subtitulo), lleno(e.resumen), lleno(e.titularLargo), lleno(e.descripcionLarga)],
      false,
    ),
    "Ubicación en el globo": ubicacionTocada && (lat !== 0 || lng !== 0) ? "completa" : "vacia",
    "Fechas y salidas": nivelDe([lleno(e.fechas), lleno(e.duracion)], false),
    "Costos y precio al público": costos.costeos.some((c) => calcular(c).valido)
      ? "completa"
      : costos.costeos.length > 0
        ? "parcial"
        : "vacia",
    "Precios y tarifas": nivelDe(
      [lleno(e.desde), e.tarifas.length > 0, e.tarifas.every((t) => lleno(t.perfil) && lleno(t.precio))],
      e.tarifas.length > 0,
    ),
    "Programa día a día": nivelDe([e.programa.length > 0, e.programa.every((d) => lleno(d.titulo))], e.programa.length > 0),
    "Campos de golf": nivelDe(
      [e.rondas.length > 0, e.rondas.every((r) => lleno(r.nombre) && lleno(r.descripcion))],
      e.rondas.length > 0,
    ),
    "Alojamiento": nivelDe([e.alojamiento.length > 0, e.alojamiento.every((a) => lleno(a.nombre))], e.alojamiento.length > 0),
    "Destacados y más allá del golf": nivelDe(
      [e.claves.length > 0, e.cifras.length > 0, e.masAllaDelGolf.length > 0],
      false,
    ),
    "Qué incluye y qué no": nivelDe([lineasLlenas(e.incluye) > 0, lineasLlenas(e.noIncluye) > 0], false),
    "Fotos": nivelDe([lleno(e.foto), lleno(e.fotoSecundaria)], galeria.length > 0),
    "Políticas y condiciones": nivelDe(
      [politicas.length > 0, politicas.every((p) => lleno(p.titulo) && lleno(p.texto))],
      politicas.length > 0,
    ),
    "Preguntas frecuentes": nivelDe([faq.length > 0, faq.every((f) => lleno(f.q) && lleno(f.a))], faq.length > 0),
    "SEO y buscadores": nivelDe([lleno(e.seoTitulo), lleno(e.seoDescripcion)], false),
  };
  const completas = Object.values(niveles).filter((n) => n === "completa").length;

  function cambiarRango(nuevo: { inicio: string; fin: string }) {
    setRango(nuevo);
    if (!nuevo.inicio || !nuevo.fin || nuevo.fin < nuevo.inicio) return;
    const noches = nochesEntre(nuevo.inicio, nuevo.fin);
    act({
      fechas: escribirFechas(nuevo.inicio, nuevo.fin),
      ...(noches > 0 ? { duracion: textoDuracion(noches) } : {}),
    });
  }

  function usarTarifaMasBaja() {
    const conPrecio = e.tarifas
      .map((t) => ({ t, n: Number(t.precio.replace(/\D/g, "")) }))
      .filter((x) => x.n > 0);
    if (conPrecio.length === 0) return;
    const menor = conPrecio.reduce((a, b) => (b.n < a.n ? b : a));
    act({ desde: menor.t.precio });
  }

  const totalDias = inicio && fin && !rangoInvalido ? nochesEntre(inicio, fin) + 1 : 0;

  /** Un día del programa por cada fecha del viaje que todavía no tenga el suyo. */
  function generarDias() {
    if (totalDias <= 0) return;
    const dias = [...e.programa];
    for (let i = dias.length; i < totalDias; i++) {
      const f = new Date(Date.parse(`${inicio}T12:00:00Z`) + i * DIA_MS).toISOString().slice(0, 10);
      dias.push({ fecha: etiquetaDia(f), titulo: "", detalle: [""] });
    }
    act({ programa: dias });
  }

  function agregarSalidaPrincipal() {
    act({
      salidas: [
        ...salidas,
        { id: idCorto(), inicio, fin, cupos: e.grupo?.max ?? null, estado: "abierta" as EstadoSalida, nota: "" },
      ],
    });
  }

  const checklist: ItemChecklist[] = [
    { ok: lleno(e.nombre) && lleno(e.pais), etiqueta: "Nombre y país", seccion: "Información general" },
    { ok: lleno(e.resumen), etiqueta: "Resumen para las tarjetas", seccion: "Información general" },
    { ok: ubicacionTocada && (lat !== 0 || lng !== 0), etiqueta: "Ubicación en el globo", seccion: "Ubicación en el globo" },
    { ok: lleno(e.fechas) && lleno(e.duracion), etiqueta: "Fechas y duración", seccion: "Fechas y salidas" },
    { ok: lleno(e.desde), etiqueta: "Precio «desde»", seccion: "Precios y tarifas" },
    { ok: e.tarifas.length > 0, etiqueta: "Al menos una tarifa", seccion: "Precios y tarifas" },
    { ok: e.programa.length > 0, etiqueta: "Programa día a día", seccion: "Programa día a día" },
    { ok: e.rondas.length > 0, etiqueta: "Campos de golf", seccion: "Campos de golf" },
    { ok: lineasLlenas(e.incluye) > 0, etiqueta: "Qué incluye", seccion: "Qué incluye y qué no" },
    { ok: lleno(e.foto), etiqueta: "Foto de portada", seccion: "Fotos" },
  ];

  function irA(titulo: string) {
    setAbiertas((prev) => new Set(prev).add(titulo));
    setTimeout(
      () => document.querySelector(`[data-seccion="${titulo}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60,
    );
  }

  /** Carga en el editor datos de un archivo o de una versión anterior (sin guardar). */
  function cargarDatos(datos: Partial<Experiencia>) {
    const nueva = fusionar(e, datos);
    setE(nueva);
    setRango(leerFechas(nueva.fechas));
    setUbicacionTocada(true);
    setGuardado(false);
    setSucio(true);
  }

  function guardar() {
    setError(null);
    start(async () => {
      const r = await guardarExperiencia(e, esNueva);
      if (!r.ok) return setError(r.error);
      // Las hojas de costeo van aparte (tabla privada). Si no hay ninguna y
      // nunca se creó una, no hace falta tocar la tabla.
      if (costos.costeos.length > 0 || costosIniciales.costeos.length > 0) {
        const rc = await guardarCostos(r.slug, costos);
        if (!rc.ok) return setError(`La experiencia se guardó, pero los costos no: ${rc.error}`);
      }
      setSucio(false);
      try {
        localStorage.removeItem(claveBorrador);
      } catch {}
      if (esNueva) router.push(`/admin/experiencias/${r.slug}`);
      else {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  function eliminar() {
    const aviso = esDelCodigo
      ? "Esto borra tus cambios en Supabase y la experiencia vuelve a su contenido original. ¿Continuar?"
      : `¿Eliminar «${e.nombre}»? Esta acción no se puede deshacer.`;
    if (!confirm(aviso)) return;
    start(async () => {
      const r = await eliminarExperiencia(e.slug);
      if (!r.ok) return setError(r.error);
      if (esDelCodigo) router.refresh();
      else router.push("/admin/experiencias");
    });
  }

  const guardarRef = useRef<() => void>(() => {});
  useEffect(() => {
    guardarRef.current = guardar;
  });

  // Atajo Ctrl/⌘ + S para guardar.
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

  // Avisa antes de salir con cambios sin guardar.
  useEffect(() => {
    if (!sucio) return;
    const f = (ev: BeforeUnloadEvent) => {
      ev.preventDefault();
      ev.returnValue = "";
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [sucio]);

  // Borrador automático en este navegador: se guarda mientras escribes.
  useEffect(() => {
    if (!sucio) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(claveBorrador, JSON.stringify({ e, costos, t: Date.now() }));
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [sucio, e, costos, claveBorrador]);

  // Al abrir, ofrece recuperar un borrador que no llegó a guardarse.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(claveBorrador);
      if (!raw) return;
      const b = JSON.parse(raw) as { e: Experiencia; costos: CostosExperiencia; t: number };
      if (b?.e && JSON.stringify(b.e) !== JSON.stringify(inicial)) setBorrador(b);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AcordeonCtx.Provider value={{ abiertas, alternar, resumenes, niveles }}>
    <div className="max-w-6xl space-y-5">
      {borrador && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-champagne/60 bg-champagne/15 px-4 py-3 text-sm text-carbon">
          <p>
            Hay un borrador sin guardar de{" "}
            <strong>{new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(borrador.t))}</strong>
            . ¿Quieres recuperarlo?
          </p>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setE(borrador.e);
                setCostos(borrador.costos);
                setRango(leerFechas(borrador.e.fechas));
                setUbicacionTocada(true);
                setSucio(true);
                setBorrador(null);
              }}
              className="rounded-lg bg-verde-golf px-3 py-1.5 text-xs font-semibold text-crema hover:bg-verde-calle"
            >
              Recuperar
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(claveBorrador);
                } catch {}
                setBorrador(null);
              }}
              className="rounded-lg border border-arena bg-white px-3 py-1.5 text-xs text-carbon hover:border-error/50"
            >
              Descartar
            </button>
          </span>
        </div>
      )}
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-arena bg-blanco-roto p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="font-medium text-carbon">
                {completas} de {TITULOS_SECCIONES.length} secciones completas
              </p>
              <p className="hidden items-center gap-3 text-xs text-niebla sm:flex">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-exito" /> Completa</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-champagne" /> Falta completar</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-arena" /> Sin empezar</span>
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-arena/60">
              <div className="h-full rounded-full bg-exito transition-all duration-500" style={{ width: `${(completas / TITULOS_SECCIONES.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-niebla">Abre cada sección para editarla.</p>
            <span className="flex items-center gap-4 text-sm">
              <button type="button" onClick={() => setAbiertas(new Set(TITULOS_SECCIONES))} className="text-verde-golf hover:underline">
                Expandir todo
              </button>
              <button type="button" onClick={() => setAbiertas(new Set())} className="text-niebla hover:underline">
                Contraer todo
              </button>
            </span>
          </div>
          <Seccion icono={<FileText size={18} />} titulo="Información general" descripcion="Lo que lee el viajero en las tarjetas y en la página del viaje.">
            <Campo label="Nombre del viaje *">
              <Entrada value={e.nombre} placeholder="Utah Experience" onChange={texto("nombre")} />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Subtítulo (ciudades o sedes)">
                <Entrada value={e.subtitulo} onChange={texto("subtitulo")} placeholder="St. George & Black Desert" />
              </Campo>
              <Campo label="País *">
                <Entrada value={e.pais} onChange={texto("pais")} placeholder="Estados Unidos" />
              </Campo>
              <Campo label="Bandera (emoji)" ayuda="Pega el emoji de la bandera, p. ej. 🇺🇸 🇹🇭 🇪🇸.">
                <Entrada value={e.bandera} onChange={texto("bandera")} placeholder="🇺🇸" />
              </Campo>
            </div>
            <Campo label="Resumen" ayuda="Dos frases para las tarjetas y el globo.">
              <AreaTexto rows={2} value={e.resumen} onChange={texto("resumen")} />
            </Campo>
            <Campo label="Titular de la página">
              <Entrada value={e.titularLargo} onChange={texto("titularLargo")} placeholder="Golf entre rocas rojas y desierto volcánico" />
            </Campo>
            <Campo label="Descripción de la página">
              <AreaTexto rows={4} value={e.descripcionLarga} onChange={texto("descripcionLarga")} />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nivel de juego recomendado" ayuda="Ej. Handicap hasta 28, todos los niveles.">
                <Entrada value={e.nivel ?? ""} onChange={texto("nivel")} />
              </Campo>
              <Campo label="Idiomas del acompañamiento">
                <Entrada value={e.idiomas ?? ""} onChange={texto("idiomas")} placeholder="Español" />
              </Campo>
            </div>
          </Seccion>

          <Seccion
            icono={<MapPin size={18} />}
            titulo="Ubicación en el globo"
            descripcion="Haz clic en el mapa donde se ofrece el viaje: ahí queda su banderín en el globo del inicio."
          >
            <MapaMundoPicker
              lat={lat}
              lng={lng}
              nombre={e.nombre}
              ciudades={ciudades}
              onCambiar={(a, o) => {
                setUbicacionTocada(true);
                act({ coordenadas: [o, a] });
              }}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Latitud">
                <Entrada type="number" step="0.001" value={lat} onChange={(ev) => {
                    setUbicacionTocada(true);
                    act({ coordenadas: [lng, Number(ev.target.value)] });
                  }} />
              </Campo>
              <Campo label="Longitud">
                <Entrada type="number" step="0.001" value={lng} onChange={(ev) => {
                    setUbicacionTocada(true);
                    act({ coordenadas: [Number(ev.target.value), lat] });
                  }} />
              </Campo>
            </div>
            <p className="text-xs text-niebla">Acerca con + / − y arrastra el mapa para ubicar el punto con precisión.</p>
          </Seccion>

          <Seccion icono={<CalendarRange size={18} />} titulo="Fechas y salidas" descripcion="La fecha principal del viaje y, si hay varias, cada salida con sus cupos.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Inicio">
                <Entrada type="date" value={inicio} onChange={(ev) => cambiarRango({ inicio: ev.target.value, fin })} />
              </Campo>
              <Campo label="Fin">
                <Entrada type="date" min={inicio || undefined} value={fin} onChange={(ev) => cambiarRango({ inicio, fin: ev.target.value })} />
              </Campo>
            </div>
            {rangoInvalido ? (
              <p className="text-xs text-error">La fecha de fin no puede ser anterior a la de inicio.</p>
            ) : (
              <p className="text-xs text-niebla">
                En el sitio se ve como: <strong className="text-carbon">{e.fechas || "—"}</strong> · {e.duracion || "—"}
              </p>
            )}
            <Campo label="Duración" ayuda="Se calcula sola con las fechas. Formato «N noches / M días»: de ahí salen las noches de las tarjetas y los filtros.">
              <Entrada value={e.duracion} onChange={texto("duracion")} placeholder="8 noches / 9 días" />
            </Campo>

            <div className="border-t border-arena pt-4">
              <h3 className="font-serif text-base text-carbon">Salidas</h3>
              <p className="mb-3 text-sm text-niebla">Opcional. Úsalo si el mismo viaje sale en varias fechas.</p>
              {totalDias > 0 && !salidas.some((s) => s.inicio === inicio && s.fin === fin) && (
                <button type="button" onClick={agregarSalidaPrincipal} className="mb-3 inline-flex items-center gap-2 rounded-xl border border-champagne/60 bg-champagne/10 px-4 py-2 text-sm font-medium text-[#8a6d1f] hover:bg-champagne/20">
                  Agregar las fechas principales como salida
                </button>
              )}
              <Lista
                items={salidas}
                onChange={(s) => act({ salidas: s })}
                nuevo={() => ({ id: idCorto(), inicio: "", fin: "", cupos: null, estado: "abierta" as EstadoSalida, nota: "" })}
                agregar="Agregar salida"
                vacio="Sin salidas adicionales."
              >
                {(s, set) => (
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Campo label="Inicio"><Entrada type="date" value={s.inicio} onChange={(ev) => set({ inicio: ev.target.value })} /></Campo>
                    <Campo label="Fin"><Entrada type="date" min={s.inicio || undefined} value={s.fin} onChange={(ev) => set({ fin: ev.target.value })} /></Campo>
                    <Campo label="Cupos">
                      <Entrada type="number" min={0} value={s.cupos ?? ""} onChange={(ev) => set({ cupos: ev.target.value === "" ? null : Number(ev.target.value) })} />
                    </Campo>
                    <Campo label="Estado">
                      <Selector value={s.estado} onChange={(ev) => set({ estado: ev.target.value as EstadoSalida })}>
                        {ESTADOS_SALIDA.map((x) => (
                          <option key={x.id} value={x.id}>{x.etiqueta}</option>
                        ))}
                      </Selector>
                    </Campo>
                    <Campo label="Nota" className="sm:col-span-4">
                      <Entrada value={s.nota ?? ""} onChange={(ev) => set({ nota: ev.target.value })} placeholder="Ej. Grupo cerrado de 8 golfistas" />
                    </Campo>
                  </div>
                )}
              </Lista>
            </div>
          </Seccion>

          <Seccion icono={<Wallet size={18} />} titulo="Precios y tarifas" descripcion="El precio «desde» sale en tarjetas y filtros; las tarifas, en la página del viaje.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo label="Precio «desde»" ayuda="Con la moneda: «USD 3.580».">
                <Entrada value={e.desde} onChange={texto("desde")} placeholder="USD 3.580" />
              </Campo>
              <div className="flex items-end">
                <button type="button" onClick={usarTarifaMasBaja} className="h-11 rounded-xl border border-verde-golf/40 px-4 text-sm font-medium text-verde-golf hover:bg-verde-golf/5">
                  Usar la tarifa más baja
                </button>
              </div>
              <Campo label="Anticipo para reservar (%)">
                <Entrada
                  type="number"
                  min={0}
                  max={100}
                  sufijo="%"
                  value={e.anticipoPct ?? ""}
                  onChange={(ev) => act({ anticipoPct: ev.target.value === "" ? null : Number(ev.target.value) })}
                />
              </Campo>
            </div>
            <Lista
              items={e.tarifas}
              onChange={(t) => act({ tarifas: t })}
              nuevo={() => ({ perfil: "", detalle: "", precio: "", unidad: "por persona", incluye: [""], destacada: false })}
              agregar="Agregar tarifa"
              vacio="Aún no hay tarifas."
            >
              {(t, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Perfil"><Entrada value={t.perfil} onChange={(ev) => set({ perfil: ev.target.value })} placeholder="Golfista" /></Campo>
                  <Campo label="Detalle"><Entrada value={t.detalle} onChange={(ev) => set({ detalle: ev.target.value })} placeholder="Habitación doble" /></Campo>
                  <Campo label="Precio"><Entrada value={t.precio} onChange={(ev) => set({ precio: ev.target.value })} placeholder="USD 3.580" /></Campo>
                  <Campo label="Unidad"><Entrada value={t.unidad} onChange={(ev) => set({ unidad: ev.target.value })} placeholder="por persona" /></Campo>
                  <Campo label="Qué incluye (una por línea)" className="sm:col-span-2">
                    <Lineas valor={t.incluye} onChange={(v) => set({ incluye: v })} filas={3} />
                  </Campo>
                  <div className="sm:col-span-2">
                    <Interruptor checked={Boolean(t.destacada)} onChange={(v) => set({ destacada: v })} titulo="Tarifa destacada" descripcion="Se resalta en la página del viaje." />
                  </div>
                </div>
              )}
            </Lista>
          </Seccion>

          <Seccion
            icono={<Wallet size={18} />}
            titulo="Costos y precio al público"
            descripcion="Carga lo que te cuesta el viaje, define cuánto quieres ganar y el sistema calcula el precio. Solo lo ve el equipo."
          >
            <CosteoEditor
              costos={costos}
              onChange={(c) => {
                setGuardado(false);
                setSucio(true);
                setCostos(c);
              }}
              tarifas={e.tarifas}
              onAplicarPrecio={(i, texto) => act({ tarifas: e.tarifas.map((t, j) => (j === i ? { ...t, precio: texto } : t)) })}
              onUsarDesde={(texto) => act({ desde: texto })}
            />
          </Seccion>

          <Seccion icono={<CalendarRange size={18} />} titulo="Programa día a día" descripcion="El itinerario que ve el viajero.">
            {totalDias > e.programa.length && (
              <button type="button" onClick={generarDias} className="inline-flex items-center gap-2 rounded-xl border border-champagne/60 bg-champagne/10 px-4 py-2 text-sm font-medium text-[#8a6d1f] hover:bg-champagne/20">
                Crear los días a partir de las fechas del viaje ({totalDias - e.programa.length} por crear)
              </button>
            )}
            <Lista
              items={e.programa}
              onChange={(p) => act({ programa: p })}
              nuevo={() => ({ fecha: "", titulo: "", detalle: [""] })}
              agregar="Agregar día"
              vacio="Aún no hay días en el programa."
            >
              {(d, set) => (
                <div className="grid gap-3 sm:grid-cols-3">
                  <Campo label="Día o fecha"><Entrada value={d.fecha} onChange={(ev) => set({ fecha: ev.target.value })} placeholder="Lun 8 mar" /></Campo>
                  <Campo label="Título" className="sm:col-span-2"><Entrada value={d.titulo} onChange={(ev) => set({ titulo: ev.target.value })} placeholder="Llegada" /></Campo>
                  <Campo label="Actividades (una por línea)" className="sm:col-span-3">
                    <Lineas valor={d.detalle} onChange={(v) => set({ detalle: v })} filas={3} />
                  </Campo>
                </div>
              )}
            </Lista>
          </Seccion>

          <Seccion icono={<Flag size={18} />} titulo="Campos de golf" descripcion="Cada ronda del viaje, con su foto y sus datos.">
            <Lista
              items={e.rondas}
              onChange={(r) => act({ rondas: r })}
              nuevo={() => ({ nombre: "", lugar: "", descripcion: "", datos: [""], foto: "" })}
              agregar="Agregar campo"
              vacio="Aún no hay campos."
            >
              {(r, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Nombre del campo"><Entrada value={r.nombre} onChange={(ev) => set({ nombre: ev.target.value })} placeholder="The Ledges" /></Campo>
                  <Campo label="Ronda y lugar"><Entrada value={r.lugar} onChange={(ev) => set({ lugar: ev.target.value })} placeholder="Ronda 1 · St. George" /></Campo>
                  <Campo label="Descripción" className="sm:col-span-2"><AreaTexto rows={3} value={r.descripcion} onChange={(ev) => set({ descripcion: ev.target.value })} /></Campo>
                  <Campo label="Datos (uno por línea)" ayuda="Par 72 · 7.100 yd · diseñador y año" className="sm:col-span-2">
                    <Lineas valor={r.datos} onChange={(v) => set({ datos: v })} filas={3} />
                  </Campo>
                  <div className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-carbon">Foto del campo</span>
                    <CampoFoto url={r.foto} onChange={(u) => set({ foto: u })} carpeta={`${carpeta}/campos`} alt={r.nombre} />
                  </div>
                </div>
              )}
            </Lista>
          </Seccion>

          <Seccion icono={<BedDouble size={18} />} titulo="Alojamiento" descripcion="Dónde se hospedan, por periodo.">
            <Lista
              items={e.alojamiento}
              onChange={(a) => act({ alojamiento: a })}
              nuevo={() => ({ periodo: "", nombre: "", descripcion: "" })}
              agregar="Agregar alojamiento"
              vacio="Aún no hay alojamientos."
            >
              {(a, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Periodo"><Entrada value={a.periodo} onChange={(ev) => set({ periodo: ev.target.value })} placeholder="8 – 12 mar · 4 noches · Bangkok" /></Campo>
                  <Campo label="Hotel o casa"><Entrada value={a.nombre} onChange={(ev) => set({ nombre: ev.target.value })} /></Campo>
                  <Campo label="Descripción" className="sm:col-span-2"><AreaTexto rows={2} value={a.descripcion} onChange={(ev) => set({ descripcion: ev.target.value })} /></Campo>
                </div>
              )}
            </Lista>
          </Seccion>

          <Seccion icono={<Users size={18} />} titulo="Destacados y más allá del golf" descripcion="Lo que hace especial al viaje y lo que se hace fuera del campo.">
            <h3 className="font-serif text-base text-carbon">Puntos destacados</h3>
            <Lista
              items={e.claves}
              onChange={(c) => act({ claves: c })}
              nuevo={() => ({ titulo: "", texto: "" })}
              agregar="Agregar destacado"
              vacio="Sin destacados."
            >
              {(c, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Título"><Entrada value={c.titulo} onChange={(ev) => set({ titulo: ev.target.value })} /></Campo>
                  <Campo label="Texto"><Entrada value={c.texto} onChange={(ev) => set({ texto: ev.target.value })} /></Campo>
                </div>
              )}
            </Lista>
            <h3 className="pt-2 font-serif text-base text-carbon">Cifras</h3>
            <Lista
              items={e.cifras}
              onChange={(c) => act({ cifras: c })}
              nuevo={() => ({ valor: "", etiqueta: "" })}
              agregar="Agregar cifra"
              vacio="Sin cifras."
            >
              {(c, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Número o dato"><Entrada value={c.valor} onChange={(ev) => set({ valor: ev.target.value })} placeholder="4" /></Campo>
                  <Campo label="Etiqueta"><Entrada value={c.etiqueta} onChange={(ev) => set({ etiqueta: ev.target.value })} placeholder="rondas" /></Campo>
                </div>
              )}
            </Lista>
            <h3 className="pt-2 font-serif text-base text-carbon">Más allá del golf</h3>
            <Lista
              items={e.masAllaDelGolf}
              onChange={(m) => act({ masAllaDelGolf: m })}
              nuevo={() => ({ titulo: "", texto: "" })}
              agregar="Agregar actividad"
              vacio="Sin actividades."
            >
              {(m, set) => (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Actividad"><Entrada value={m.titulo} onChange={(ev) => set({ titulo: ev.target.value })} /></Campo>
                  <Campo label="Descripción corta"><Entrada value={m.texto} onChange={(ev) => set({ texto: ev.target.value })} /></Campo>
                </div>
              )}
            </Lista>
          </Seccion>

          <Seccion icono={<Check size={18} />} titulo="Qué incluye y qué no" descripcion="Una línea por elemento.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Incluye">
                <Lineas valor={e.incluye} onChange={(v) => act({ incluye: v })} filas={8} />
              </Campo>
              <Campo label="No incluye">
                <Lineas valor={e.noIncluye} onChange={(v) => act({ noIncluye: v })} filas={8} />
              </Campo>
            </div>
          </Seccion>

          <Seccion icono={<ImageIcon size={18} />} titulo="Fotos" descripcion="La portada se ve en tarjetas, globo y cabecera de la página.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-sm font-medium text-carbon">Foto de portada</span>
                <CampoFoto url={e.foto} onChange={(u) => act({ foto: u })} carpeta={carpeta} alt={e.fotoAlt || e.nombre} />
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-carbon">Foto secundaria</span>
                <CampoFoto url={e.fotoSecundaria} onChange={(u) => act({ fotoSecundaria: u })} carpeta={carpeta} alt={e.nombre} />
              </div>
            </div>
            <Campo label="Descripción de la portada" ayuda="Para accesibilidad y buscadores.">
              <Entrada value={e.fotoAlt} onChange={texto("fotoAlt")} placeholder="Campo de golf entre montañas de roca roja" />
            </Campo>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-carbon">Galería</span>
              <GaleriaFotos fotos={galeria} onChange={(f) => act({ galeria: f })} carpeta={`${carpeta}/galeria`} />
            </div>
          </Seccion>

          <Seccion icono={<Tag size={18} />} titulo="Políticas y condiciones" descripcion="Lo que toda agencia aclara antes de vender: pagos, cancelación, documentos.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Grupo mínimo (personas)">
                <Entrada type="number" min={1} value={e.grupo?.min ?? ""} onChange={(ev) => act({ grupo: { min: ev.target.value === "" ? null : Number(ev.target.value), max: e.grupo?.max ?? null } })} />
              </Campo>
              <Campo label="Grupo máximo (personas)">
                <Entrada type="number" min={1} value={e.grupo?.max ?? ""} onChange={(ev) => act({ grupo: { min: e.grupo?.min ?? null, max: ev.target.value === "" ? null : Number(ev.target.value) } })} />
              </Campo>
            </div>
            <div className="flex flex-wrap gap-2">
              {POLITICAS_SUGERIDAS.filter((t) => !politicas.some((p) => p.titulo === t)).map((t) => (
                <button key={t} type="button" onClick={() => act({ politicas: [...politicas, { titulo: t, texto: "" }] })} className="rounded-full border border-arena bg-white px-3.5 py-1.5 text-sm text-carbon hover:border-verde-golf/50">
                  + {t}
                </button>
              ))}
            </div>
            <Lista
              items={politicas}
              onChange={(p) => act({ politicas: p })}
              nuevo={() => ({ titulo: "", texto: "" })}
              agregar="Agregar política"
              vacio="Sin políticas todavía."
            >
              {(p, set) => (
                <div className="grid gap-3">
                  <Campo label="Título"><Entrada value={p.titulo} onChange={(ev) => set({ titulo: ev.target.value })} /></Campo>
                  <Campo label="Texto"><AreaTexto rows={3} value={p.texto} onChange={(ev) => set({ texto: ev.target.value })} /></Campo>
                </div>
              )}
            </Lista>
          </Seccion>

          <Seccion icono={<FileText size={18} />} titulo="Preguntas frecuentes" descripcion="Responde de antemano lo que más preguntan.">
            <Lista
              items={faq}
              onChange={(f) => act({ faq: f })}
              nuevo={() => ({ q: "", a: "" })}
              agregar="Agregar pregunta"
              vacio="Sin preguntas todavía."
            >
              {(f, set) => (
                <div className="grid gap-3">
                  <Campo label="Pregunta"><Entrada value={f.q} onChange={(ev) => set({ q: ev.target.value })} /></Campo>
                  <Campo label="Respuesta"><AreaTexto rows={3} value={f.a} onChange={(ev) => set({ a: ev.target.value })} /></Campo>
                </div>
              )}
            </Lista>
          </Seccion>

          <Seccion icono={<Globe size={18} />} titulo="SEO y buscadores" descripcion="Cómo aparece el viaje en Google y al compartir el enlace. Si lo dejas vacío se usan el nombre y la descripción de la página.">
            <Campo label="Título para buscadores" ayuda={`${(e.seoTitulo ?? "").length} de 60 caracteres recomendados.`}>
              <Entrada value={e.seoTitulo ?? ""} onChange={texto("seoTitulo")} placeholder={e.nombre || "Utah Experience · Golf en rocas rojas"} maxLength={90} />
            </Campo>
            <Campo label="Descripción para buscadores" ayuda={`${(e.seoDescripcion ?? "").length} de 155 caracteres recomendados.`}>
              <AreaTexto rows={3} value={e.seoDescripcion ?? ""} onChange={texto("seoDescripcion")} placeholder={e.descripcionLarga.slice(0, 155)} maxLength={200} />
            </Campo>
            <div className="rounded-xl border border-arena bg-white p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-niebla">Así se vería en Google</p>
              <p className="truncate text-xs text-[#188038]">clubhouse-lac.vercel.app › experiencias › {e.slug || "nueva"}</p>
              <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{e.seoTitulo?.trim() || e.nombre || "Título del viaje"}</p>
              <p className="line-clamp-2 text-sm text-[#4d5156]">{e.seoDescripcion?.trim() || e.descripcionLarga || "Descripción del viaje."}</p>
            </div>
          </Seccion>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <SeccionFija icono={<Rocket size={18} />} titulo="Publicación">
            <Interruptor
              checked={e.publicada !== false}
              onChange={(v) => {
                const faltan = checklist.filter((i) => !i.ok);
                if (v && faltan.length > 0 && !window.confirm(`Aún falta: ${faltan.map((i) => i.etiqueta).join(", ")}.\n\n¿Publicar de todos modos?`)) return;
                act({ publicada: v });
              }}
              titulo="Publicada"
              descripcion="Visible en el inicio, planes, globo y buscadores. Apágala para dejarla en borrador."
            />
            <div className="border-t border-arena" />
            <Interruptor
              checked={Boolean(e.destacada)}
              onChange={(v) => act({ destacada: v })}
              titulo="Destacada"
              descripcion="Aparece como «Más elegido»."
            />
            <div className="border-t border-arena" />
            <Campo label="Orden" ayuda="Menor número = aparece antes.">
              <Entrada type="number" value={e.orden ?? 0} onChange={(ev) => act({ orden: Number(ev.target.value) })} />
            </Campo>
          </SeccionFija>

          <ChecklistPublicacion items={checklist} onIr={irA} />

          <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4 text-sm">
            <p className="font-medium text-carbon">Estado</p>
            <p className={`mt-1 ${enBase ? "text-exito" : "text-alerta"}`}>
              {esNueva ? "Nueva: aún no está guardada." : enBase ? "Guardada en Supabase." : "Solo existe en el código del sitio. Pulsa «Guardar en Supabase» para moverla a la base de datos."}
            </p>
            {!esNueva && (
              <>
                <p className="mt-3 break-all text-xs text-niebla">Dirección: /experiencias/{e.slug}</p>
                <Link href={`/experiencias/${e.slug}`} target="_blank" className="mt-2 inline-block text-verde-golf hover:underline">
                  Ver en el sitio →
                </Link>
              </>
            )}
          </div>

          <AccionesExperiencia e={e} guardada={!esNueva && enBase} onImportar={cargarDatos} />
          {!esNueva && enBase && <HistorialVersiones slug={e.slug} onRestaurar={cargarDatos} />}
        </aside>
      </div>

      {sucio && !pendiente && !guardado && (
        <p className="px-1 text-xs text-niebla">Tienes cambios sin guardar · pulsa Ctrl/⌘ + S para guardar.</p>
      )}
      {guardado && (
        <p role="status" className="rounded-xl border border-exito/30 bg-exito/10 px-4 py-2.5 text-sm text-exito">
          Guardado en Supabase. Ya se ve en el sitio.
        </p>
      )}
      <BarraGuardar
        pending={pendiente}
        etiqueta={esNueva ? "Crear experiencia" : enBase ? "Guardar cambios" : "Guardar en Supabase"}
        onGuardar={guardar}
        onEliminar={enBase ? eliminar : undefined}
        error={error}
      />
    </div>
    </AcordeonCtx.Provider>
  );
}
