"use client";

import { useMemo } from "react";
import { useCotizador } from "@/stores/cotizador-store";
import type { Tarifa } from "@/lib/pricing/types";
import type { BloqueoCalendario } from "@/lib/data/types";
import { OptionCard, Stepper } from "./option-card";
import { cop, fechaCo } from "@/lib/format";

function usePorTipo(tarifas: Tarifa[]) {
  return useMemo(() => {
    const g: Record<string, Tarifa[]> = {};
    for (const t of tarifas) (g[t.tipo] ??= []).push(t);
    return g;
  }, [tarifas]);
}

/* ---------------- Paso 0 · Campos ---------------- */
export function PasoCampos({ tarifas }: { tarifas: Tarifa[] }) {
  const campos = usePorTipo(tarifas).campo_golf ?? [];
  const { seleccion, toggleCampo, setRondas } = useCotizador();

  return (
    <div className="space-y-3">
      <p className="text-sm text-niebla">
        Elige uno o varios campos. Puedes jugar más de una ronda en cada uno.
      </p>
      {campos.map((c, i) => {
        const activo = seleccion.campos.includes(c.codigo);
        return (
          <div key={c.codigo}>
            <OptionCard
              tipo="check"
              titulo={c.nombre}
              descripcion={c.descripcion}
              precio={c.precioUnitarioCop}
              sufijoPrecio="/ jugador · ronda"
              activo={activo}
              badge={i === 0 ? "Más elegido" : undefined}
              onClick={() => toggleCampo(c.codigo)}
            />
            {activo && (
              <div className="mt-2 pl-8">
                <Stepper
                  label="Rondas"
                  valor={seleccion.rondasPorCampo[c.codigo] ?? 1}
                  min={1}
                  max={4}
                  onChange={(n) => setRondas(c.codigo, n)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Paso 1 · Alojamiento ---------------- */
export function PasoAlojamiento({ tarifas }: { tarifas: Tarifa[] }) {
  const hoteles = usePorTipo(tarifas).hotel ?? [];
  const { seleccion, setHotel, setHabitaciones, setNoches, setNumPax } =
    useCotizador();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6 rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-4">
        <Stepper
          label="Pasajeros"
          valor={seleccion.numPax}
          min={1}
          max={40}
          onChange={setNumPax}
        />
        <Stepper
          label="Noches"
          valor={seleccion.noches}
          min={1}
          max={30}
          onChange={setNoches}
        />
        <Stepper
          label="Habitaciones"
          valor={seleccion.habitaciones}
          min={1}
          max={20}
          onChange={setHabitaciones}
        />
      </div>

      <div className="space-y-3">
        {hoteles.map((h) => (
          <OptionCard
            key={h.codigo}
            titulo={h.nombre}
            descripcion={h.descripcion}
            precio={h.precioUnitarioCop}
            sufijoPrecio="/ habitación · noche"
            activo={seleccion.hotelCodigo === h.codigo}
            onClick={() =>
              setHotel(seleccion.hotelCodigo === h.codigo ? null : h.codigo)
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Paso 2 · Transporte ---------------- */
export function PasoTransporte({ tarifas }: { tarifas: Tarifa[] }) {
  const transporte = usePorTipo(tarifas).transporte ?? [];
  const { seleccion, setTransporte } = useCotizador();

  return (
    <div className="space-y-3">
      {transporte.map((t) => (
        <OptionCard
          key={t.codigo}
          titulo={t.nombre}
          descripcion={t.descripcion}
          precio={t.precioUnitarioCop}
          sufijoPrecio="/ servicio"
          activo={seleccion.transporteCodigo === t.codigo}
          onClick={() =>
            setTransporte(
              seleccion.transporteCodigo === t.codigo ? null : t.codigo,
            )
          }
        />
      ))}
      <OptionCard
        titulo="Sin transporte"
        descripcion="Me muevo por mi cuenta."
        activo={seleccion.transporteCodigo === null}
        onClick={() => setTransporte(null)}
      />
    </div>
  );
}

/* ---------------- Paso 3 · Actividades ---------------- */
export function PasoActividades({ tarifas }: { tarifas: Tarifa[] }) {
  const actividades = usePorTipo(tarifas).actividad ?? [];
  const { seleccion, toggleActividad } = useCotizador();

  return (
    <div className="space-y-3">
      <p className="text-sm text-niebla">
        Opcional — puedes añadirlas ahora o decidir más adelante.
      </p>
      {actividades.map((a) => (
        <OptionCard
          key={a.codigo}
          tipo="check"
          titulo={a.nombre}
          descripcion={a.descripcion}
          precio={a.precioUnitarioCop}
          sufijoPrecio="/ persona"
          activo={seleccion.actividades.includes(a.codigo)}
          onClick={() => toggleActividad(a.codigo)}
        />
      ))}
    </div>
  );
}

/* ---------------- Paso 4 · Fechas ---------------- */
export function PasoFechas({ bloqueos }: { bloqueos: BloqueoCalendario[] }) {
  const { seleccion, setFecha } = useCotizador();

  const dias = useMemo(() => {
    const arr: { iso: string; date: Date }[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    for (let i = 3; i < 3 + 70; i++) {
      const d = new Date(hoy);
      d.setDate(d.getDate() + i);
      arr.push({ iso: d.toISOString().slice(0, 10), date: d });
    }
    return arr;
  }, []);

  function estado(iso: string) {
    for (const b of bloqueos) {
      if (iso >= b.fechaInicio && iso <= b.fechaFin) return b;
    }
    return null;
  }

  return (
    <div>
      <p className="text-sm text-niebla">
        Elige el día de inicio de tu viaje ({seleccion.noches} noches). Las
        fechas en rojo no están disponibles; las doradas son temporada alta.
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {dias.map(({ iso, date }) => {
          const b = estado(iso);
          const bloqueado = b?.tipo === "bloqueo" || b?.tipo === "cupo";
          const alta = b?.tipo === "temporada_alta";
          const activo = seleccion.fechaInicio === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={bloqueado}
              title={b?.nota}
              onClick={() => setFecha(iso, alta)}
              className={[
                "relative rounded-lg border p-2 text-center text-xs transition-colors",
                bloqueado
                  ? "cursor-not-allowed border-error/30 bg-error/5 text-error/50 line-through"
                  : activo
                    ? "border-verde-golf bg-verde-golf text-crema"
                    : "border-arena bg-blanco-roto text-carbon hover:border-verde-golf/40",
              ].join(" ")}
            >
              <span className="block font-medium">{date.getDate()}</span>
              <span className="block text-[10px] opacity-70">
                {date.toLocaleDateString("es-CO", { month: "short" })}
              </span>
              {alta && !activo && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-champagne" />
              )}
            </button>
          );
        })}
      </div>

      {seleccion.fechaInicio && (
        <p className="mt-4 rounded-lg bg-verde-golf/5 px-3 py-2 text-sm text-carbon">
          Viaje del <strong>{fechaCo(seleccion.fechaInicio)}</strong>
          {seleccion.temporadaAlta && (
            <span className="text-alerta"> · temporada alta aplicada</span>
          )}
        </p>
      )}
    </div>
  );
}

/* ---------------- Resumen final (mini, para el paso resumen) ---------------- */
export function DesgloseLineas() {
  const { cotizacion } = useCotizador();
  return (
    <ul className="divide-y divide-arena">
      {cotizacion.lineas.map((l, i) => (
        <li key={i} className="flex items-center justify-between gap-4 py-3 text-sm">
          <span>
            <span className="block text-carbon">{l.concepto}</span>
            <span className="text-xs text-niebla">{l.detalle}</span>
          </span>
          <span className="tabular text-carbon">{cop(l.subtotal)}</span>
        </li>
      ))}
    </ul>
  );
}
