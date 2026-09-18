"use client";

import { useState, useTransition } from "react";
import { Globe2, ImageIcon, MapPin, Rocket } from "lucide-react";
import { SubirFotos } from "@/components/admin/subir-fotos";
import {
  AreaTexto,
  BarraGuardar,
  Campo,
  Entrada,
  Interruptor,
  Seccion,
} from "@/components/admin/form-ui";
import { MapaMundoPicker, type CiudadMapa } from "@/components/admin/mapa-mundo-picker";
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

export function DestinoForm({
  destino,
  ciudades = [],
}: {
  destino?: DatosDestino;
  ciudades?: CiudadMapa[];
}) {
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
  const [fotoUrl, setFotoUrl] = useState(destino?.fotoUrl ?? "");

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
      fotoUrl: fotoUrl.trim() || null,
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
    <div className="max-w-6xl space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Seccion
            icono={<Globe2 size={18} />}
            titulo="Información del destino"
            descripcion="Lo que verá el viajero al tocar este punto en el globo."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre">
                <Entrada value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Sabana de Bogotá" />
              </Campo>
              <Campo label="País">
                <Entrada value={pais} onChange={(e) => setPais(e.target.value)} placeholder="Colombia" />
              </Campo>
            </div>
            <Campo label="Región o departamento">
              <Entrada value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Cundinamarca" />
            </Campo>
            <Campo label="Resumen" ayuda="Dos o tres frases que vendan el destino.">
              <AreaTexto rows={4} value={resumen} onChange={(e) => setResumen(e.target.value)} />
            </Campo>
          </Seccion>

          <Seccion
            icono={<ImageIcon size={18} />}
            titulo="Foto del destino"
            descripcion="Aparece en el panel que se abre al tocar el destino."
          >
            {fotoUrl ? (
              <div className="group relative aspect-[16/7] overflow-hidden rounded-2xl bg-arena">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoUrl} alt={nombre} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoUrl("")}
                  className="absolute right-3 top-3 rounded-xl bg-carbon/70 px-3 py-1.5 text-xs text-crema backdrop-blur transition hover:bg-error"
                >
                  Quitar foto
                </button>
              </div>
            ) : (
              <SubirFotos
                multiple={false}
                carpeta={`destinos/${slugificar(nombre) || "nuevo"}`}
                alt={nombre}
                onSubidas={(fotos) => setFotoUrl(fotos[fotos.length - 1].url)}
              />
            )}
          </Seccion>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <Seccion icono={<Rocket size={18} />} titulo="Publicación">
            <Interruptor
              checked={disponible}
              onChange={setDisponible}
              titulo="Operativo"
              descripcion="Apagado se muestra como “próximamente”."
            />
            <Campo label="Orden en la lista" ayuda="Menor número aparece primero.">
              <Entrada type="number" min={0} value={orden} onChange={(e) => setOrden(Number(e.target.value))} />
            </Campo>
          </Seccion>
        </aside>
      </div>

      <Seccion
        icono={<MapPin size={18} />}
        titulo="Ubicación en el mapa"
        descripcion="Haz clic en el mapa para colocar el punto. Los puntos dorados son las ciudades ya registradas."
      >
        <MapaMundoPicker
          lat={lat}
          lng={lng}
          nombre={nombre}
          ciudades={ciudades}
          onCambiar={(la, lo) => {
            setLat(la);
            setLng(lo);
          }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Latitud">
            <Entrada type="number" step={0.01} sufijo="°" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
          </Campo>
          <Campo label="Longitud">
            <Entrada type="number" step={0.01} sufijo="°" value={lng} onChange={(e) => setLng(Number(e.target.value))} />
          </Campo>
        </div>
      </Seccion>

      <BarraGuardar
        pending={pending}
        etiqueta={esNuevo ? "Crear destino" : "Guardar cambios"}
        onGuardar={alGuardar}
        onEliminar={esNuevo ? undefined : alEliminar}
        error={error}
      />
    </div>
  );
}
