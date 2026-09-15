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
        body: JSON.stringify({ tipo, ...form, seleccion }),
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
      <Container className="py-20 text-center">
        <CheckCircle2 className="mx-auto text-exito" size={48} />
        <h1 className="mt-4 font-serif text-3xl text-carbon">
          {enviado === "reserva"
            ? "¡Reserva iniciada!"
            : "¡Cotización enviada!"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-niebla">
          {enviado === "reserva"
            ? "En la versión final aquí te redirigimos a la pasarela de pago (Wompi / ePayco / PayU) para confirmar con el anticipo."
            : `Te enviamos el detalle a ${form.email || "tu correo"}. Un asesor te contactará el mismo día hábil.`}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm text-verde-golf underline"
        >
          Volver al inicio
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Link
        href="/cotizador"
        className="inline-flex items-center gap-1 text-sm text-niebla hover:text-carbon"
      >
        <ArrowLeft size={15} /> Volver a editar
      </Link>

      <h1 className="mt-4 font-serif text-3xl text-carbon">Resumen de tu viaje</h1>

      {!hidratado || vacio ? (
        <p className="mt-6 rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-6 text-niebla">
          Todavía no has armado tu itinerario.{" "}
          <Link href="/cotizador" className="text-verde-golf underline">
            Empieza aquí
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-6">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
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

            <div className="mt-6">
              <DesgloseLineas />
            </div>

            <div className="mt-4 space-y-1 border-t border-arena pt-4 text-sm">
              <Fila label="Subtotal" valor={cop(cotizacion.subtotal)} />
              <Fila label="IVA" valor={cop(cotizacion.impuestos)} />
              <div className="flex justify-between pt-1 font-serif text-lg">
                <span className="text-carbon">Total</span>
                <span className="tabular text-verde-golf">
                  {cop(cotizacion.total)}
                </span>
              </div>
              <p className="text-right text-xs text-niebla">
                {cop(cotizacion.porPersona)} por persona
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-6">
            <h2 className="font-serif text-lg text-carbon">Tus datos</h2>
            <p className="mt-1 text-xs text-niebla">
              Los usamos solo para enviarte la cotización o gestionar la reserva.
            </p>
            <div className="mt-4 space-y-3">
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
              <p className="mt-4 rounded-[var(--radius-control)] bg-error/10 px-3 py-2 text-sm text-error">
                {error}
              </p>
            )}

            <Button
              className="mt-5 w-full"
              variante="oscuro"
              disabled={enviando}
              onClick={() => enviar("reserva")}
            >
              {enviando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                `Reservar con ${cop(Math.round(cotizacion.total * 0.3))}`
              )}
            </Button>
            <Button
              className="mt-2 w-full"
              variante="contorno"
              disabled={enviando}
              onClick={() => enviar("cotizacion")}
            >
              {enviando ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Recibir cotización por correo"
              )}
            </Button>
          </aside>
        </div>
      )}
    </Container>
  );
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg bg-crema p-3">
      <dt className="text-xs text-niebla">{label}</dt>
      <dd className="font-medium text-carbon">{valor}</dd>
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
      <label htmlFor={id} className="block text-sm text-carbon">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf"
      />
    </div>
  );
}
