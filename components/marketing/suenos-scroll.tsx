"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Oro } from "@/components/marketing/pagina-hero";
import { SeccionSuenos } from "@/components/marketing/secciones-marca";
import { MARCA, SUENOS } from "@/lib/contenido/clubhouse";

/** Tramo de scroll (0 → 1) donde van apareciendo los elementos: primero se
 *  ve solo la foto, después cada frase, y al final el cierre de marca. */
const INICIO = 0.08;
const PASO = 0.15;
const REVELA = 0.09;
const ELEMENTOS = SUENOS.length + 1;

/** Scrollytelling de "Los sueños del golfista": la sección queda fija
 *  (sticky) con la foto de La Hacienda Alcaidesa y, a medida que se hace
 *  scroll, van apareciendo las frases una a una. Con "reducir movimiento"
 *  se muestra la sección estática de siempre. */
export function SuenosScroll({ children }: { children?: React.ReactNode }) {
  const reducir = useReducedMotion();
  if (reducir) {
    return (
      <>
        <SeccionSuenos />
        {children}
      </>
    );
  }
  return <Escenario>{children}</Escenario>;
}

/** Distancia de scroll de las frases (en dvh) y de la "cortina" final en la
 *  que `children` sube y cubre la escena fija. */
const DIST_FRASES = (ELEMENTOS + 1.5) * 85 - 100;
const DIST_CORTINA = 100;
const FRACCION_FRASES = DIST_FRASES / (DIST_FRASES + DIST_CORTINA);

function Escenario({ children }: { children?: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: total } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // Las frases terminan de aparecer antes de que empiece la cortina.
  const p = useTransform(total, [0, FRACCION_FRASES], [0, 1], { clamp: true });

  const zoom = useTransform(p, [0, 1], [1.05, 1]);
  const velo = useTransform(p, [0, INICIO + PASO * 1.5], [0.12, 0.82]);
  const barra = useTransform(p, [0, 1], [0, 1]);

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="suenos"
        ref={ref}
        className="relative scroll-mt-0 bg-[#04140e]"
        style={{ height: `${DIST_FRASES + DIST_CORTINA + 100}dvh` }}
        aria-label="Los sueños del golfista"
      >
        <div className="sticky top-0 isolate flex h-dvh flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center text-crema sm:px-10">
          {/* La foto original mide 906×1280 px: estirada a pantalla completa se
              pixela. Se muestra a su tamaño real (nítida, con los bordes
              difuminados) sobre una copia desenfocada que rellena el resto. */}
          <m.div style={{ scale: zoom }} className="absolute inset-0 -z-20">
            <Image
              src="/fotos/alcaidesa.webp"
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              className="scale-110 object-cover object-[center_30%] opacity-70 blur-2xl"
            />
            <div className="absolute inset-y-0 left-1/2 w-full max-w-[906px] -translate-x-1/2 [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]">
              <Image
                src="/fotos/alcaidesa.webp"
                alt="Golfista en el green de La Hacienda Alcaidesa, Cádiz"
                fill
                priority
                quality={95}
                sizes="906px"
                className="object-cover object-[center_30%]"
              />
            </div>
          </m.div>
          <m.div
            aria-hidden
            style={{ opacity: velo }}
            className="absolute inset-0 -z-10 bg-[#04140e]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[#04140e]/70 via-transparent to-[#04140e]/80"
          />

          <span className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em] text-[#e8d3a0]">
            <span className="h-px w-8 bg-current opacity-60" />
            Los sueños del golfista
            <span className="h-px w-8 bg-current opacity-60" />
          </span>

          <div className="mt-[3vh] w-full max-w-4xl">
            <ul className="space-y-[2.6vh]">
              {SUENOS.map((s, i) => (
                <Frase key={s} texto={s} i={i} p={p} />
              ))}
            </ul>
            <Cierre p={p} />
          </div>

          <m.div
            aria-hidden
            style={{ scaleX: barra }}
            className="absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-[#c6a664] to-[#ecd396]"
          />
        </div>
      </section>

      {children && (
        <div className="relative z-10 -mt-[100dvh] rounded-t-[2.5rem] bg-blanco-roto shadow-[0_-40px_80px_-20px_rgba(0,0,0,0.55)]">
          {children}
        </div>
      )}
    </LazyMotion>
  );
}

const TEXTO = "text-[clamp(1.02rem,2.55vh+0.35vw,1.65rem)] leading-snug";

function Frase({ texto, i, p }: { texto: string; i: number; p: MotionValue<number> }) {
  const inicio = INICIO + i * PASO;
  const opacidad = useTransform(
    p,
    [inicio, inicio + REVELA, inicio + PASO + REVELA],
    [0, 1, 0.6],
  );
  const y = useTransform(p, [inicio, inicio + REVELA], [36, 0]);

  return (
    <m.li
      style={{ opacity: opacidad, y }}
      className={`font-serif italic text-crema ${TEXTO}`}
    >
      {texto}
    </m.li>
  );
}

function Cierre({ p }: { p: MotionValue<number> }) {
  const inicio = INICIO + SUENOS.length * PASO;
  const opacidad = useTransform(p, [inicio, inicio + REVELA], [0, 1]);
  const y = useTransform(p, [inicio, inicio + REVELA], [36, 0]);

  return (
    <m.div style={{ opacity: opacidad, y }} className="mt-[3.4vh] border-t border-white/20 pt-[3vh]">
      <p className="font-serif text-[clamp(1.2rem,3.1vh+0.5vw,2rem)] leading-snug text-white">
        Hay miles de sueños e historias como estas. <Oro>Clubhouse</Oro> las convierte en su
        próximo viaje.
      </p>
      <p className="mt-[1.6vh] text-xs uppercase tracking-[0.2em] text-crema/55">
        {MARCA.director} · Director
      </p>
    </m.div>
  );
}
