"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { Plane } from "lucide-react";

// Un único reloj para todo: cuánto dura el vuelo del avión y, con el mismo
// ritmo, el fundido del contenido — así ambos se sienten como una sola
// transición, no dos animaciones corriendo por separado.
const DURACION_VUELO = 1.6;

/** Transición entre páginas: la vista saliente se desvanece y sube
 *  levemente mientras la entrante aparece con un pequeño desplazamiento, y
 *  un avión cruza la pantalla de esquina a esquina — como si el cambio de
 *  ruta fuera, literalmente, el viaje. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const primerRender = useRef(true);
  const pathnameAnterior = useRef(pathname);
  const [volando, setVolando] = useState(false);

  // El avión solo vuela al salir de la home (donde vive el globo) — el
  // resto de la navegación del sitio usa solo el fundido, sin el efecto.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      pathnameAnterior.current = pathname;
      return;
    }
    if (pathnameAnterior.current === "/") {
      setVolando(true);
      const t = setTimeout(() => setVolando(false), DURACION_VUELO * 1000 + 300);
      pathnameAnterior.current = pathname;
      return () => clearTimeout(t);
    }
    pathnameAnterior.current = pathname;
  }, [pathname]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {volando && (
          <m.div
            key="avion-overlay"
            className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <m.div
              className="absolute text-champagne drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
              initial={{ x: "-10vw", y: "70vh", opacity: 0, rotate: -18 }}
              animate={{ x: "110vw", y: "-15vh", opacity: 1, rotate: -18 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: DURACION_VUELO,
                ease: "easeInOut",
                opacity: { duration: DURACION_VUELO * 0.25 },
              }}
            >
              <Plane size={42} strokeWidth={1.5} />
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: DURACION_VUELO * 0.5, ease: "easeInOut" }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}
