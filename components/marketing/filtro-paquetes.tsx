"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Moon, Flag, Wallet, Search } from "lucide-react";
import { PackageCard } from "@/components/marketing/package-card";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

const PASO_PRESUPUESTO = 500_000;

const fmtCop = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const ORDENES = [
  { id: "destacados", etiqueta: "Más elegidos" },
  { id: "precio-asc", etiqueta: "Menor precio" },
  { id: "precio-desc", etiqueta: "Mayor precio" },
  { id: "noches-asc", etiqueta: "Menos noches" },
];

function Selector({
  icono,
  etiqueta,
  valor,
  onChange,
  children,
}: {
  icono: React.ReactNode;
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="group block rounded-2xl border border-arena/80 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-verde-golf/40 hover:shadow-lg hover:shadow-verde-golf/10 focus-within:border-verde-golf/60 focus-within:ring-4 focus-within:ring-verde-golf/10">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-niebla">{etiqueta}</span>
      <span className="mt-1.5 flex items-center gap-2.5 text-carbon">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-verde-golf/10 text-verde-golf transition-colors group-hover:bg-verde-golf group-hover:text-crema">{icono}</span>
        <select
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 cursor-pointer appearance-none bg-transparent text-base outline-none"
        >
          {children}
        </select>
        <ChevronDown size={16} className="shrink-0 text-niebla" />
      </span>
    </label>
  );
}

