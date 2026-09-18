"use client";

import { useState, useTransition } from "react";
import { Rocket, Tag, Wallet } from "lucide-react";
import {
  AreaTexto,
  BarraGuardar,
  Campo,
  Entrada,
  Interruptor,
  Seccion,
  Selector,
} from "@/components/admin/form-ui";
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
    <div className="max-w-5xl space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Seccion icono={<Tag size={18} />} titulo="Identificación" descripcion="Qué es este componente del viaje.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Tipo">
                <Selector value={tipo} onChange={(e) => setTipo(e.target.value as TipoComponente)}>
                  {TIPOS.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </Selector>
              </Campo>
              <Campo label="Código" ayuda={esNueva ? "Identificador único; no se puede cambiar después." : "El código no se puede cambiar."}>
                <Entrada
                  value={codigo}
                  disabled={!esNueva}
                  onChange={(e) => setCodigo(e.target.value.trim())}
                  placeholder="campo-mi-club"
                />
              </Campo>
            </div>
            <Campo label="Nombre">
              <Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Campo>
            <Campo label="Descripción">
              <AreaTexto rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </Campo>
            {tipo === "campo_golf" && (
              <Campo label="Destino al que pertenece">
                <Selector value={destinoId} onChange={(e) => setDestinoId(e.target.value)}>
                  <option value="">Sin asignar</option>
                  {destinos.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </Selector>
              </Campo>
            )}
          </Seccion>

          <Seccion icono={<Wallet size={18} />} titulo="Precio" descripcion="Cómo se cobra en el cotizador.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo label="Precio unitario">
                <Entrada type="number" min={0} step={1000} prefijo="$" sufijo="COP" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} />
              </Campo>
              <Campo label="Se cobra">
                <Selector value={unidad} onChange={(e) => setUnidad(e.target.value as typeof unidad)}>
                  {UNIDADES.map((u) => (
                    <option key={u.valor} value={u.valor}>
                      {u.etiqueta}
                    </option>
                  ))}
                </Selector>
              </Campo>
              <Campo label="Factor temporada alta" ayuda="1 = sin recargo; 1,15 = +15%.">
                <Entrada type="number" min={1} step={0.01} sufijo="×" value={factor} onChange={(e) => setFactor(Number(e.target.value))} />
              </Campo>
            </div>
          </Seccion>
        </div>

        <aside className="lg:sticky lg:top-6">
          <Seccion icono={<Rocket size={18} />} titulo="Estado">
            <Interruptor
              checked={activo}
              onChange={setActivo}
              titulo="Activo"
              descripcion="Disponible en el cotizador."
            />
          </Seccion>
        </aside>
      </div>

      <BarraGuardar
        pending={pending}
        etiqueta={esNueva ? "Crear tarifa" : "Guardar cambios"}
        onGuardar={alGuardar}
        onEliminar={esNueva ? undefined : alEliminar}
        error={error}
      />
    </div>
  );
}
