import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { consultarTransaccion } from "@/lib/wompi";
import { aplicarTransaccion } from "@/lib/pagos";
import { pesos } from "@/lib/formularios/esquema";
import { MARCA } from "@/lib/contenido/clubhouse";

export const dynamic = "force-dynamic";

/** A donde Wompi devuelve a la persona tras pagar (con ?id=<transacción>). */
export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const tx = id ? await consultarTransaccion(id) : null;

  // Se refleja ya en el sistema, sin esperar al evento de Wompi.
  if (tx) {
    const db = createServiceClient();
    if (db) await aplicarTransaccion(db, tx);
  }

  const estado = tx?.status ?? "PENDING";
  const ok = estado === "APPROVED";
  const malo = estado === "DECLINED" || estado === "ERROR" || estado === "VOIDED";
  const Icono = ok ? CheckCircle2 : malo ? XCircle : Clock;

  return (
    <main className="grano relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[#071d16] px-4 py-10">
      <div className="hero-degradado absolute inset-0 -z-10" />
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/[0.96] p-8 text-center shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)] sm:p-10">
        <span
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-white ${ok ? "bg-exito" : malo ? "bg-error" : "bg-champagne"}`}
        >
          <Icono size={34} />
        </span>
        <h1 className="mt-5 font-serif text-3xl text-carbon">
          {ok ? "¡Pago aprobado!" : malo ? "El pago no se completó" : "Estamos confirmando su pago"}
        </h1>
        {tx && (
          <p className="mt-2 text-sm text-niebla">
            {pesos(tx.amount_in_cents / 100)} · Referencia {tx.reference}
          </p>
        )}
        <p className="mt-4 text-sm leading-relaxed text-niebla">
          {ok
            ? "Recibimos su pago. Un asesor le confirmará los detalles de su viaje muy pronto."
            : malo
              ? "No se realizó ningún cobro. Puede intentarlo de nuevo con el mismo enlace o escribirnos."
              : "Su banco aún está procesando la transacción. Le avisaremos apenas se confirme."}
        </p>
        <a
          href={MARCA.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="boton-oro mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-semibold"
        >
          Hablar con un asesor
        </a>
        {ok && <p className="mt-6 font-serif text-lg italic text-verde-golf">{MARCA.cierre}</p>}
      </div>
    </main>
  );
}
