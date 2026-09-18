"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { Minus, Plus, RotateCcw } from "lucide-react";

const ANCHO = 1000;
const ALTO = 500;
const K_MAX = 14;

const PALETA = ["#2f8a63", "#3fa377", "#25714f", "#4bb389", "#1e6045", "#347a5a"];

export interface CiudadMapa {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
}

interface Vista {
  k: number;
  tx: number;
  ty: number;
}

const VISTA_INICIAL: Vista = { k: 1, tx: 0, ty: 0 };

/** Mapamundi grande y clicable para fijar lat/lng: países como polígonos
 *  separados (con borde y color propio), las ciudades ya registradas como
 *  puntos con su nombre, y zoom/arrastre para ubicar con precisión. Usa el
 *  mismo topojson del globo del hero — sin dependencias nuevas. */
export function MapaMundoPicker({
  lat,
  lng,
  nombre,
  ciudades = [],
  onCambiar,
}: {
  lat: number;
  lng: number;
  nombre?: string;
  ciudades?: CiudadMapa[];
  onCambiar: (lat: number, lng: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [paises, setPaises] = useState<string[] | null>(null);
  const [vista, setVista] = useState<Vista>(VISTA_INICIAL);
  const [hover, setHover] = useState<number | null>(null);
  const arrastre = useRef<{ x: number; y: number; tx: number; ty: number; movido: boolean } | null>(
    null,
  );

  const proyeccion = useMemo(
    () =>
      geoEquirectangular().fitSize([ANCHO, ALTO], {
        type: "Sphere",
      } as unknown as GeoJSON.GeoJSON),
    [],
  );

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
      setPaises(geo.features.map((f) => generador(f) ?? ""));
    });
    return () => {
      activo = false;
    };
  }, [proyeccion]);

  function limitar(v: Vista): Vista {
    const k = Math.min(K_MAX, Math.max(1, v.k));
    return {
      k,
      tx: Math.min(0, Math.max(ANCHO - ANCHO * k, v.tx)),
      ty: Math.min(0, Math.max(ALTO - ALTO * k, v.ty)),
    };
  }

  function aCoordSvg(clientX: number, clientY: number) {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * ANCHO,
      y: ((clientY - rect.top) / rect.height) * ALTO,
    };
  }

  function zoomEn(factor: number, cx = ANCHO / 2, cy = ALTO / 2) {
    setVista((v) => {
      const k = Math.min(K_MAX, Math.max(1, v.k * factor));
      const real = k / v.k;
      return limitar({ k, tx: cx - (cx - v.tx) * real, ty: cy - (cy - v.ty) * real });
    });
  }

  // El scroll con rueda hace zoom; se registra manualmente (no pasivo) para
  // poder evitar que la página se desplace al mismo tiempo.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const alRueda = (e: WheelEvent) => {
      e.preventDefault();
      const { x, y } = aCoordSvg(e.clientX, e.clientY);
      zoomEn(e.deltaY < 0 ? 1.25 : 0.8, x, y);
    };
    svg.addEventListener("wheel", alRueda, { passive: false });
    return () => svg.removeEventListener("wheel", alRueda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function alPresionar(e: React.PointerEvent<SVGSVGElement>) {
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    arrastre.current = { x: e.clientX, y: e.clientY, tx: vista.tx, ty: vista.ty, movido: false };
  }

  function alMover(e: React.PointerEvent<SVGSVGElement>) {
    const a = arrastre.current;
    if (!a) return;
    const dx = e.clientX - a.x;
    const dy = e.clientY - a.y;
    if (!a.movido && Math.hypot(dx, dy) < 4) return;
    a.movido = true;
    const rect = svgRef.current!.getBoundingClientRect();
    setVista((v) =>
      limitar({
        k: v.k,
        tx: a.tx + (dx / rect.width) * ANCHO,
        ty: a.ty + (dy / rect.height) * ALTO,
      }),
    );
  }

  function alSoltar(e: React.PointerEvent<SVGSVGElement>) {
    const a = arrastre.current;
    arrastre.current = null;
    if (!a || a.movido) return;
    const { x, y } = aCoordSvg(e.clientX, e.clientY);
    const mx = (x - vista.tx) / vista.k;
    const my = (y - vista.ty) / vista.k;
    const coords = proyeccion.invert?.([mx, my]);
    if (!coords) return;
    onCambiar(Math.round(coords[1] * 100) / 100, Math.round(coords[0] * 100) / 100);
  }

  const punto = proyeccion([lng, lat]);
  const escala = 1 / vista.k;

  return (
    <div className="overflow-hidden rounded-2xl border border-arena bg-[#07231b]">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          className="block aspect-[2/1] w-full cursor-crosshair touch-none select-none"
          onPointerDown={alPresionar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerLeave={() => setHover(null)}
        >
          <g transform={`translate(${vista.tx} ${vista.ty}) scale(${vista.k})`}>
            {paises?.map((d, i) => (
              <path
                key={i}
                d={d}
                fill={hover === i ? "#6fcf9e" : PALETA[i % PALETA.length]}
                stroke="#dff5e8"
                strokeOpacity={0.55}
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            ))}

            {ciudades.map((c) => {
              const p = proyeccion([c.lng, c.lat]);
              if (!p) return null;
              return (
                <g key={c.id} pointerEvents="none">
                  <circle cx={p[0]} cy={p[1]} r={4 * escala} fill="#f2c879" stroke="#07231b" strokeWidth={1 * escala} />
                  <text
                    x={p[0] + 7 * escala}
                    y={p[1] + 3.5 * escala}
                    fontSize={11 * escala}
                    fill="#fdfcf9"
                    stroke="#07231b"
                    strokeWidth={2.5 * escala}
                    paintOrder="stroke"
                  >
                    {c.nombre}
                  </text>
                </g>
              );
            })}

            {punto && (
              <g pointerEvents="none">
                <circle cx={punto[0]} cy={punto[1]} r={13 * escala} fill="#c6a664" fillOpacity={0.25} />
                <circle cx={punto[0]} cy={punto[1]} r={6 * escala} fill="#c6a664" stroke="#fff" strokeWidth={1.5 * escala} />
                <text
                  x={punto[0] + 11 * escala}
                  y={punto[1] - 8 * escala}
                  fontSize={13 * escala}
                  fontWeight={600}
                  fill="#fff"
                  stroke="#07231b"
                  strokeWidth={3 * escala}
                  paintOrder="stroke"
                >
                  {nombre || "Este destino"}
                </text>
              </g>
            )}
          </g>
        </svg>

        <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-white/20 bg-[#07231b]/80 text-crema backdrop-blur">
          <button type="button" onClick={() => zoomEn(1.6)} aria-label="Acercar" className="grid h-9 w-9 place-items-center hover:bg-white/10">
            <Plus size={16} />
          </button>
          <button type="button" onClick={() => zoomEn(1 / 1.6)} aria-label="Alejar" className="grid h-9 w-9 place-items-center border-t border-white/10 hover:bg-white/10">
            <Minus size={16} />
          </button>
          <button type="button" onClick={() => setVista(VISTA_INICIAL)} aria-label="Ver todo el mundo" className="grid h-9 w-9 place-items-center border-t border-white/10 hover:bg-white/10">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <p className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5 text-xs text-crema/70">
        <span>
          Haz clic para fijar la posición · rueda o botones para acercar · arrastra para mover
        </span>
        <span className="tabular text-crema/50">
          {lat.toFixed(2)}°, {lng.toFixed(2)}°
        </span>
      </p>
    </div>
  );
}
