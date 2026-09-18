"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { Section, SectionHead } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function ContactoPage() {
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [t] = useState(() => Date.now());

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.get("nombre"),
        email: form.get("email"),
        telefono: form.get("telefono") || undefined,
        mensaje: form.get("mensaje") || undefined,
        fechaTentativa: form.get("fecha") || undefined,
        website: form.get("website") || undefined,
        t,
      }),
    });

    setEnviando(false);
    if (res.ok) {
      setEnviado(true);
    } else {
      setError("No pudimos enviar tu mensaje. Intenta de nuevo en un momento.");
    }
  }

  return (
    <Section>
      <SectionHead
        eyebrow="Contacto"
        titulo="Hablemos de tu viaje"
        descripcion="Cuéntanos qué tienes en mente y un asesor te responde el mismo día hábil."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        {enviado ? (
          <div className="rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-8 text-center">
            <CheckCircle2 className="mx-auto text-exito" size={40} />
            <p className="mt-3 font-serif text-xl text-carbon">
              ¡Mensaje recibido!
            </p>
            <p className="mt-1 text-sm text-niebla">
              Te contactamos muy pronto.
            </p>
          </div>
        ) : (
          <form
            className="grid gap-4 rounded-[var(--radius-panel)] border border-arena bg-blanco-roto p-6 sm:grid-cols-2"
            onSubmit={enviar}
          >
            <input
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <Input id="nombre" label="Nombre" required />
            <Input id="email" label="Correo" type="email" required />
            <Input id="telefono" label="Teléfono / WhatsApp" />
            <Input id="fecha" label="Fecha tentativa" type="date" />
            <label className="sm:col-span-2">
              <span className="block text-sm text-carbon">Mensaje</span>
              <textarea
                name="mensaje"
                required
                rows={4}
                className="mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf"
              />
            </label>
            {error && (
              <p role="status" className="text-sm text-error sm:col-span-2">
                {error}
              </p>
            )}
            <Button type="submit" disabled={enviando} className="sm:col-span-2">
              {enviando ? "Enviando…" : "Enviar mensaje"}
            </Button>
          </form>
        )}

        <aside className="space-y-4 text-sm text-carbon">
          <p className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 text-verde-golf" /> Bogotá D.C.,
            Colombia
          </p>
          <p className="flex items-start gap-3">
            <Mail size={18} className="mt-0.5 text-verde-golf" />
            <a href="mailto:hola@clubhouse.co" className="hover:underline">
              hola@clubhouse.co
            </a>
          </p>
          <p className="flex items-start gap-3">
            <Phone size={18} className="mt-0.5 text-verde-golf" />
            <a href="tel:+5716000000" className="hover:underline">
              +57 (601) 600 0000
            </a>
          </p>
        </aside>
      </div>
    </Section>
  );
}

function Input({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="block text-sm text-carbon">
        {label}
        {required && <span className="text-alerta"> *</span>}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf"
      />
    </label>
  );
}
