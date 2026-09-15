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
    <div className="flex min-h-screen items-center justify-center bg-verde-calle px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-panel)] bg-blanco-roto p-8 shadow-[var(--shadow-elevada)]">
        <h1 className="font-serif text-2xl text-carbon">Club House</h1>
        <p className="mt-1 text-sm text-niebla">Panel de administración</p>

        <form action={signIn} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-carbon">Correo</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf"
            />
          </label>
          <label className="block">
            <span className="text-sm text-carbon">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf"
            />
          </label>

          {mensaje && (
            <p role="status" className="text-sm text-error">
              {mensaje}
            </p>
          )}

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
