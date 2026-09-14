"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { GlobeMethods, GlobeProps } from "react-globe.gl";
import type * as ThreeNS from "three";
import { geoDistance } from "d3-geo";
import type { PaquetePredefinido, Destino } from "@/lib/data/types";

type DestinoConPaquetes = Destino & { paquetes: PaquetePredefinido[] };

// react-globe.gl usa WebGL/three.js: se importa solo en el navegador,
// evitando el wrapper de next/dynamic para que el ref llegue sin problemas.
type GlobeComponent = ComponentType<
  GlobeProps & { ref?: React.Ref<GlobeMethods> }
>;

interface PuntoGlobo {
  lat: number;
  lng: number;
  destino: DestinoConPaquetes;
  indice: number;
}

const COLOR_OCEANO = "#07231b";

// Vista inicial: apunta a Colombia, sin acercar.
const VISTA_INICIAL = { lat: 6, lng: -78, altitude: 2.1 };

// Cada destino disponible toma un color distinto de banderín, para que se
// distingan a simple vista sobre el globo. Los no disponibles siempre van
// en gris, sin importar el índice.
const PALETA_BANDERAS = [
  "#e2723d",
  "#f2955a",
  "#c65a26",
  "#f6a94e",
  "#d9702f",
  "#eb8b3f",
  "#c76b3c",
  "#f7b06a",
];

// Paleta de verdes de marca — cada país toma un tono distinto para que se
// note su división, sin salirse de la gama verde/dorada de Club House.
const PALETA_TIERRA = [
  "#2f8a63",
  "#3fa377",
  "#25714f",
  "#4bb389",
  "#1e6045",
  "#5bc394",
  "#347a5a",
  "#6fcf9e",
  "#2a6b4a",
  "#4d9b6f",
];


/** Textura sólida generada en canvas: sin fotografía, sin fronteras políticas,
 *  sin bandas de vegetación — solo el color de océano de la marca. */
function texturaOceano(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = COLOR_OCEANO;
  ctx.fillRect(0, 0, 2, 2);
  return canvas.toDataURL();
}

