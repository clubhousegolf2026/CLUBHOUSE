"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Package,
  Tag,
  CalendarRange,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, grupo: "Resumen" },
  { href: "/admin/crm", label: "CRM", icon: Users, grupo: "Ventas" },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarCheck, grupo: "Ventas" },
  { href: "/admin/paquetes", label: "Paquetes", icon: Package, grupo: "Catálogo" },
  { href: "/admin/destinos", label: "Destinos", icon: Globe2, grupo: "Catálogo" },
  { href: "/admin/tarifas", label: "Tarifas", icon: Tag, grupo: "Catálogo" },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarRange, grupo: "Catálogo" },
] as const;

const esActivo = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

export function AdminNav() {
  const pathname = usePathname();
  let grupoPrevio = "";

  return (
    <nav className="flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-0.5 lg:overflow-visible [&::-webkit-scrollbar]:hidden">
      {NAV.map(({ href, label, icon: Icon, grupo }) => {
        const activo = esActivo(pathname, href);
        const mostrarGrupo = grupo !== grupoPrevio;
        grupoPrevio = grupo;
        return (
          <div key={href} className="shrink-0 lg:shrink">
            {mostrarGrupo && (
              <p className="mb-1.5 mt-5 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-crema/35 first:mt-0 lg:block">
                {grupo}
              </p>
            )}
            <Link
              href={href}
              aria-current={activo ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                activo ? "text-white" : "text-crema/65 hover:text-white",
              )}
            >
              {activo && (
                <motion.span
                  layoutId="admin-nav-activo"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl border border-white/15 bg-gradient-to-r from-white/15 to-white/5 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.6)] backdrop-blur"
                >
                  <span className="absolute -left-px top-2 bottom-2 w-[3px] rounded-full bg-champagne shadow-[0_0_12px_2px_rgba(198,166,100,0.7)]" />
                </motion.span>
              )}
              {!activo && (
                <span className="absolute inset-0 rounded-xl bg-white/0 transition-colors group-hover:bg-white/[0.07]" />
              )}
              <Icon
                size={18}
                className={cn(
                  "relative transition-transform duration-200 group-hover:scale-110",
                  activo && "text-champagne",
                )}
              />
              <span className="relative font-medium">{label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
