"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { NAV } from "@/components/admin/admin-nav";

/** Barra superior pegajosa y translúcida: sección actual, fecha y acceso
 *  directo al sitio público. */
export function AdminTopbar({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    const f = new Intl.DateTimeFormat("es-CO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
    setFecha(f.charAt(0).toUpperCase() + f.slice(1));
  }, []);

  const seccion =
    [...NAV]
      .reverse()
      .find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)))
      ?.label ?? "Panel";
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-arena/70 bg-crema/70 px-10 py-3.5 backdrop-blur-xl lg:flex">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-champagne">
          Panel Club House
        </p>
        <p className="font-serif text-lg leading-tight text-carbon">{seccion}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-niebla xl:block" suppressHydrationWarning>
          {fecha}
        </span>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-arena bg-white/70 px-3.5 py-1.5 text-sm text-carbon transition hover:border-verde-golf/50 hover:text-verde-golf"
        >
          Ver sitio <ExternalLink size={13} />
        </Link>
        <span
          title={nombre}
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-verde-golf to-verde-calle text-xs font-semibold text-crema ring-2 ring-white"
        >
          {iniciales || "CH"}
        </span>
      </div>
    </header>
  );
}
