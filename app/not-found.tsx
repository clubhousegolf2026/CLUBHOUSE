import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fraunces, inter } from "@/lib/fonts";
import { Logo } from "@/components/site/logo";
import "./globals.css";

/** 404 global (URLs que no coinciden con ninguna ruta). Al haber varios
 *  layouts raíz, Next envuelve esta página en su layout por defecto, que ya
 *  aporta <html>/<body>: por eso las fuentes se aplican aquí, en la sección. */
export default function NotFound() {
  return (
    <section
      className={`${fraunces.variable} ${inter.variable} grano relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#071d16] px-6 text-center font-sans text-crema`}
    >
      <div className="hero-degradado absolute inset-0 -z-20" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="orbita orbita-gira aspect-square w-[420px]" />
        <div className="orbita orbita-gira-inversa aspect-square w-[680px] !border-white/10" />
      </div>

      <Logo variante="claro" />
      <p className="mt-10 font-serif text-[6rem] leading-none texto-oro sm:text-[9rem]">
        404
      </p>
      <h1 className="mt-2 font-serif text-3xl text-white sm:text-4xl">
        No encontramos esa página
      </h1>
      <p className="mx-auto mt-4 max-w-md text-crema/70">
        Puede que el enlace esté roto o que el contenido se haya movido.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="boton-oro group inline-flex min-h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold"
        >
          Volver al inicio
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/paquetes"
          className="boton-cristal inline-flex min-h-12 items-center rounded-full px-8 text-sm font-medium"
        >
          Ver paquetes
        </Link>
      </div>
    </section>
  );
}