export function Globo3D({
  destinos,
  seleccionId,
  onSeleccion,
  onAbrirLista,
}: {
  destinos: DestinoConPaquetes[];
  seleccionId?: string | null;
  onSeleccion: (d: DestinoConPaquetes | null) => void;
  onAbrirLista: () => void;
}) {
  const globoRef = useRef<GlobeMethods | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  // Tamaño fijo por punto de quiebre (no escala continuamente con el contenedor).
  const [tamano, setTamano] = useState(660);
  const [listo, setListo] = useState(false);
  const [Globe, setGlobe] = useState<GlobeComponent | null>(null);
  const [THREE, setTHREE] = useState<typeof ThreeNS | null>(null);
  const [oceano, setOceano] = useState<string | null>(null);
  const [tierra, setTierra] = useState<object[] | null>(null);
  // Registro de banderines vivos para animar el ondeo: los Sprites no
  // disparan onBeforeRender en three.js, así que se redibuja su textura
  // a mano en un rAF propio del componente.
  const banderasRef = useRef<Map<string, BanderaAnimada>>(new Map());
  // Un mismo clic físico puede disparar a la vez el clic del banderín
  // (objeto) y el del país/globo bajo él (varias capas de raycasting).
  // Este marcador de tiempo hace que el banderín siempre gane: si ya se
  // resolvió por objeto, se ignora el país/globo del mismo instante.
  const clicPorObjetoRef = useRef(0);

  // Carga perezosa en el cliente: react-globe.gl y three tocan `window`/WebGL.
  useEffect(() => {
    let activo = true;
    Promise.all([import("react-globe.gl"), import("three")]).then(
      ([globeMod, threeMod]) => {
        if (!activo) return;
        setGlobe(() => globeMod.default as unknown as GlobeComponent);
        setTHREE(threeMod);
      },
    );
    setOceano(texturaOceano());
    return () => {
      activo = false;
    };
  }, []);

  // Continentes como un único color plano, sin fronteras internas de país:
  // se generan a partir del mismo topojson mundial, con relleno uniforme.
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
      ) as unknown as { features: object[] };
      // Cada país guarda su propio tono de verde (estable: no cambia en cada
      // render) para que la división entre países se note por color.
      const conColor = geo.features.map((f, i) => ({
        ...f,
        color: PALETA_TIERRA[i % PALETA_TIERRA.length],
      }));
      setTierra(conColor);
    });
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const aplicar = () =>
      setTamano(mq.matches ? 660 : mqLg.matches ? 540 : 380);
    aplicar();
    mq.addEventListener("change", aplicar);
    mqLg.addEventListener("change", aplicar);
    return () => {
      mq.removeEventListener("change", aplicar);
      mqLg.removeEventListener("change", aplicar);
    };
  }, []);

  // Configuración inicial: apunta a Colombia y gira solo muy despacio por su
  // cuenta — el usuario puede arrastrarlo para tomar el control en cualquier
  // momento (OrbitControls pausa el auto-giro mientras se interactúa).
  useEffect(() => {
    const g = globoRef.current;
    if (!g || listo) return;
    g.pointOfView(VISTA_INICIAL, 0);
    const controls = g.controls() as unknown as {
      autoRotate: boolean;
      autoRotateSpeed: number;
      enableZoom: boolean;
      enablePan: boolean;
      minDistance: number;
      maxDistance: number;
    };
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.12;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 190;
    controls.maxDistance = 420;
    setListo(true);
  }, [listo, tamano, Globe]);

  // El auto-giro se detiene apenas hay un destino seleccionado (tarjeta
  // abierta) y se retoma al cerrarla — no tiene sentido que el globo siga
  // girando con la tarjeta de detalle encima.
  useEffect(() => {
    if (!listo) return;
    const g = globoRef.current;
    if (!g) return;
    const controls = g.controls() as unknown as { autoRotate: boolean };
    controls.autoRotate = !seleccionId;
  }, [listo, seleccionId]);

  // Clic fuera del globo (en cualquier otra parte de la página): vuelve a
  // la vista inicial y cierra la tarjeta de detalle, como si nunca se
  // hubiera tocado el globo.
  useEffect(() => {
    if (!listo) return;
    const alClicarFuera = (e: MouseEvent) => {
      if (contenedorRef.current?.contains(e.target as Node)) return;
      globoRef.current?.pointOfView(VISTA_INICIAL, 500);
      onSeleccion(null);
    };
    document.addEventListener("click", alClicarFuera);
    return () => document.removeEventListener("click", alClicarFuera);
  }, [listo, onSeleccion]);

  // Bucle de ondeo: repinta cada banderín registrado en cada frame.
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    let raf = 0;
    const inicio = performance.now();
    const tick = () => {
      const t = (performance.now() - inicio) / 1000;
      banderasRef.current.forEach((b) => {
        dibujarBandera(b.ctx, b.color, t);
        b.texture.needsUpdate = true;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const puntos: PuntoGlobo[] = destinos.map((d, i) => ({
    lat: d.coordenadas[1],
    lng: d.coordenadas[0],
    destino: d,
    indice: i,
  }));

  function alHacerClick(punto: PuntoGlobo) {
    // Si ya estaba seleccionado, cerrar de una vez (sin esperar animación).
    if (seleccionId === punto.destino.id) {
      onSeleccion(null);
      return;
    }

    const g = globoRef.current;
    const DURACION_ZOOM = 550;
    if (g) {
      // Zoom de verdad al país, no solo un giro: acerca la cámara hasta
      // casi rozar la superficie para que el país se vea grande y claro.
      g.pointOfView(
        { lat: punto.lat, lng: punto.lng, altitude: 0.75 },
        DURACION_ZOOM,
      );
    }
    // La tarjeta se muestra DESPUÉS del zoom, no antes: si apareciera de
    // inmediato taparía el globo con su fondo oscuro y el acercamiento
    // quedaría oculto detrás de ella.
    window.setTimeout(() => onSeleccion(punto.destino), DURACION_ZOOM + 80);
  }

  // Clic en un banderín concreto: va directo al detalle de ESE destino (es
  // una elección explícita, sin ambigüedad posible).
  const UMBRAL_CERCANIA = 0.35; // radianes ≈ 20°, separa bien los clústeres
  function alTocarBandera(lat: number, lng: number) {
    let mejor: PuntoGlobo | null = null;
    let mejorDistancia = Infinity;
    for (const p of puntos) {
      const d = geoDistance([lng, lat], [p.lng, p.lat]);
      if (d < mejorDistancia) {
        mejorDistancia = d;
        mejor = p;
      }
    }

    if (mejor && mejorDistancia < UMBRAL_CERCANIA) {
      alHacerClick(mejor);
      return;
    }

    const g = globoRef.current;
    if (g) g.pointOfView({ lat, lng, altitude: 0.6 }, 450);
  }

  // Clic en tierra, país u océano — no en un banderín puntual: un país
  // como Colombia agrupa varios destinos, así que en vez de adivinar cuál
  // quería el usuario, se acerca la vista y se abre la lista completa para
  // que elija entre todas las opciones de esa zona.
  function alTocarZona(lat: number, lng: number) {
    const g = globoRef.current;
    const DURACION_ZOOM = 550;
    if (g) g.pointOfView({ lat, lng, altitude: 0.75 }, DURACION_ZOOM);
    window.setTimeout(() => onAbrirLista(), DURACION_ZOOM + 80);
  }

  // OJO: no se usa el `d` (dato) que entrega onObjectClick para identificar
  // el destino — tras la primera selección, la librería puede des-asociar
  // el dato del sprite realmente clicado (bug reproducido: todos los clics
  // posteriores devolvían el mismo destino sin importar cuál se tocara).
  // Las coordenadas del clic sí son siempre correctas, así que se resuelve
  // el destino más cercano a ellas.
  function alClicarBandera(coords: { lat: number; lng: number }) {
    clicPorObjetoRef.current = Date.now();
    alTocarBandera(coords.lat, coords.lng);
  }

  function alClicarPais(
    _polygon: object,
    _evento: MouseEvent,
    coords: { lat: number; lng: number; altitude: number },
  ) {
    if (Date.now() - clicPorObjetoRef.current < 60) return;
    alTocarZona(coords.lat, coords.lng);
  }

  function alClicarGlobo(coords: { lat: number; lng: number }) {
    if (Date.now() - clicPorObjetoRef.current < 60) return;
    alTocarZona(coords.lat, coords.lng);
  }

  return (
    <div
      ref={contenedorRef}
      className="relative mx-auto"
      style={{ width: tamano, height: tamano }}
    >
      {Globe && oceano && THREE && (
        <Globe
          ref={globoRef}
          width={tamano}
          height={tamano}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={oceano}
          onGlobeClick={alClicarGlobo}
          showAtmosphere
          atmosphereColor="#c6a664"
          atmosphereAltitude={0.2}
          polygonsData={tierra ?? []}
          polygonCapColor={(f) => (f as { color: string }).color}
          polygonSideColor={(f) => (f as { color: string }).color}
          polygonStrokeColor="#0b3d2e"
          polygonAltitude={0.004}
          polygonsTransitionDuration={0}
          onPolygonClick={alClicarPais}
          objectsData={puntos}
          objectLat="lat"
          objectLng="lng"
          objectAltitude={0.01}
          // Sprites reales (no DOM): siempre miran a la cámara, así el
          // banderín nunca se ve inclinado o deformado según la posición
          // en la esfera — el problema de los marcadores HTML anteriores.
          objectThreeObject={(d: object) =>
            crearBanderaSprite(
              THREE,
              d as PuntoGlobo,
              seleccionId,
              banderasRef.current,
            )
          }
          onObjectClick={(_d, _evento, coords) => alClicarBandera(coords)}
        />
      )}
    </div>
  );
}

interface BanderaAnimada {
  ctx: CanvasRenderingContext2D;
  texture: ThreeNS.CanvasTexture;
  color: string;
}

const BANDERA_W = 96;
const BANDERA_H = 128;

/** Dibuja el banderín completo (sombra, green, asta y tela ondulando)
 *  en el instante `t` (segundos). Se llama en cada frame para animar. */
function dibujarBandera(
  ctx: CanvasRenderingContext2D,
  colorBandera: string,
  t: number,
) {
  const W = BANDERA_W;
  const H = BANDERA_H;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2;
  const baseY = H - 16;

  // sombra
  ctx.fillStyle = "rgba(0,0,0,.35)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY + 3, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // green (base)
  ctx.fillStyle = "#1c5f48";
  ctx.strokeStyle = "#fbfaf7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, baseY, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // asta
  ctx.strokeStyle = "#fbfaf7";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, 10);
  ctx.lineTo(cx, baseY);
  ctx.stroke();

  // Banderín ondulando: se arma con N secciones verticales entre el asta
  // (f=0, sin movimiento — está cosida al palo) y la punta libre (f=1,
  // máxima amplitud), como una tela real que ondea con el viento.
  const N = 10;
  const largo = 42; // alcance horizontal de la tela
  const amplitudMax = 4.5;
  const velocidad = 3.2;
  const frecuencia = 5.5;

  const topPole = 8;
  const bottomPole = 40;
  const tipY = 24;

  const puntosArriba: [number, number][] = [];
  const puntosAbajo: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    const x = cx + f * largo;
    const onda = amplitudMax * f * Math.sin(t * velocidad - f * frecuencia);
    puntosArriba.push([x, topPole + f * (tipY - topPole) + onda]);
    puntosAbajo.push([x, bottomPole + f * (tipY - bottomPole) + onda]);
  }

  ctx.fillStyle = colorBandera;
  ctx.strokeStyle = "#0b3d2e";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  puntosArriba.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  for (let i = puntosAbajo.length - 1; i >= 0; i--) {
    ctx.lineTo(puntosAbajo[i][0], puntosAbajo[i][1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/**
 * Crea el banderín de golf como THREE.Sprite (billboard real que siempre
 * mira a la cámara — por eso no se deforma según la posición en la esfera,
 * a diferencia de los marcadores HTML que usaban matrices 3D) y registra su
 * textura para que el bucle de animación del componente la haga ondear.
 */
function crearBanderaSprite(
  THREE: typeof ThreeNS,
  d: PuntoGlobo,
  seleccionId: string | null | undefined,
  registro: Map<string, BanderaAnimada>,
): ThreeNS.Object3D {
  const activo = seleccionId === d.destino.id;
  const colorBandera = PALETA_BANDERAS[d.indice % PALETA_BANDERAS.length];

  const W = BANDERA_W;
  const H = BANDERA_H;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);
  dibujarBandera(ctx, colorBandera, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  registro.set(d.destino.id, { ctx, texture, color: colorBandera });

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);

  const escala = activo ? 13 : 9.5;
  sprite.scale.set(escala * (W / H), escala, 1);
  // El ancla queda en la base del asta (donde toca el globo), no al centro.
  sprite.center.set(0.5, (H - (H - 16) + 6) / H);

  return sprite;
}