export function FiltroPaquetes({
  paquetes,
  destinos,
}: {
  paquetes: PaquetePredefinido[];
  destinos: DestinoConPaquetes[];
}) {
  const [destino, setDestino] = useState("todos");
  const [noches, setNoches] = useState("todas");
  const [presupuesto, setPresupuesto] = useState("todos");
  const [campo, setCampo] = useState("todos");
  const [orden, setOrden] = useState("destacados");
  const [soloDestacados, setSoloDestacados] = useState(false);
  const resultadosRef = useRef<HTMLDivElement>(null);

  const destinosConPlanes = destinos.filter((d) => d.paquetes.length > 0);
  // Las opciones salen de los planes reales: solo se ofrecen duraciones que
  // existen y topes de precio cercanos a lo que de verdad cuesta cada plan.
  const opcionesNoches = useMemo(
    () => [...new Set(paquetes.map((p) => p.noches))].sort((a, b) => a - b),
    [paquetes],
  );
  const topesPresupuesto = useMemo(() => {
    const techos = [
      ...new Set(
        paquetes.map(
          (p) => Math.ceil(p.precioDesdeCop / PASO_PRESUPUESTO) * PASO_PRESUPUESTO,
        ),
      ),
    ].sort((a, b) => a - b);
    return techos.length > 5
      ? techos.filter((_, i) => i % Math.ceil(techos.length / 5) === 0 || i === techos.length - 1)
      : techos;
  }, [paquetes]);
  const campos = useMemo(
    () => [...new Set(paquetes.flatMap((p) => p.camposIncluidos))].sort(),
    [paquetes],
  );

  const resultados = useMemo(() => {
    const idsDestino =
      destino === "todos"
        ? null
        : new Set(
            destinos.find((d) => d.id === destino)?.paquetes.map((p) => p.id),
          );
    const nochesElegidas = noches === "todas" ? null : Number(noches);
    const tope = presupuesto === "todos" ? Infinity : Number(presupuesto);

    const filtrados = paquetes.filter(
      (p) =>
        (!idsDestino || idsDestino.has(p.id)) &&
        (nochesElegidas === null || p.noches === nochesElegidas) &&
        p.precioDesdeCop <= tope &&
        (campo === "todos" || p.camposIncluidos.includes(campo)) &&
        (!soloDestacados || p.destacado),
    );

    const ordenar: Record<string, (a: PaquetePredefinido, b: PaquetePredefinido) => number> = {
      destacados: (a, b) => Number(b.destacado) - Number(a.destacado),
      "precio-asc": (a, b) => a.precioDesdeCop - b.precioDesdeCop,
      "precio-desc": (a, b) => b.precioDesdeCop - a.precioDesdeCop,
      "noches-asc": (a, b) => a.noches - b.noches,
    };
    return filtrados.sort(ordenar[orden]);
  }, [paquetes, destinos, destino, noches, presupuesto, campo, orden, soloDestacados]);

  const hayFiltros =
    destino !== "todos" ||
    noches !== "todas" ||
    presupuesto !== "todos" ||
    campo !== "todos" ||
    soloDestacados;

  function limpiar() {
    setDestino("todos");
    setNoches("todas");
    setPresupuesto("todos");
    setCampo("todos");
    setSoloDestacados(false);
  }

  return (
    <>
      <div className="rounded-[2rem] border border-white/80 bg-white/70 p-4 shadow-[0_30px_80px_-30px_rgba(11,43,33,0.35)] ring-1 ring-arena/60 backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-carbon">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="alcance"
              checked={!soloDestacados}
              onChange={() => setSoloDestacados(false)}
              className="accent-[var(--color-verde-golf)]"
            />
            <span className={!soloDestacados ? "font-medium" : ""}>Todos los planes</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="alcance"
              checked={soloDestacados}
              onChange={() => setSoloDestacados(true)}
              className="accent-[var(--color-verde-golf)]"
            />
            <span className={soloDestacados ? "font-medium" : ""}>Más elegidos</span>
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
          <Selector icono={<MapPin size={18} />} etiqueta="Destino" valor={destino} onChange={setDestino}>
            <option value="todos">Todos los destinos</option>
            {destinosConPlanes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </Selector>
          <Selector icono={<Moon size={18} />} etiqueta="Duración" valor={noches} onChange={setNoches}>
            <option value="todas">Cualquier duración</option>
            {opcionesNoches.map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "noche" : "noches"}
              </option>
            ))}
          </Selector>
          <Selector icono={<Wallet size={18} />} etiqueta="Presupuesto" valor={presupuesto} onChange={setPresupuesto}>
            <option value="todos">Cualquier precio</option>
            {topesPresupuesto.map((t) => (
              <option key={t} value={t}>
                Hasta {fmtCop(t)}
              </option>
            ))}
          </Selector>
          <Selector icono={<Flag size={18} />} etiqueta="Campo de golf" valor={campo} onChange={setCampo}>
            <option value="todos">Todos los campos</option>
            {campos.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Selector>
          <button
            type="button"
            onClick={() =>
              resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-verde-golf to-verde-calle px-8 text-sm font-semibold text-crema shadow-lg shadow-verde-calle/30 transition-all hover:-translate-y-0.5 hover:shadow-xl sm:col-span-2 lg:col-span-1"
          >
            <Search size={16} /> Buscar
          </button>
        </div>
      </div>

      <div
        ref={resultadosRef}
        className="mt-8 flex scroll-mt-28 flex-wrap items-center justify-between gap-3"
      >
        <p className="text-sm text-niebla" aria-live="polite">
          {resultados.length}{" "}
          {resultados.length === 1 ? "plan encontrado" : "planes encontrados"}
          {hayFiltros && (
            <>
              {" · "}
              <button
                type="button"
                onClick={limpiar}
                className="text-verde-golf underline-offset-4 hover:underline"
              >
                Limpiar filtros
              </button>
            </>
          )}
        </p>
        <label className="flex items-center gap-2 text-sm text-niebla">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="rounded-[var(--radius-control)] border border-arena bg-blanco-roto px-3 py-2 text-carbon outline-none focus:border-verde-golf/60"
          >
            {ORDENES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      {resultados.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {resultados.map((p) => (
            <PackageCard key={p.id} paquete={p} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[var(--radius-panel)] border border-dashed border-arena p-10 text-center">
          <p className="font-serif text-xl text-carbon">
            Ningún plan coincide con esos filtros
          </p>
          <p className="mt-2 text-sm text-niebla">
            Prueba con otro destino o presupuesto, o arma uno a tu medida en el
            constructor.
          </p>
          <button
            type="button"
            onClick={limpiar}
            className="mt-4 text-sm text-verde-golf underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
