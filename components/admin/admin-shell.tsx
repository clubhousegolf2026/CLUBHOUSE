import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/admin/(panel)/actions";
import { Logo } from "@/components/site/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ContenidoAdmin } from "@/components/admin/contenido-admin";

export function AdminShell({
  nombre,
  children,
}: {
  nombre: string;
  children: React.ReactNode;
}) {
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="admin-fondo min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="admin-side flex flex-col justify-between px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto lg:border-r lg:border-white/5 lg:px-5 lg:py-6">
        <div>
          <div className="flex items-center justify-between">
            <Link href="/admin" className="block">
              <Logo variante="claro" />
            </Link>
            <form action={signOut} className="lg:hidden">
              <button
                type="submit"
                aria-label="Salir"
                className="grid h-9 w-9 place-items-center rounded-full text-crema/70 hover:bg-white/10 hover:text-white"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
          <p className="mt-2 hidden text-[11px] uppercase tracking-[0.2em] text-champagne/80 lg:block">
            Panel de administración
          </p>
          <div className="mt-5 lg:mt-8">
            <AdminNav />
          </div>
        </div>

        <div className="mt-8 hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur lg:block">
          <div className="flex items-center gap-3">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-champagne to-[#7d6230] text-sm font-semibold text-white">
              {iniciales || "CH"}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#10352a] bg-emerald-400" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{nombre}</p>
              <p className="text-xs text-crema/50">En línea</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-sm text-crema/75 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <AdminTopbar nombre={nombre} />
        <main className="admin-contenido flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <ContenidoAdmin>{children}</ContenidoAdmin>
        </main>
      </div>
    </div>
  );
}
