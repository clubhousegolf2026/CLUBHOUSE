"use client";

import { useState } from "react";
import { Copy, Plus, X } from "lucide-react";
import { Campo, Entrada, Selector } from "@/components/admin/form-ui";
import type { Tarifa } from "@/lib/contenido/experiencias";
import {
  CATEGORIAS_COSTO,
  calcular,
  costeoVacio,
  formatoDinero,
  subtotalLinea,
  type AplicaA,
  type Costeo,
  type CostosExperiencia,
  type LineaCosto,
  type Moneda,
  type ModoGanancia,
} from "@/lib/contenido/costeo";

const num = (v: string) => (v === "" ? 0 : Number(v));
const vacioSiCero = (n: number) => (n === 0 ? "" : n);
const idCorto = () => Math.random().toString(36).slice(2, 8);

const MODOS: { id: ModoGanancia; etiqueta: string; ayuda: string; sufijo: string }[] = [
  { id: "margen", etiqueta: "Margen sobre el precio", ayuda: "% del precio al público que quieres ganar. 20 % → de cada 100 que cobras, 20 son ganancia.", sufijo: "%" },
  { id: "recargo", etiqueta: "Recargo sobre el costo", ayuda: "% que se suma al costo. 25 % → un costo de 100 se vende en 125 (antes de comisiones).", sufijo: "%" },
  { id: "ganancia", etiqueta: "Ganancia fija por persona", ayuda: "Un monto fijo que quieres ganar por cada viajero.", sufijo: "" },
];

