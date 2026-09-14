import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-serif text-5xl text-verde-calle">404</p>
      <h1 className="mt-4 font-serif text-2xl text-carbon">
        No encontramos esa página
      </h1>
      <p className="mt-2 text-niebla">
        Puede que el enlace esté roto o que el contenido se haya movido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-[var(--radius-control)] bg-verde-golf px-6 py-3 text-sm font-medium text-crema"
      >
        Volver al inicio
      </Link>
    </Container>
  );
}
