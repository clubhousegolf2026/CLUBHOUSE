"use client";

import { useState } from "react";
import { ArrowRight, CalendarDays, Check, Loader2, Mail, MapPin, Minus, Phone, Plus, User } from "lucide-react";
import { MARCA } from "@/lib/contenido/clubhouse";
import { PaginaHero, Oro } from "@/components/marketing/pagina-hero";
import { Inclinar } from "@/components/site/inclinar";
import { cn } from "@/lib/cn";

const INTERESES = ["Tailandia", "Utah", "Un destino a mi medida"] as const;
const MAX_MENSAJE = 1800;

const tarjeta =
  "rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_30px_80px_-30px_rgba(11,43,33,0.4)] ring-1 ring-arena/60 backdrop-blur-xl";

export default function ContactoPage() {
  const [enviado, setEnviado] = useState<{ nombre: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [golfistas, setGolfistas] = useState(2);
  const [mensaje, setMensaje] = useState("");
  const [t] = useState(() => Date.now());

  const alternar = (x: string) =>
    setIntereses((prev) => (prev.includes(x) ? prev.filter((i) => i !== x) : [...prev, x]));

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const form = new FormData(e.currentTarget);
    // Lo que el cliente elige en las fichas viaja en el mensaje: el asesor lo ve en el CRM.
    const encabezado = [
      intereses.length > 0 ? `Interés: ${intereses.join(", ")}` : "",
      `Golfistas: ${golfistas}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.get("nombre"),
          email: form.get("email"),
          telefono: form.get("telefono") || undefined,
          mensaje: `${encabezado}\n\n${mensaje}`.trim(),
          fechaTentativa: form.get("fecha") || undefined,
          website: form.get("website") || undefined,
          t,
        }),
      });
      if (res.ok) setEnviado({ nombre: String(form.get("nombre") ?? "") });
      else setError("No pudimos enviar su mensaje. Inténtelo de nuevo en un momento.");
    } catch {
      setError("No hay conexión. Revise su internet e inténtelo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

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
            <div className={`${tarjeta} relative overflow-hidden p-10 text-center sm:p-14`}>
              <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#c6a664]/25 blur-3xl" />
              <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#f3dfa8] via-[#d9b96a] to-[#a98745] text-[#14251d] shadow-xl shadow-champagne/40">
                <span aria-hidden className="absolute inset-0 rounded-full bg-[#ecd396]/60 [animation:punto-vivo_2s_ease-out_infinite]" />
                <Check size={38} strokeWidth={2.5} className="relative" />
              </span>
              <p className="relative mt-7 font-serif text-4xl text-carbon">
                ¡Gracias{enviado.nombre ? `, ${enviado.nombre.split(" ")[0]}` : ""}!
              </p>
              <p className="relative mx-auto mt-3 max-w-md text-niebla">
                Recibimos su mensaje. Un asesor le responde el mismo día hábil. Si prefiere no esperar, escríbanos ahora.
              </p>
              <a
                href={MARCA.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="boton-oro group relative mt-8 inline-flex min-h-13 items-center gap-2 rounded-full px-8 text-sm font-semibold"
              >
                Seguir por WhatsApp
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <p className="relative mt-8 font-serif text-xl italic text-verde-golf">{MARCA.cierre}</p>
            </div>
          ) : (
            <form className={`${tarjeta} space-y-8 p-6 sm:p-10`} onSubmit={enviar}>
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              <fieldset className="space-y-5">
                <legend className="mb-1 flex items-center gap-3 font-serif text-xl text-carbon">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-carbon text-xs text-crema">1</span>
                  Sobre usted
                </legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo id="nombre" label="Nombre" icono={User} required autoComplete="name" />
                  <Campo id="email" label="Correo" type="email" icono={Mail} required autoComplete="email" />
                  <Campo id="telefono" label="Teléfono / WhatsApp" icono={Phone} type="tel" autoComplete="tel" className="sm:col-span-2" />
                </div>
              </fieldset>

              <fieldset className="space-y-6">
                <legend className="mb-1 flex items-center gap-3 font-serif text-xl text-carbon">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-carbon text-xs text-crema">2</span>
                  Su viaje
                </legend>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-niebla">¿Qué le interesa?</p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {INTERESES.map((x) => {
                      const activo = intereses.includes(x);
                      return (
                        <button
                          key={x}
                          type="button"
                          aria-pressed={activo}
                          onClick={() => alternar(x)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                            activo
                              ? "border-verde-golf bg-verde-golf text-crema shadow-lg shadow-verde-calle/25"
                              : "border-arena bg-white text-carbon hover:-translate-y-0.5 hover:border-verde-golf/50",
                          )}
                        >
                          {activo && <Check size={14} />}
                          {x}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid items-end gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-niebla">¿Cuántos golfistas?</p>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-arena bg-white p-1">
                      <button
                        type="button"
                        aria-label="Menos golfistas"
                        onClick={() => setGolfistas((n) => Math.max(1, n - 1))}
                        className="grid h-10 w-10 place-items-center rounded-full text-carbon transition hover:bg-arena/50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-serif text-2xl tabular-nums text-carbon" aria-live="polite">{golfistas}</span>
                      <button
                        type="button"
                        aria-label="Más golfistas"
                        onClick={() => setGolfistas((n) => Math.min(40, n + 1))}
                        className="grid h-10 w-10 place-items-center rounded-full text-carbon transition hover:bg-arena/50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <Campo id="fecha" label="Fecha tentativa" type="date" icono={CalendarDays} />
                </div>

                <label className="block">
                  <span className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.12em] text-niebla">
                    <span>
                      Mensaje <span className="text-alerta">*</span>
                    </span>
                    <span className={cn("tabular-nums", mensaje.length > MAX_MENSAJE - 100 && "text-alerta")}>
                      {mensaje.length}/{MAX_MENSAJE}
                    </span>
                  </span>
                  <textarea
                    name="mensaje"
                    required
                    rows={5}
                    maxLength={MAX_MENSAJE}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Destinos que le gustan, campos que sueña jugar, ocasión del viaje…"
                    className="mt-2 w-full rounded-2xl border border-arena bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-niebla/50 hover:border-verde-golf/40 focus:border-verde-golf focus:ring-4 focus:ring-verde-golf/10"
                  />
                </label>
              </fieldset>

              {error && (
                <p role="alert" className="rounded-xl border border-error/20 bg-error/5 px-3.5 py-2.5 text-sm text-error">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={enviando}
                  className="boton-oro group inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-9 text-sm font-semibold disabled:opacity-60"
                >
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : null}
                  {enviando ? "Enviando…" : "Enviar mensaje"}
                  {!enviando && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </button>
                <p className="text-xs text-niebla">Respuesta el mismo día hábil. Sin compromiso.</p>
              </div>
            </form>
          )}

          <aside className="space-y-4">
            {[
              { icono: MapPin, titulo: "Oficina", texto: MARCA.ciudad, href: undefined as string | undefined },
              { icono: Mail, titulo: "Correo", texto: MARCA.email, href: `mailto:${MARCA.email}` },
              { icono: Phone, titulo: "WhatsApp", texto: MARCA.whatsapp, href: MARCA.whatsappUrl },
            ].map(({ icono: Icono, titulo, texto, href }) => {
              const contenido = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#f3dfa8] via-[#d9b96a] to-[#a98745] text-[#14251d] shadow-md shadow-champagne/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <Icono size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-niebla">{titulo}</span>
                    <span className="mt-0.5 block break-words text-carbon">{texto}</span>
                  </span>
                </>
              );
              const clase = `${tarjeta} group flex items-center gap-4 p-5`;
              return (
                <Inclinar key={titulo} fuerza={4}>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`${clase} transition-shadow hover:shadow-[0_34px_70px_-28px_rgba(11,43,33,0.5)]`}>
                      {contenido}
                    </a>
                  ) : (
                    <div className={clase}>{contenido}</div>
                  )}
                </Inclinar>
              );
            })}

            <div className="grano luz-cursor relative isolate overflow-hidden rounded-[2rem] bg-[#071d16] p-7 text-crema">
              <div className="hero-degradado absolute inset-0 -z-10 opacity-80" />
              <p className="font-serif text-2xl leading-snug text-white">
                Cada viaje se diseña <span className="texto-oro">desde cero</span>.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-crema/65">
                Entendemos su juego, su grupo y sus fechas, y armamos el itinerario a su medida.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/** Campo con icono: la etiqueta flota hacia arriba al escribir o enfocar. */
function Campo({
  id,
  label,
  type = "text",
  required,
  icono: Icono,
  autoComplete,
  className,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  autoComplete?: string;
  className?: string;
}) {
  const flotaSiempre = type === "date";
  return (
    <div className={cn("group relative", className)}>
      <Icono size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-niebla transition-colors group-focus-within:text-verde-golf" />
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className="peer h-14 w-full rounded-2xl border border-arena bg-white pb-1 pl-11 pr-4 pt-5 text-sm outline-none transition hover:border-verde-golf/40 focus:border-verde-golf focus:ring-4 focus:ring-verde-golf/10"
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-11 text-niebla transition-all duration-200",
          flotaSiempre
            ? "top-2 text-[10px] uppercase tracking-[0.12em]"
            : "top-1/2 -translate-y-1/2 text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-verde-golf peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.12em]",
        )}
      >
        {label}
        {required && <span className="text-alerta"> *</span>}
      </label>
    </div>
  );
}