export function CosteoEditor({
  costos,
  onChange,
  tarifas,
  onAplicarPrecio,
  onUsarDesde,
}: {
  costos: CostosExperiencia;
  onChange: (c: CostosExperiencia) => void;
  tarifas: Tarifa[];
  onAplicarPrecio: (indiceTarifa: number, texto: string) => void;
  onUsarDesde: (texto: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [destino, setDestino] = useState(0);
  const lista = costos.costeos;
  const sel = Math.min(idx, Math.max(0, lista.length - 1));
  const c = lista[sel];

  const guardarCosteo = (parche: Partial<Costeo>) =>
    onChange({ costeos: lista.map((x, i) => (i === sel ? { ...x, ...parche } : x)) });
  const guardarLinea = (id: string, parche: Partial<LineaCosto>) =>
    guardarCosteo({ lineas: c.lineas.map((l) => (l.id === id ? { ...l, ...parche } : l)) });

  if (!c) {
    return (
      <div className="rounded-2xl border border-dashed border-arena p-8 text-center">
        <p className="text-sm text-niebla">
          Crea una hoja de costos por tipo de viajero (por ejemplo «Golfista · habitación doble»).
          Cargas los costos reales, dices cuánto quieres ganar y se calcula el precio al público.
        </p>
        <button
          type="button"
          onClick={() => {
            onChange({ costeos: [costeoVacio("Golfista · habitación doble")] });
            setIdx(0);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-verde-golf px-5 py-2.5 text-sm font-semibold text-crema hover:bg-verde-calle"
        >
          <Plus size={15} /> Crear la primera hoja de costos
        </button>
      </div>
    );
  }

  const r = calcular(c);
  const modo = MODOS.find((m) => m.id === c.modo) ?? MODOS[0];
  const totalCosto = r.costoPersona || 1;
  const escenarios = Array.from({ length: 9 }, (_, i) => Math.max(1, c.pax - 3 + i)).filter(
    (n, i, a) => a.indexOf(n) === i,
  );
  const textoPrecio = r.valido ? formatoDinero(r.precio, c.moneda) : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {lista.map((x, i) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setIdx(i)}
            aria-pressed={i === sel}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              i === sel ? "border-verde-golf bg-verde-golf text-crema" : "border-arena bg-white text-carbon hover:border-verde-golf/50"
            }`}
          >
            {x.nombre || "Sin nombre"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            onChange({ costeos: [...lista, costeoVacio(`Hoja ${lista.length + 1}`, c.moneda)] });
            setIdx(lista.length);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-verde-golf/50 px-4 py-1.5 text-sm text-verde-golf hover:bg-verde-golf/5"
        >
          <Plus size={14} /> Nueva hoja
        </button>
        <button
          type="button"
          onClick={() => {
            onChange({
              costeos: [...lista, { ...c, id: idCorto(), nombre: `${c.nombre} (copia)`, lineas: c.lineas.map((l) => ({ ...l, id: idCorto() })) }],
            });
            setIdx(lista.length);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-arena px-4 py-1.5 text-sm text-niebla hover:text-carbon"
        >
          <Copy size={14} /> Duplicar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Campo label="Nombre de la hoja" className="sm:col-span-2">
          <Entrada value={c.nombre} onChange={(ev) => guardarCosteo({ nombre: ev.target.value })} placeholder="Golfista · habitación doble" />
        </Campo>
        <Campo label="Moneda">
          <Selector value={c.moneda} onChange={(ev) => guardarCosteo({ moneda: ev.target.value as Moneda })}>
            <option value="USD">USD</option>
            <option value="COP">COP</option>
            <option value="EUR">EUR</option>
          </Selector>
        </Campo>
        <Campo label="Personas del grupo" ayuda="Reparte los costos fijos.">
          <Entrada type="number" min={1} value={c.pax} onChange={(ev) => guardarCosteo({ pax: Math.max(1, num(ev.target.value)) })} />
        </Campo>
      </div>

      <div>
        <h3 className="font-serif text-base text-carbon">Costos del viaje</h3>
        <p className="mb-3 text-sm text-niebla">
          «Por persona» se paga una vez por cada viajero (hotel, green fee). «Fijo del grupo» se paga una sola vez y se reparte
          entre todos (van, guía, casa).
        </p>

        <div className="space-y-2">
          {c.lineas.length === 0 && (
            <p className="rounded-xl border border-dashed border-arena p-4 text-center text-sm text-niebla">Aún no hay costos. Usa los atajos de abajo.</p>
          )}
          {c.lineas.map((l) => (
            <div key={l.id} className="grid items-end gap-2 rounded-2xl border border-arena bg-white p-3 sm:grid-cols-[1.2fr_1.6fr_1fr_0.7fr_1fr_auto_auto]">
              <Selector aria-label="Categoría" value={l.categoria} onChange={(ev) => guardarLinea(l.id, { categoria: ev.target.value })}>
                {CATEGORIAS_COSTO.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </Selector>
              <Entrada aria-label="Concepto" placeholder="Hotel en Bangkok" value={l.concepto} onChange={(ev) => guardarLinea(l.id, { concepto: ev.target.value })} />
              <Selector aria-label="Se paga" value={l.aplicaA} onChange={(ev) => guardarLinea(l.id, { aplicaA: ev.target.value as AplicaA })}>
                <option value="persona">Por persona</option>
                <option value="grupo">Fijo del grupo</option>
              </Selector>
              <Entrada aria-label="Cantidad" type="number" min={0} step="any" placeholder="Cant." value={vacioSiCero(l.cantidad)} onChange={(ev) => guardarLinea(l.id, { cantidad: num(ev.target.value) })} />
              <Entrada aria-label="Costo unitario" type="number" min={0} step="any" placeholder="Costo" value={vacioSiCero(l.costoUnitario)} onChange={(ev) => guardarLinea(l.id, { costoUnitario: num(ev.target.value) })} />
              <span className="min-w-[88px] px-1 pb-2.5 text-right text-sm tabular-nums text-carbon">{formatoDinero(subtotalLinea(l), c.moneda)}</span>
              <button type="button" aria-label="Quitar costo" onClick={() => guardarCosteo({ lineas: c.lineas.filter((x) => x.id !== l.id) })} className="grid h-10 w-10 place-items-center rounded-lg text-error hover:bg-error/10">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIAS_COSTO.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() =>
                guardarCosteo({
                  lineas: [...c.lineas, { id: idCorto(), categoria: k, concepto: "", cantidad: 1, costoUnitario: 0, aplicaA: k === "Guía y staff" || k === "Traslados y transporte" ? "grupo" : "persona" }],
                })
              }
              className="rounded-full border border-arena bg-white px-3 py-1 text-xs text-carbon hover:border-verde-golf/50"
            >
              + {k}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-base text-carbon">Cuánto quieres ganar</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          <Campo label="Cómo calcular la ganancia" className="sm:col-span-2" ayuda={modo.ayuda}>
            <Selector value={c.modo} onChange={(ev) => guardarCosteo({ modo: ev.target.value as ModoGanancia })}>
              {MODOS.map((m) => (
                <option key={m.id} value={m.id}>{m.etiqueta}</option>
              ))}
            </Selector>
          </Campo>
          <Campo label={c.modo === "ganancia" ? `Ganancia por persona (${c.moneda})` : "Porcentaje"}>
            <Entrada type="number" min={0} step="any" sufijo={modo.sufijo || undefined} value={vacioSiCero(c.valorModo)} onChange={(ev) => guardarCosteo({ valorModo: num(ev.target.value) })} />
          </Campo>
          <Campo label="Redondear precio a" ayuda="Hacia arriba.">
            <Selector value={String(c.redondeo)} onChange={(ev) => guardarCosteo({ redondeo: Number(ev.target.value) })}>
              <option value="0">Sin redondeo</option>
              <option value="1">1</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="1000">1.000</option>
              <option value="10000">10.000</option>
            </Selector>
          </Campo>
          <Campo label="Comisión de venta o pasarela" ayuda="% del precio que se va en comisiones.">
            <Entrada type="number" min={0} step="any" sufijo="%" value={vacioSiCero(c.comisionPct)} onChange={(ev) => guardarCosteo({ comisionPct: num(ev.target.value) })} />
          </Campo>
          <Campo label="Impuestos sobre la venta" ayuda="IVA u otros, % del precio.">
            <Entrada type="number" min={0} step="any" sufijo="%" value={vacioSiCero(c.impuestosPct)} onChange={(ev) => guardarCosteo({ impuestosPct: num(ev.target.value) })} />
          </Campo>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-verde-golf/30 bg-gradient-to-br from-verde-golf/[0.07] to-champagne/10 p-5 sm:p-6">
        {!r.valido ? (
          <p role="status" className="text-sm text-alerta">{r.error}</p>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-4">
              <Dato etiqueta="Costo por persona" valor={formatoDinero(r.costoPersona, c.moneda)} />
              <Dato etiqueta="Ganancia por persona" valor={formatoDinero(r.ganancia, c.moneda)} detalle={`${r.gananciaPct.toFixed(1)} % del precio`} />
              <Dato etiqueta="Comisión + impuestos" valor={formatoDinero(r.comision + r.impuestos, c.moneda)} />
              <Dato etiqueta="Precio al público" valor={textoPrecio} grande />
            </div>
            <p className="mt-4 text-sm text-niebla">
              Con {c.pax} {c.pax === 1 ? "persona" : "personas"}: ingresos {formatoDinero(r.precio * c.pax, c.moneda)} · costos{" "}
              {formatoDinero(r.costoPersona * c.pax, c.moneda)} · <strong className="text-carbon">utilidad {formatoDinero(r.ganancia * c.pax, c.moneda)}</strong>
            </p>

            {r.porCategoria.length > 0 && (
              <div className="mt-5 space-y-2">
                {r.porCategoria.map((x) => (
                  <div key={x.categoria} className="grid grid-cols-[150px_1fr_90px] items-center gap-3 text-xs">
                    <span className="truncate text-niebla">{x.categoria}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-arena/60">
                      <span className="block h-full rounded-full bg-verde-golf" style={{ width: `${Math.min(100, (x.porPersona / totalCosto) * 100)}%` }} />
                    </span>
                    <span className="text-right tabular-nums text-carbon">{formatoDinero(x.porPersona, c.moneda)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-niebla">Según el tamaño del grupo</h4>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-niebla">
                      <th className="py-1.5 pr-3">Personas</th>
                      <th className="py-1.5 pr-3">Costo p/p</th>
                      <th className="py-1.5 pr-3">Precio p/p</th>
                      <th className="py-1.5">Utilidad del grupo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escenarios.map((n) => {
                      const e = calcular(c, n);
                      return (
                        <tr key={n} className={`border-t border-arena/60 ${n === c.pax ? "font-semibold text-carbon" : "text-niebla"}`}>
                          <td className="py-1.5 pr-3">{n}</td>
                          <td className="py-1.5 pr-3 tabular-nums">{formatoDinero(e.costoPersona, c.moneda)}</td>
                          <td className="py-1.5 pr-3 tabular-nums">{formatoDinero(e.precio, c.moneda)}</td>
                          <td className="py-1.5 tabular-nums">{formatoDinero(e.ganancia * n, c.moneda)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-verde-golf/20 pt-5">
              {tarifas.length > 0 && (
                <>
                  <Campo label="Poner este precio en la tarifa" className="min-w-[220px] flex-1">
                    <Selector value={destino} onChange={(ev) => setDestino(Number(ev.target.value))}>
                      {tarifas.map((t, i) => (
                        <option key={i} value={i}>{`${t.perfil || "Tarifa"}${t.detalle ? ` · ${t.detalle}` : ""} (${t.precio || "sin precio"})`}</option>
                      ))}
                    </Selector>
                  </Campo>
                  <button type="button" onClick={() => onAplicarPrecio(Math.min(destino, tarifas.length - 1), textoPrecio)} className="h-11 rounded-xl bg-verde-golf px-5 text-sm font-semibold text-crema hover:bg-verde-calle">
                    Aplicar a la tarifa
                  </button>
                </>
              )}
              <button type="button" onClick={() => onUsarDesde(textoPrecio)} className="h-11 rounded-xl border border-verde-golf/40 px-5 text-sm font-medium text-verde-golf hover:bg-verde-golf/5">
                Usar como precio «desde»
              </button>
            </div>
            <p className="mt-2 text-xs text-niebla">Esto solo cambia el precio que ve el público cuando guardas la experiencia. Los costos nunca se publican.</p>
          </>
        )}
      </div>

      <button type="button" onClick={() => { onChange({ costeos: lista.filter((_, i) => i !== sel) }); setIdx(0); }} className="text-sm text-niebla hover:text-error">
        Eliminar esta hoja de costos
      </button>
    </div>
  );
}

function Dato({ etiqueta, valor, detalle, grande }: { etiqueta: string; valor: string; detalle?: string; grande?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-niebla">{etiqueta}</p>
      <p className={`mt-1 font-serif tabular-nums ${grande ? "text-3xl text-verde-golf" : "text-xl text-carbon"}`}>{valor}</p>
      {detalle && <p className="text-xs text-niebla">{detalle}</p>}
    </div>
  );
}
