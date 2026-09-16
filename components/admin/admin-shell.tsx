import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Package,
  Tag,
  CalendarRange,
  Globe2,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/admin/(panel)/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/crm", label: "CRM", icon: Users },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/paquetes", label: "Paquetes", icon: Package },
  { href: "/admin/destinos", label: "Destinos", icon: Globe2 },
  { href: "/admin/tarifas", label: "Tarifas", icon: Tag },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarRange },
] as const;

export function AdminShell({
  nombre,
  children,
}: {
  nombre: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-crema lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="flex flex-col justify-between border-b border-arena bg-verde-calle px-4 py-5 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div>
          <Link href="/admin" className="block font-serif text-lg text-crema">
            Club House
            <span className="ml-2 text-xs font-sans font-normal text-crema/60">
              admin
            </span>
          </Link>
          <nav className="mt-8 flex gap-1 lg:flex-col">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm text-crema/80 transition-colors hover:bg-crema/10 hover:text-crema"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 hidden lg:block">
          <p className="truncate text-xs text-crema/50">{nombre}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-2 flex items-center gap-2 text-sm text-crema/70 hover:text-crema"
            >
              <LogOut size={16} /> Salir
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-arena bg-blanco-roto px-6 py-3 lg:hidden">
          <span className="truncate text-sm text-niebla">{nombre}</span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-niebla hover:text-carbon">
              Salir
            </button>
          </form>
        </header>
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
