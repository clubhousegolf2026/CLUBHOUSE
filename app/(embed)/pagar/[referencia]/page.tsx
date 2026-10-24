import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { configWompi, urlCheckout } from "@/lib/wompi";
import { pesos } from "@/lib/formularios/esquema";
import { trmTexto, usd } from "@/lib/precios";
import { MARCA } from "@/lib/contenido/clubhouse";

export const dynamic = "force-dynamic";

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="grano relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[#071d16] px-4 py-10">
      <div className="hero-degradado absolute inset-0 -z-10" />
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/[0.96] p-8 text-center shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)] sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#a98745]">Clubhouse · Pago seguro</p>
        {children}
      </div>
    </main>
  );
}

export default async function PagarPage({
  params,
  searchParams,
}: {
  params: Promise<{ referencia: string }>;
  searchParams: Promise<{ ir?: string }>;
}) {
  const { referencia } = await params;
  const { ir } = await searchParams;
  const db = createServiceClient();
  if (!db) {
    return (
      <Marco>
        <h1 className="mt-5 font-serif text-2xl text-carbon">Pagos no disponibles</h1>
        <p className="mt-2 text-sm text-niebla">Escríbanos por WhatsApp y le ayudamos con el pago.</p>
      </Marco>
    );
  }

  const { data: pago } = await db.from("pagos").select("*").eq("referencia", referencia).maybeSingle();
  if (!pago) notFound();

  if (pago.estado === "APPROVED") {
    return (
      <Marco>
        <span className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full bg-exito text-white">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="mt-5 font-serif text-3xl text-carbon">Pago recibido</h1>
        <p className="mt-2 text-sm text-niebla">
          {pago.concepto} · {pesos(pago.monto_cop)}
        </p>
        <p className="mt-6 font-serif text-lg italic text-verde-golf">{MARCA.cierre}</p>
      </Marco>
    );
  }

  const url = urlCheckout({
    referencia: pago.referencia,
    montoCop: pago.monto_cop,
    email: pago.email,
    nombre: pago.nombre,
    telefono: pago.telefono,
  });
  // Desde un formulario se salta directo al checkout de Wompi.
  if (ir && url && pago.estado === "PENDING") redirect(url);

  const { sandbox } = configWompi();
  const desglose = (pago.detalle ?? null) as {
    viaje?: string | null;
    perfil?: string | null;
    usd?: number | null;
    personas?: number | null;
    trm?: number | null;
    trmFecha?: string | null;
    totalCop?: number | null;
    anticipoPct?: number | null;
  } | null;
  return (
    <Marco>
      <span className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#f3dfa8] via-[#d9b96a] to-[#a98745] text-[#14251d]">
        <CreditCard size={26} />
      </span>
      <h1 className="mt-5 font-serif text-3xl leading-tight text-carbon">{pago.concepto}</h1>
      {pago.nombre && <p className="mt-1 text-sm text-niebla">{pago.nombre}</p>}
      <p className="mt-6 font-serif text-5xl text-verde-golf">{pesos(pago.monto_cop)}</p>
      {desglose && (
        <dl className="mx-auto mt-5 max-w-xs space-y-1.5 rounded-2xl border border-[#e6ddc9] bg-[#fdfcf9] p-4 text-left text-xs text-niebla">
          {desglose.perfil && (
            <div className="flex justify-between gap-3"><dt>Plan</dt><dd className="text-right text-carbon">{desglose.viaje} · {desglose.perfil}</dd></div>
          )}
          {desglose.usd != null && (
            <div className="flex justify-between gap-3"><dt>Valor en dólares</dt><dd className="text-carbon">{usd(desglose.usd * (desglose.personas ?? 1))}{(desglose.personas ?? 1) > 1 ? ` (${desglose.personas} personas)` : ""}</dd></div>
          )}
          {desglose.trm != null && (
            <div className="flex justify-between gap-3"><dt>TRM del día{desglose.trmFecha ? ` (${desglose.trmFecha})` : ""}</dt><dd className="text-carbon">{trmTexto(desglose.trm)}</dd></div>
          )}
          {desglose.totalCop != null && desglose.anticipoPct ? (
            <div className="flex justify-between gap-3"><dt>Total del plan</dt><dd className="text-carbon">{pesos(desglose.totalCop)}</dd></div>
          ) : null}
          {desglose.anticipoPct ? (
            <div className="flex justify-between gap-3"><dt>Anticipo</dt><dd className="text-carbon">{desglose.anticipoPct}%</dd></div>
          ) : null}
        </dl>
      )}
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-niebla">Referencia {pago.referencia}</p>

      {pago.estado === "DECLINED" || pago.estado === "ERROR" ? (
        <p className="mt-5 rounded-xl border border-error/20 bg-error/5 px-4 py-2.5 text-sm text-error">
          El intento anterior no se completó. Puede intentarlo de nuevo.
        </p>
      ) : null}

      {url ? (
        <a href={url} className="boton-oro mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold">
          Pagar con Wompi
        </a>
      ) : (
        <p className="mt-8 rounded-xl border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm text-alerta">
          Los pagos en línea aún no están activados. Escríbanos y le damos otra forma de pago.
        </p>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-niebla">
        <ShieldCheck size={14} className="text-verde-golf" /> Tarjetas, PSE, Nequi y más. Pago procesado por Wompi.
      </p>
      {sandbox && url && <p className="mt-2 text-[11px] text-alerta">Modo de pruebas: no se cobra dinero real.</p>}
      <Link href={MARCA.whatsappUrl} className="mt-5 inline-block text-xs text-niebla underline">
        ¿Necesita ayuda? Escríbanos
      </Link>
    </Marco>
  );
}
