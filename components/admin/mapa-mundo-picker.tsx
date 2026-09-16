"use client";

import { useEffect, useRef, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";

const ANCHO = 640;
const ALTO = 320;

/** Mapamundi plano y clicable para fijar lat/lng — reusa el mismo topojson
 *  que ya usa el globo 3D del hero, así no se agrega ninguna dependencia
 *  ni imagen nueva. Clic en el mapa = posición del destino en el mundo. */
export function MapaMundoPicker({
  lat,
  lng,
  onCambiar,
}: {
  lat: number;
  lng: number;
  onCambiar: (lat: number, lng: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [path, setPath] = useState<string | null>(null);

  const proyeccion = geoEquirectangular()
    .fitSize([ANCHO, ALTO], { type: "Sphere" } as unknown as GeoJSON.GeoJSON);

  useEffect(() => {
    let activo = true;
    Promise.all([
      import("topojson-client"),
      fetch("/geo/countries-110m.json").then((r) => r.json()),
    ]).then(([{ feature }, topologia]) => {
      if (!activo) return;
      const geo = feature(
        topologia,
        topologia.objects.countries,
      ) as unknown as GeoJSON.FeatureCollection;
      const generador = geoPath(proyeccion);
      setPath(generador(geo) ?? "");
    });
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function alClic(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * ANCHO;
    const y = ((e.clientY - rect.top) / rect.height) * ALTO;
    const coords = proyeccion.invert?.([x, y]);
    if (!coords) return;
    const [nuevoLng, nuevoLat] = coords;
    onCambiar(Math.round(nuevoLat * 100) / 100, Math.round(nuevoLng * 100) / 100);
  }

  const punto = proyeccion([lng, lat]);

  return (
    <div className="overflow-hidden rounded-[var(--radius-control)] border border-arena bg-[#07231b]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="w-full cursor-crosshair"
        onClick={alClic}
      >
        {path && <path d={path} fill="#2f8a63" stroke="#0b3d2e" strokeWidth={0.5} />}
        {punto && (
          <g>
            <circle cx={punto[0]} cy={punto[1]} r={7} fill="none" stroke="#c6a664" strokeWidth={1.5} />
            <circle cx={punto[0]} cy={punto[1]} r={3} fill="#c6a664" />
          </g>
        )}
      </svg>
      <p className="border-t border-arena/20 px-3 py-1.5 text-xs text-crema/60">
        Haz clic en el mapa para fijar la posición del destino.
      </p>
    </div>
  );
}
