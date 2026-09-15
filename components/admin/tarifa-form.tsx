"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  crearTarifa,
  actualizarTarifa,
  eliminarTarifa,
  type DatosTarifa,
} from "@/app/admin/(panel)/tarifas/actions";
import type { TipoComponente } from "@/lib/pricing/types";

const TIPOS: { valor: TipoComponente; etiqueta: string }[] = [
  { valor: "campo_golf", etiqueta: "Campo de golf" },
  { valor: "hotel", etiqueta: "Hotel" },
  { valor: "transporte", etiqueta: "Transporte" },
  { valor: "actividad", etiqueta: "Actividad" },
  { valor: "fee_servicio", etiqueta: "Fee de servicio" },
];

const UNIDADES = [
  { valor: "persona_dia", etiqueta: "Por persona / día" },
  { valor: "habitacion_noche", etiqueta: "Por habitación / noche" },
  { valor: "servicio", etiqueta: "Por servicio (grupo)" },
  { valor: "grupo", etiqueta: "Por grupo" },
] as const;

export function TarifaForm({
  tarifa,
  destinos,
}: {
  tarifa?: DatosTarifa;
  destinos: { id: string; nombre: string }[];
}) {
  const esNueva = !tarifa;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [codigo, setCodigo] = useState(tarifa?.codigo ?? "");
  const [tipo, setTipo] = useState<TipoComponente>(tarifa?.tipo ?? "campo_golf");
  const [nombre, setNombre] = useState(tarifa?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(tarifa?.descripcion ?? "");
  const [precio, setPrecio] = useState(tarifa?.precioUnitarioCop ?? 0);
  const [unidad, setUnidad] = useState(tarifa?.unidad ?? "persona_dia");
  const [factor, setFactor] = useState(tarifa?.temporadaAltaFactor ?? 1);
  const [destinoId, setDestinoId] = useState(tarifa?.destinoId ?? "");
  const [activo, setActivo] = useState(tarifa?.activo ?? true);

  function alGuardar() {
    setError(null);
    const datos: DatosTarifa = {
      codigo: codigo.trim(),
      tipo,
      nombre,
      descripcion,
      precioUnitarioCop: precio,
      unidad,
      temporadaAltaFactor: factor,
      destinoId: destinoId || null,
      activo,
    };
    if (!datos.codigo || !datos.nombre) {
      setError("Código y nombre son obligatorios.");
      return;
    }
    startTransition(async () => {
      try {
        if (esNueva) await crearTarifa(datos);
        else await actualizarTarifa(datos);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  function alEliminar() {
    if (!tarifa) return;
    if (
      !confirm(
        `¿Eliminar "${tarifa.nombre}"? Si está incluida en algún paquete, no se podrá borrar.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await eliminarTarifa(tarifa.codigo);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo eliminar.");
      }
    });
  }

  return (
    <div className="max-w-2xl space-y-5">
      {error && (
        <p className="rounded-[var(--radius-control)] bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Código (identificador único)">
          <input
            value={codigo}
            disabled={!esNueva}
            onChange={(e) => setCodigo(e.target.value.trim())}
            placeholder="campo-mi-club"
            className={`${estiloInput} disabled:opacity-60`}
          />
        </Campo>
        <Campo label="Tipo">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoComponente)}
            className={estiloInput}
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo label="Nombre">
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={estiloInput} />
      </Campo>

      <Campo label="Descripción">
        <textarea
          rows={2}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className={estiloInput}
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Precio unitario (COP)">
          <input
            type="number"
            min={0}
            step={1000}
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
            className={estiloInput}
          />
        </Campo>
        <Campo label="Unidad">
          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value as typeof unidad)}
            className={estiloInput}
          >
            {UNIDADES.map((u) => (
              <option key={u.valor} value={u.valor}>
                {u.etiqueta}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Factor temporada alta">
          <input
            type="number"
            min={1}
            step={0.01}
            value={factor}
            onChange={(e) => setFactor(Number(e.target.value))}
            className={estiloInput}
          />
        </Campo>
      </div>

      {tipo === "campo_golf" && (
        <Campo label="Destino al que pertenece">
          <select
            value={destinoId}
            onChange={(e) => setDestinoId(e.target.value)}
            className={estiloInput}
          >
            <option value="">Sin asignar</option>
            {destinos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </Campo>
      )}

      <label className="flex items-center gap-2 text-sm text-carbon">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        Activo (disponible en el cotizador)
      </label>

      <div className="flex items-center gap-3 border-t border-arena pt-5">
        <Button onClick={alGuardar} disabled={pending}>
          {pending ? "Guardando…" : esNueva ? "Crear" : "Guardar cambios"}
        </Button>
        {!esNueva && (
          <Button
            variante="fantasma"
            className="text-error hover:bg-error/10"
            onClick={alEliminar}
            disabled={pending}
          >
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}

const estiloInput =
  "mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-carbon">{label}</span>
      {children}
    </label>
  );
}
