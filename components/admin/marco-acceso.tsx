import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/site/logo";

/** Marco oscuro y de vidrio de las pantallas de acceso (recuperar y crear contraseña). */
export function MarcoAcceso({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <div className="admin-side grid min-h-screen place-items-center px-6 py-12">
      <Image src="/fotos/dubai-creek.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[center_60%] opacity-30" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-[#061a13]/90 via-[#0a241b]/80 to-[#0a241b]/60" />
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/[0.08] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-10">
        <Logo variante="claro" />
        <h1 className="mt-6 font-serif text-3xl text-white">{titulo}</h1>
        {descripcion && <p className="mt-1.5 text-sm text-crema/65">{descripcion}</p>}
        <div className="mt-7">{children}</div>
        <Link href="/admin/login" className="mt-6 inline-flex items-center gap-2 text-sm text-crema/55 transition-colors hover:text-[#ecd396]">
          <ArrowLeft size={15} /> Volver a entrar
        </Link>
      </div>
    </div>
  );
}

export const campoAcceso =
  "h-12 w-full rounded-xl border border-white/15 bg-white/[0.07] px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-champagne/70 focus:bg-white/[0.11] focus:ring-4 focus:ring-champagne/15";
export const botonAcceso =
  "mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-champagne via-[#d4b473] to-champagne text-sm font-semibold text-carbon shadow-[0_10px_30px_-8px_rgba(198,166,100,0.7)] transition active:scale-[0.98] disabled:opacity-70";
