import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BarChart3, ShieldCheck, Zap } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { LoginForm } from "@/components/admin/login-form";
import { signIn } from "./actions";

const MENSAJES_ERROR: Record<string, string> = {
  credenciales: "Correo o contraseña incorrectos.",
  "faltan-datos": "Escribe tu correo y tu contraseña.",
  "no-autorizado": "Esta cuenta no tiene acceso al panel.",
};

const PUNTOS = [
  { icono: BarChart3, texto: "Leads del sitio ordenados por etapa del embudo" },
  { icono: Zap, texto: "Reservas y estado de pago en un solo lugar" },
  { icono: ShieldCheck, texto: "Acceso restringido al equipo de Clubhouse" },
];

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const mensaje = error ? MENSAJES_ERROR[error] : undefined;

  return (
    <div className="admin-side min-h-screen">
      <Image
        src="/fotos/dubai-creek.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[center_60%] opacity-30"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-[#061a13]/90 via-[#0a241b]/80 to-[#0a241b]/60"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_440px]">
        <div className="entra hidden lg:block">
          <Logo variante="claro" />
          <h1 className="mt-10 max-w-lg font-serif text-5xl leading-[1.08] text-white">
            Cada lead y cada reserva, <span className="texto-oro">bajo control.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-crema/70">
            Panel interno del equipo Clubhouse: siga los contactos que llegan
            del sitio y confirme las reservas.
          </p>
          <ul className="mt-10 space-y-4">
            {PUNTOS.map(({ icono: Icono, texto }, i) => (
              <li
                key={texto}
                className="entra flex items-center gap-3 text-crema/85"
                style={{ "--i": i + 2 } as React.CSSProperties}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/[0.07] text-champagne backdrop-blur">
                  <Icono size={18} />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="entra rounded-[2rem] border border-white/15 bg-white/[0.08] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          <div className="lg:hidden">
            <Logo variante="claro" />
          </div>
          <h2 className="mt-6 font-serif text-3xl text-white lg:mt-0">
            Bienvenido de vuelta
          </h2>
          <p className="mt-1.5 text-sm text-crema/65">
            Entra con tu cuenta del equipo para ver el panel.
          </p>
          <LoginForm action={signIn} mensaje={mensaje} />
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-sm text-crema/55 transition-colors hover:text-[#ecd396]"
          >
            <ArrowLeft size={15} /> Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}
