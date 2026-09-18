"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/** Envuelve una sección para que reaccione al scroll en tiempo real: entra
 *  con un fundido + desplazamiento + leve escala mientras cruza la mitad
 *  inferior del viewport, ligado directamente a la posición de scroll (no
 *  a un solo disparo), así el cambio de sección se siente continuo. */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 100%", "start 25%"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [70, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}
