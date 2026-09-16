"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { MapaMundoPicker } from "@/components/admin/mapa-mundo-picker";
import {
  crearDestino,
  actualizarDestino,
  eliminarDestino,
  type DatosDestino,
} from "@/app/admin/(panel)/destinos/actions";

const slugificar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function DestinoForm({ destino }: { destino?: DatosDestino }) {
  const esNuevo = !destino;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(destino?.nombre ?? "");
  const [region, setRegion] = useState(destino?.region ?? "");
  const [pais, setPais] = useState(destino?.pais ?? "");
  const [lat, setLat] = useState(destino?.lat ?? 4.71);
  const [lng, setLng] = useState(destino?.lng ?? -74.07);
  const [resumen, setResumen] = useState(destino?.resumen ?? "");
  const [disponible, setDisponible] = useState(destino?.disponible ?? false);
  const [orden, setOrden] = useState(destino?.orden ?? 0);

  function alGuardar() {
    setError(null);
    const datos: DatosDestino = {
      id: destino?.id ?? `dest-${slugificar(nombre)}`,
      nombre,
      region,
      pais,
      lat,
      lng,
      resumen,
      disponible,
      orden,
    };
    if (!datos.nombre || !datos.region || !datos.pais || !datos.resumen) {
      setError("Nombre, región, país y resumen son obligatorios.");
      return;
    }
    startTransition(async () => {
      try {
        if (esNuevo) await crearDestino(datos);
        else await actualizarDestino(datos);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  function alEliminar() {
    if (!destino) return;
    if (
      !confirm(
        `¿Eliminar "${destino.nombre}"? Los campos de golf que apunten aquí quedarán sin destino.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await eliminarDestino(destino.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo eliminar.");
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-6">
      {error && (
        <p className="rounded-[var(--radius-control)] bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nombre">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className={estiloInput} />
            </Campo>
            <Campo label="País">
              <input value={pais} onChange={(e) => setPais(e.target.value)} className={estiloInput} />
            </Campo>
          </div>
          <Campo label="Región">
            <input value={region} onChange={(e) => setRegion(e.target.value)} className={estiloInput} />
          </Campo>
          <Campo label="Resumen">
            <textarea
              rows={3}
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              className={estiloInput}
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Latitud">
              <input
                type="number"
                step={0.01}
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className={estiloInput}
              />
            </Campo>
            <Campo label="Longitud">
              <input
                type="number"
                step={0.01}
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className={estiloInput}
              />
            </Campo>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-carbon">Posición en el globo</span>
          <div className="mt-1.5">
            <MapaMundoPicker lat={lat} lng={lng} onCambiar={(la, lo) => { setLat(la); setLng(lo); }} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-carbon">
          <input
            type="checkbox"
            checked={disponible}
            onChange={(e) => setDisponible(e.target.checked)}
          />
          Disponible (operativo, no &quot;próximamente&quot;)
        </label>
        <label className="flex items-center gap-2 text-sm text-carbon">
          Orden
          <input
            type="number"
            value={orden}
            onChange={(e) => setOrden(Number(e.target.value))}
            className="w-16 rounded-[var(--radius-control)] border border-arena bg-crema px-2 py-1 text-sm outline-none focus:border-verde-golf"
          />
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-arena pt-5">
        <Button onClick={alGuardar} disabled={pending}>
          {pending ? "Guardando…" : esNuevo ? "Crear destino" : "Guardar cambios"}
        </Button>
        {!esNuevo && (
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
