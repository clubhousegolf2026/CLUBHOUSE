"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, MapPin, Moon, Flag, Wallet, Search } from "lucide-react";
import { PackageCard } from "@/components/marketing/package-card";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

const RANGOS_NOCHES = [
  { id: "todas", etiqueta: "Cualquier duración", min: 0, max: Infinity },
  { id: "1-2", etiqueta: "1 a 2 noches", min: 1, max: 2 },
  { id: "3-4", etiqueta: "3 a 4 noches", min: 3, max: 4 },
  { id: "5+", etiqueta: "5 noches o más", min: 5, max: Infinity },
];

const PRESUPUESTOS = [
  { id: "todos", etiqueta: "Cualquier precio", max: Infinity },
  { id: "1500000", etiqueta: "Hasta $ 1.500.000", max: 1_500_000 },
  { id: "3000000", etiqueta: "Hasta $ 3.000.000", max: 3_000_000 },
  { id: "5000000", etiqueta: "Hasta $ 5.000.000", max: 5_000_000 },
];

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
    <label className="block rounded-[var(--radius-card)] border border-arena bg-blanco-roto px-4 py-3 transition-colors focus-within:border-verde-golf/60">
      <span className="text-xs text-niebla">{etiqueta}</span>
      <span className="mt-1 flex items-center gap-2 text-carbon">
        <span className="shrink-0 text-verde-golf">{icono}</span>
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
    const rango = RANGOS_NOCHES.find((r) => r.id === noches)!;
    const tope = PRESUPUESTOS.find((r) => r.id === presupuesto)!.max;

    const filtrados = paquetes.filter(
      (p) =>
        (!idsDestino || idsDestino.has(p.id)) &&
        p.noches >= rango.min &&
        p.noches <= rango.max &&
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
      <div className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-4 shadow-[var(--shadow-suave)] sm:p-6">
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
            {RANGOS_NOCHES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.etiqueta}
              </option>
            ))}
          </Selector>
          <Selector icono={<Wallet size={18} />} etiqueta="Presupuesto" valor={presupuesto} onChange={setPresupuesto}>
            {PRESUPUESTOS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.etiqueta}
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
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-verde-golf px-8 text-sm font-medium text-crema transition-colors hover:bg-verde-golf/90 sm:col-span-2 lg:col-span-1"
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
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
