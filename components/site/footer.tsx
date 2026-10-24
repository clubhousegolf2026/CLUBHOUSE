import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { MARCA } from "@/lib/contenido/clubhouse";
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
            Agencia bespoke de viajes de golf. 50 destinos en 5 continentes,
            con itinerarios diseñados desde cero alrededor de su juego.
          </p>
        </div>

        <nav>
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d3a0]">
            Explora
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li><Link href="/#planes" className={enlace}>Experiencias</Link></li>
            <li><Link href="/nosotros" className={enlace}>Nosotros</Link></li>
            <li><Link href="/contacto" className={enlace}>Contacto</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d3a0]">
            Contacto
          </h2>
          <ul className="mt-5 space-y-3.5 text-sm">
            <li className="flex items-start gap-3 text-crema/65">
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#c6a664]" /> {MARCA.ciudad}
            </li>
            <li className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-[#c6a664]" />
              <a href={`mailto:${MARCA.email}`} className={enlace}>{MARCA.email}</a>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-[#c6a664]" />
              <a href={MARCA.whatsappUrl} target="_blank" rel="noopener noreferrer" className={enlace}>{MARCA.whatsapp}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e8d3a0]">
            Empieza hoy
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-crema/60">
            Cuéntenos qué tiene en mente y diseñamos su viaje a la medida.
          </p>
          <a
            href={MARCA.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="boton-oro mt-5 inline-flex rounded-full px-6 py-3 text-sm font-semibold"
          >
            Escríbanos por WhatsApp
          </a>
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
