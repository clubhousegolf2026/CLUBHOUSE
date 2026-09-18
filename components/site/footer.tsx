import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/site/logo";

type IconoProps = { size?: number };

const Instagram = ({ size = 17 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
  </svg>
);
const Facebook = ({ size = 17 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z" />
  </svg>
);
const Youtube = ({ size = 17 }: IconoProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" />
  </svg>
);

const REDES = [
  { icono: Instagram, etiqueta: "Instagram", href: "#" },
  { icono: Facebook, etiqueta: "Facebook", href: "#" },
  { icono: Youtube, etiqueta: "YouTube", href: "#" },
];

const enlace =
  "text-crema/65 transition-colors hover:text-[#ecd396]";

export function Footer() {
  return (
    <footer className="grano relative isolate overflow-hidden bg-gradient-to-b from-[#061a13] to-[#03100b] text-crema/80">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c6a664]/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-80 w-[700px] -translate-x-1/2 rounded-full bg-[#2f8a63]/20 blur-3xl"
      />

      <Container className="grid max-w-[1400px] gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
        <div>
          <Logo variante="claro" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-crema/60">
            Turismo de golf en Colombia. Armas tu itinerario, eliges fecha y
            reservas en línea — nosotros nos encargamos del resto.
          </p>
          <ul className="mt-6 flex gap-2.5">
            {REDES.map(({ icono: Icono, etiqueta, href }) => (
              <li key={etiqueta}>
                <a
                  href={href}
                  aria-label={etiqueta}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/[0.05] text-crema/75 transition-all hover:-translate-y-0.5 hover:border-[#c6a664]/60 hover:bg-[#c6a664]/15 hover:text-[#ecd396]"
                >
                  <Icono size={17} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav>
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d3a0]">
            Explora
          </h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link href="/paquetes" className={enlace}>Paquetes</Link></li>
            <li><Link href="/cotizador" className={enlace}>Arma tu viaje</Link></li>
            <li><Link href="/nosotros" className={enlace}>Nosotros</Link></li>
            <li><Link href="/contacto" className={enlace}>Contacto</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d3a0]">
            Contacto
          </h3>
          <ul className="mt-5 space-y-3.5 text-sm">
            <li className="flex items-start gap-3 text-crema/65">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#c6a664]" /> Bogotá D.C., Colombia
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-[#c6a664]" />
              <a href="mailto:hola@clubhouse.co" className={enlace}>hola@clubhouse.co</a>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-[#c6a664]" />
              <a href="tel:+5716000000" className={enlace}>+57 (601) 600 0000</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d3a0]">
            Empieza hoy
          </h3>
          <p className="mt-5 text-sm leading-relaxed text-crema/60">
            Cotiza tu viaje de golf en minutos y mira el precio al instante.
          </p>
          <Link
            href="/cotizador"
            className="boton-oro mt-5 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
          >
            Cotizar ahora
          </Link>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex max-w-[1400px] flex-col justify-between gap-2 py-6 text-xs text-crema/45 sm:flex-row">
          <span>© {new Date().getFullYear()} Clubhouse. Todos los derechos reservados.</span>
          <span>Desarrollado por OpenView · Consultoría en Tecnología y Automatización</span>
        </Container>
      </div>
    </footer>
  );
}
