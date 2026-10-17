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
export function SuenosScroll() {
  const reducir = useReducedMotion();
  if (reducir) return <SeccionSuenos />;
  return <Escenario />;
}

function Escenario() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const zoom = useTransform(p, [0, 1], [1.14, 1]);
  const velo = useTransform(p, [0, INICIO + PASO * 1.5], [0.12, 0.82]);
  const barra = useTransform(p, [0, 1], [0, 1]);

  return (
    <LazyMotion features={domAnimation}>
      <section
        id="suenos"
        ref={ref}
        className="relative scroll-mt-0 bg-[#04140e]"
        style={{ height: `${(ELEMENTOS + 1.5) * 85}vh` }}
        aria-label="Los sueños del golfista"
      >
        <div className="sticky top-0 isolate flex h-dvh flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center text-crema sm:px-10">
          <m.div style={{ scale: zoom }} className="absolute inset-0 -z-20">
            <Image
              src="/fotos/alcaidesa.webp"
              alt="Golfista en el green de La Hacienda Alcaidesa, Cádiz"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_30%]"
            />
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
