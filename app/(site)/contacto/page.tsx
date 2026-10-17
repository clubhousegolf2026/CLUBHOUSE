"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Phone, MapPin } from "lucide-react";
import { PaginaHero, Oro } from "@/components/marketing/pagina-hero";

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
      setError("No pudimos enviar su mensaje. Inténtelo de nuevo en un momento.");
    }
  }

  const tarjeta =
    "rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_30px_80px_-30px_rgba(11,43,33,0.4)] ring-1 ring-arena/60 backdrop-blur-xl";

  return (
    <>
      <PaginaHero
        eyebrow="Contacto"
        titulo={
          <>
            Hablemos de su <Oro>viaje</Oro>
          </>
        }
        descripcion="Cuéntenos qué tiene en mente y un asesor le responde el mismo día hábil."
      />

      <section className="px-6 pb-24 sm:px-10 lg:px-16 xl:px-24">
        <div className="relative z-10 mx-auto -mt-8 grid max-w-[1200px] gap-8 lg:grid-cols-[1fr_340px]">
          {enviado ? (
            <div className={`${tarjeta} p-10 text-center`}>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#ecd396] to-[#a98745] text-[#1a1a1a]">
                <CheckCircle2 size={32} />
              </span>
              <p className="mt-5 font-serif text-3xl text-carbon">¡Mensaje recibido!</p>
              <p className="mt-2 text-niebla">Le contactamos muy pronto.</p>
            </div>
          ) : (
            <form className={`${tarjeta} grid gap-5 p-6 sm:grid-cols-2 sm:p-9`} onSubmit={enviar}>
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
                <span className="block text-xs font-medium uppercase tracking-[0.12em] text-niebla">Mensaje</span>
                <textarea
                  name="mensaje"
                  required
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-arena bg-white px-4 py-3 text-sm outline-none transition placeholder:text-niebla/50 hover:border-verde-golf/40 focus:border-verde-golf focus:ring-4 focus:ring-verde-golf/10"
                />
              </label>
              {error && (
                <p role="alert" className="rounded-xl border border-error/20 bg-error/5 px-3.5 py-2.5 text-sm text-error sm:col-span-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-verde-golf to-verde-calle px-8 py-3.5 text-sm font-semibold text-crema shadow-lg shadow-verde-calle/30 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 sm:col-span-2"
              >
                {enviando ? "Enviando…" : "Enviar mensaje"}
              </button>
            </form>
          )}

          <aside className="space-y-4">
            {[
              { icono: MapPin, titulo: "Oficina", texto: "Bogotá D.C., Colombia", href: undefined as string | undefined },
              { icono: Mail, titulo: "Correo", texto: "hola@clubhouse.co", href: "mailto:hola@clubhouse.co" },
              { icono: Phone, titulo: "Teléfono", texto: "+57 (601) 600 0000", href: "tel:+5716000000" },
            ].map(({ icono: Icono, titulo, texto, href }) => {
              const contenido = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ecd396] to-[#a98745] text-[#1a1a1a] shadow-md shadow-champagne/30">
                    <Icono size={20} />
                  </span>
                  <span>
                    <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-niebla">{titulo}</span>
                    <span className="mt-0.5 block text-carbon">{texto}</span>
                  </span>
                </>
              );
              const clase = `${tarjeta} flex items-center gap-4 p-5 transition-all`;
              return href ? (
                <a key={titulo} href={href} className={`${clase} hover:-translate-y-1 hover:shadow-[0_34px_70px_-28px_rgba(11,43,33,0.5)]`}>
                  {contenido}
                </a>
              ) : (
                <div key={titulo} className={clase}>{contenido}</div>
              );
            })}
          </aside>
        </div>
      </section>
    </>
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
      <span className="block text-xs font-medium uppercase tracking-[0.12em] text-niebla">
        {label}
        {required && <span className="text-alerta"> *</span>}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="mt-2 h-12 w-full rounded-xl border border-arena bg-white px-4 text-sm outline-none transition placeholder:text-niebla/50 hover:border-verde-golf/40 focus:border-verde-golf focus:ring-4 focus:ring-verde-golf/10"
      />
    </label>
  );
}
