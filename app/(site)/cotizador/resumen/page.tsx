"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useCotizador } from "@/stores/cotizador-store";
import { DesgloseLineas } from "@/components/cotizador/pasos";
import { cop, fechaCo } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function ResumenPage() {
  const { cotizacion, seleccion, hidratado } = useCotizador();
  const [enviado, setEnviado] = useState<null | "cotizacion" | "reserva">(null);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [t] = useState(() => Date.now());
  const [website, setWebsite] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vacio = cotizacion.lineas.length === 0;

  async function enviar(tipo: "cotizacion" | "reserva") {
    if (!form.nombre.trim() || !form.email.trim()) {
      setError("Escribe tu nombre y correo para continuar.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, ...form, seleccion, website, t }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos procesar tu solicitud, intenta de nuevo.");
        return;
      }
      setEnviado(tipo);
    } catch {
      setError("Fallo de conexión, intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <section className="grano relative isolate -mt-20 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#071d16] px-6 pt-20 text-center text-crema">
        <div className="hero-degradado absolute inset-0 -z-20" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="orbita orbita-gira aspect-square w-[420px]" />
          <div className="orbita orbita-gira-inversa aspect-square w-[680px] !border-white/10" />
        </div>

        <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#ecd396] to-[#a98745] text-[#14251d] shadow-[0_18px_50px_-12px_rgba(198,166,100,0.8)]">
          <CheckCircle2 size={40} />
        </span>
        <h1 className="mt-7 font-serif text-4xl text-white sm:text-5xl">
          {enviado === "reserva" ? (
            <>
              ¡Reserva <em className="texto-oro pr-1 font-medium italic">iniciada</em>!
            </>
          ) : (
            <>
              ¡Cotización <em className="texto-oro pr-1 font-medium italic">enviada</em>!
            </>
          )}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-crema/70">
          {enviado === "reserva"
            ? "En la versión final aquí te redirigimos a la pasarela de pago para confirmar con el anticipo."
            : `Te enviamos el detalle a ${form.email || "tu correo"}. Un asesor te contactará el mismo día hábil.`}
        </p>
        <Link
          href="/"
          className="boton-cristal mt-9 inline-flex min-h-12 items-center rounded-full px-8 text-sm font-medium"
        >
          Volver al inicio
        </Link>
      </section>
    );
  }

  const tarjeta =
    "rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_30px_80px_-30px_rgba(11,43,33,0.45)] ring-1 ring-arena/60 backdrop-blur-xl";

  return (
    <>
      <section className="grano relative isolate -mt-20 overflow-hidden bg-[#071d16] pb-20 pt-32 text-crema sm:pt-36">
        <div className="hero-degradado absolute inset-0 -z-20" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-b from-transparent to-[#f6f3ec]"
        />
        <Container className="max-w-5xl">
          <Link
            href="/cotizador"
            className="inline-flex items-center gap-1.5 text-sm text-crema/70 transition-colors hover:text-[#ecd396]"
          >
            <ArrowLeft size={15} /> Volver a editar
          </Link>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-white sm:text-5xl">
            Resumen de tu <em className="texto-oro pr-1 font-medium italic">viaje</em>
          </h1>
          <p className="mt-2 text-crema/60">
            Revisa el detalle y confirma con el 30% de anticipo.
          </p>
        </Container>
      </section>

      <Container className="max-w-5xl pb-24">
        {!hidratado || vacio ? (
          <div className={`${tarjeta} relative z-10 -mt-10 p-10 text-center`}>
            <p className="font-serif text-2xl text-carbon">
              Todavía no has armado tu itinerario
            </p>
            <Link
              href="/cotizador"
              className="boton-oro mt-6 inline-flex min-h-12 items-center rounded-full px-8 text-sm font-semibold"
            >
              Empieza aquí
            </Link>
          </div>
        ) : (
          <div className="relative z-10 -mt-10 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            <div className={`${tarjeta} p-7`}>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Dato label="Pasajeros" valor={`${seleccion.numPax}`} />
                <Dato label="Noches" valor={`${seleccion.noches}`} />
                <Dato label="Habitaciones" valor={`${seleccion.habitaciones}`} />
                <Dato
                  label="Fecha"
                  valor={
                    seleccion.fechaInicio ? fechaCo(seleccion.fechaInicio) : "Sin definir"
                  }
                />
              </dl>

              <div className="mt-7">
                <DesgloseLineas />
              </div>

              <div className="mt-5 space-y-1.5 border-t border-arena pt-5 text-sm">
                <Fila label="Subtotal" valor={cop(cotizacion.subtotal)} />
                <Fila label="IVA" valor={cop(cotizacion.impuestos)} />
                <div className="flex items-baseline justify-between pt-2">
                  <span className="font-serif text-xl text-carbon">Total</span>
                  <span className="font-serif text-3xl tabular text-verde-golf">
                    {cop(cotizacion.total)}
                  </span>
                </div>
                <p className="text-right text-xs text-niebla">
                  {cop(cotizacion.porPersona)} por persona
                </p>
              </div>
            </div>

            <aside className={`${tarjeta} h-fit p-7 lg:sticky lg:top-28`}>
              <h2 className="flex items-center gap-2 font-serif text-xl text-carbon">
                <span className="h-px w-6 bg-champagne" /> Tus datos
              </h2>
              <p className="mt-1.5 text-xs text-niebla">
                Los usamos solo para enviarte la cotización o gestionar la reserva.
              </p>
              <div className="mt-5 space-y-4">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <Campo
                  id="nombre"
                  label="Nombre completo"
                  value={form.nombre}
                  onChange={(v) => setForm((f) => ({ ...f, nombre: v }))}
                />
                <Campo
                  id="email"
                  label="Correo"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                />
                <Campo
                  id="telefono"
                  label="Teléfono / WhatsApp"
                  value={form.telefono}
                  onChange={(v) => setForm((f) => ({ ...f, telefono: v }))}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-error/20 bg-error/5 px-3.5 py-2.5 text-sm text-error"
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={enviando}
                onClick={() => enviar("reserva")}
                className="boton-oro mt-5 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
              >
                {enviando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  `Reservar con ${cop(Math.round(cotizacion.total * 0.3))}`
                )}
              </button>
              <button
                type="button"
                disabled={enviando}
                onClick={() => enviar("cotizacion")}
                className="mt-2.5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-verde-golf/40 px-5 text-sm font-medium text-verde-golf transition-colors hover:bg-verde-golf/5 disabled:opacity-60"
              >
                {enviando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Recibir cotización por correo"
                )}
              </button>
            </aside>
          </div>
        )}
      </Container>
    </>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl border border-arena/70 bg-crema/60 p-3.5">
      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-niebla">
        {label}
      </dt>
      <dd className="mt-0.5 font-serif text-lg text-carbon">{valor}</dd>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between text-niebla">
      <span>{label}</span>
      <span className="tabular">{valor}</span>
    </div>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-[0.12em] text-niebla"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-12 w-full rounded-xl border border-arena bg-white px-4 text-sm outline-none transition hover:border-verde-golf/40 focus:border-verde-golf focus:ring-4 focus:ring-verde-golf/10"
      />
    </div>
  );
}
