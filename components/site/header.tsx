"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/site/logo";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/#planes", label: "Experiencias" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

const esActivo = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function Header() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [oculto, setOculto] = useState(false);
  const ultimoY = useRef(0);

  useEffect(() => {
    const alScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Se esconde al bajar y reaparece al subir.
      if (Math.abs(y - ultimoY.current) > 8) {
        setOculto(y > ultimoY.current && y > 260);
        ultimoY.current = y;
      }
    };
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  // Deja constancia en <html> para que otros elementos fijos (p. ej. la barra de
  // secciones de un viaje) suban cuando el encabezado se esconde.
  useEffect(() => {
    document.documentElement.dataset.cabecera = oculto && !abierto ? "oculta" : "visible";
  }, [oculto, abierto]);

  // Cierra el menú móvil si la ventana crece hasta el breakpoint de escritorio.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const cerrar = () => setAbierto(false);
    mq.addEventListener("change", cerrar);
    return () => mq.removeEventListener("change", cerrar);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      {/* Píldora oscura flotante, separada del borde en todas las
          resoluciones — la marca vive siempre sobre el mismo fondo carbón,
          sin depender del contenido que haya detrás. */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-transparent px-3 pt-3 transition-transform duration-500 ease-out sm:px-5 sm:pt-4",
          oculto && !abierto && "-translate-y-[130%]",
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-16 max-w-[1600px] items-center justify-between rounded-full border md:grid md:grid-cols-[1fr_auto_1fr] pl-2 pr-2 backdrop-blur-xl transition-all duration-500 sm:pl-3 sm:pr-3",
            scrolled
              ? "border-white/15 bg-[#0a2a20]/95 shadow-[0_18px_50px_-14px_rgba(0,0,0,0.65)]"
              : "border-white/10 bg-[#0a2a20]/85 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.4)]",
          )}
        >
          <Link
            href="/"
            aria-label="Clubhouse · inicio"
            className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pl-1.5 pr-3 hover:bg-crema/10"
          >
            <Logo variante="claro" />
          </Link>

          <nav
            onMouseLeave={() => setHover(null)}
            className="hidden items-center gap-0.5 md:flex"
            aria-label="Principal"
          >
            {NAV.map((item) => {
              const activo = esActivo(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHover(item.href)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-champagne/70",
                    activo ? "text-[#ecd396]" : "text-crema/75 hover:text-white",
                  )}
                >
                  {(hover === item.href || (!hover && activo)) && (
                    <m.span
                      layoutId="nav-halo"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 -z-10 rounded-full bg-white/10 ring-1 ring-white/10"
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center justify-end gap-2 md:flex">
            <Link
              href="/admin/login"
              aria-label="Panel de administración"
              title="Panel de administración"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-crema/70 transition-colors hover:bg-crema/10 hover:text-crema"
            >
              <LayoutDashboard size={17} />
            </Link>
          </div>

          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-crema/10 text-crema transition-colors hover:bg-crema/20 md:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={abierto}
          >
            {abierto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menú móvil: tarjeta oscura flotante independiente, como la
            píldora de arriba — no un dropdown pegado al header. */}
        <AnimatePresence>
          {abierto && (
            <m.nav
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label="Móvil"
              className="mx-auto mt-2 max-w-[1600px] overflow-hidden rounded-3xl border border-white/10 bg-[#0a2a20]/95 p-2 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-xl md:hidden"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setAbierto(false)}
                  className={cn(
                    "block rounded-2xl px-5 py-3.5 text-center text-lg font-medium transition-colors",
                    esActivo(pathname, item.href)
                      ? "bg-crema/10 text-champagne"
                      : "text-crema/85 hover:bg-crema/5",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                onClick={() => setAbierto(false)}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-sm text-crema/60 hover:bg-crema/5"
              >
                <LayoutDashboard size={15} /> Panel de administración
              </Link>
            </m.nav>
          )}
        </AnimatePresence>
      </header>
    </LazyMotion>
  );
}
