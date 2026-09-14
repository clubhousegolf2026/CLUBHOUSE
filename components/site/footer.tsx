import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/site/logo";

export function Footer() {
  return (
    <footer className="mt-24 bg-verde-calle text-crema/80">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variante="claro" />
          <p className="mt-4 text-sm leading-relaxed">
            Turismo de golf en Colombia. Armas tu itinerario, eliges fecha y
            reservas en línea — nosotros nos encargamos del resto.
          </p>
        </div>

        <nav>
          <h3 className="font-serif text-crema">Explora</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/paquetes" className="hover:text-crema">Paquetes</Link></li>
            <li><Link href="/cotizador" className="hover:text-crema">Arma tu viaje</Link></li>
            <li><Link href="/nosotros" className="hover:text-crema">Nosotros</Link></li>
            <li><Link href="/contacto" className="hover:text-crema">Contacto</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="font-serif text-crema">Contacto</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Bogotá D.C., Colombia</li>
            <li>
              <a href="mailto:hola@clubhouse.co" className="hover:text-crema">
                hola@clubhouse.co
              </a>
            </li>
            <li>
              <a href="tel:+5716000000" className="hover:text-crema">
                +57 (601) 600 0000
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-crema">Síguenos</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href="#" className="hover:text-crema">Instagram</a></li>
            <li><a href="#" className="hover:text-crema">Facebook</a></li>
            <li><a href="#" className="hover:text-crema">YouTube</a></li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-crema/15">
        <Container className="flex flex-col justify-between gap-2 py-6 text-xs text-crema/60 sm:flex-row">
          <span>© {new Date().getFullYear()} Clubhouse. Todos los derechos reservados.</span>
          <span>Desarrollado por OpenView · Consultoría en Tecnología y Automatización</span>
        </Container>
      </div>
    </footer>
  );
}
