import Image from "next/image";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "./actions";

const MENSAJES_ERROR: Record<string, string> = {
  credenciales: "Correo o contraseña incorrectos.",
  "faltan-datos": "Escribe tu correo y tu contraseña.",
  "no-autorizado": "Esta cuenta no tiene acceso al panel.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const mensaje = error ? MENSAJES_ERROR[error] : undefined;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Columna de marca: foto de golf a pantalla completa, solo en
          desktop — en móvil el formulario ocupa toda la pantalla. */}
      <div className="relative hidden overflow-hidden bg-verde-calle lg:block">
        <Image
          src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=1600&auto=format&fit=crop"
          alt="Green de golf al atardecer"
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,61,46,.15) 0%, rgba(9,50,38,.55) 55%, rgba(9,50,38,.92) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-champagne">
            <Flag size={16} /> Club House
          </span>
          <div>
            <h1 className="max-w-md font-serif text-4xl leading-tight text-crema">
              El panel que mueve cada reserva de golf.
            </h1>
            <p className="mt-4 max-w-sm text-crema/75">
              Pipeline de leads, cotizaciones y confirmaciones de pago — todo
              en un solo lugar para el equipo.
            </p>
          </div>
        </div>
      </div>

      {/* Columna del formulario */}
      <div className="flex items-center justify-center bg-blanco-roto px-6 py-16">
        <div className="w-full max-w-sm">
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-champagne lg:hidden">
            <Flag size={13} /> Club House
          </span>
          <h2 className="mt-2 font-serif text-3xl text-carbon lg:mt-0">
            Bienvenido de vuelta
          </h2>
          <p className="mt-1 text-sm text-niebla">
            Entra con tu cuenta del equipo para ver el panel.
          </p>

          <form action={signIn} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-carbon">Correo</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@clubhouse.com"
                className="mt-1.5 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-verde-golf focus:ring-2 focus:ring-verde-golf/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-carbon">
                Contraseña
              </span>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-verde-golf focus:ring-2 focus:ring-verde-golf/20"
              />
            </label>

            {mensaje && (
              <p
                role="status"
                className="rounded-[var(--radius-control)] bg-error/10 px-3 py-2 text-sm text-error"
              >
                {mensaje}
              </p>
            )}

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
