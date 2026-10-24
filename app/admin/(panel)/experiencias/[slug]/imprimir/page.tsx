import Link from "next/link";
import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import { MARCA } from "@/lib/contenido/clubhouse";
import { ImprimirBoton } from "@/components/admin/experiencias/imprimir-boton";

export const dynamic = "force-dynamic";

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="evitar-corte mt-7">
      <h2 className="border-b border-[#c6a664] pb-1 font-serif text-lg text-[#1f3b2f]">{titulo}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Ficha de una página para entregar al cliente o guardar como PDF. No incluye costos. */
export default async function ImprimirExperienciaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = (await createServerSupabase()) as unknown as SupabaseClient;
  const { experiencias } = await getExperienciasAdmin(db);
  const e = experiencias.find((x) => x.slug === slug);
  if (!e) notFound();

  const salidas = (e.salidas ?? []).filter((s) => s.inicio && s.fin);
  const politicas = (e.politicas ?? []).filter((p) => p.titulo.trim());

  return (
    <div className="hoja-impresion fixed inset-0 z-[90] overflow-auto bg-[#e7e5df]">
      <div className="no-imprimir sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-arena bg-blanco-roto px-5 py-3">
        <Link href={`/admin/experiencias/${slug}`} className="text-sm text-niebla hover:text-carbon">← Volver al editor</Link>
        <ImprimirBoton />
      </div>

      <article className="mx-auto my-6 max-w-[210mm] bg-white p-[14mm] text-[13px] leading-relaxed text-[#1a1a1a] shadow-xl print:my-0 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-2 border-[#1f3b2f] pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#a98745]">Clubhouse · {MARCA.claim}</p>
            <h1 className="mt-2 font-serif text-[30px] leading-tight text-[#1f3b2f]">
              {e.bandera} {e.nombre}
            </h1>
            {e.subtitulo && <p className="text-[#5c6470]">{e.subtitulo}</p>}
          </div>
          <div className="shrink-0 text-right text-[12px]">
            {e.fechas && <p className="font-semibold">{e.fechas}</p>}
            {e.duracion && <p className="text-[#5c6470]">{e.duracion}</p>}
            {e.desde && <p className="mt-1 font-serif text-xl text-[#1f3b2f]">Desde {e.desde}</p>}
          </div>
        </header>

        {e.foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.foto} alt={e.fotoAlt || e.nombre} className="mt-5 h-56 w-full rounded-lg object-cover" />
        )}

        {(e.titularLargo || e.descripcionLarga) && (
          <div className="mt-5">
            {e.titularLargo && <p className="font-serif text-lg text-[#1f3b2f]">{e.titularLargo}</p>}
            {e.descripcionLarga && <p className="mt-1 text-[#333]">{e.descripcionLarga}</p>}
          </div>
        )}

        {e.cifras.length > 0 && (
          <ul className="evitar-corte mt-5 flex flex-wrap gap-x-8 gap-y-2 rounded-lg bg-[#f6f3ec] px-4 py-3">
            {e.cifras.map((c, i) => (
              <li key={i}>
                <span className="font-serif text-xl text-[#1f3b2f]">{c.valor}</span>{" "}
                <span className="text-[11px] uppercase tracking-wider text-[#5c6470]">{c.etiqueta}</span>
              </li>
            ))}
          </ul>
        )}

        {e.programa.length > 0 && (
          <Bloque titulo="Programa día a día">
            <ol className="space-y-3">
              {e.programa.map((d, i) => (
                <li key={i} className="evitar-corte grid grid-cols-[74px_1fr] gap-3">
                  <span className="font-semibold text-[#a98745]">{d.fecha || `Día ${i + 1}`}</span>
                  <div>
                    <p className="font-semibold">{d.titulo}</p>
                    {d.detalle.filter(Boolean).length > 0 && (
                      <ul className="mt-0.5 list-disc pl-4 text-[#333]">
                        {d.detalle.filter(Boolean).map((x, j) => <li key={j}>{x}</li>)}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Bloque>
        )}

        {e.rondas.length > 0 && (
          <Bloque titulo="Campos de golf">
            <ul className="space-y-3">
              {e.rondas.map((r, i) => (
                <li key={i} className="evitar-corte">
                  <p className="font-semibold">{r.nombre} <span className="font-normal text-[#5c6470]">· {r.lugar}</span></p>
                  {r.datos.filter(Boolean).length > 0 && <p className="text-[11px] uppercase tracking-wider text-[#a98745]">{r.datos.filter(Boolean).join(" · ")}</p>}
                  {r.descripcion && <p className="text-[#333]">{r.descripcion}</p>}
                </li>
              ))}
            </ul>
          </Bloque>
        )}

        {e.alojamiento.length > 0 && (
          <Bloque titulo="Alojamiento">
            <ul className="space-y-2">
              {e.alojamiento.map((a, i) => (
                <li key={i} className="evitar-corte">
                  <p className="font-semibold">{a.nombre} <span className="font-normal text-[#5c6470]">· {a.periodo}</span></p>
                  {a.descripcion && <p className="text-[#333]">{a.descripcion}</p>}
                </li>
              ))}
            </ul>
          </Bloque>
        )}

        {e.tarifas.length > 0 && (
          <Bloque titulo="Tarifas">
            <div className="grid gap-3 sm:grid-cols-2">
              {e.tarifas.map((t, i) => (
                <div key={i} className="evitar-corte rounded-lg border border-[#e6ddc9] p-3">
                  <p className="font-semibold">{t.perfil}{t.destacada ? " ★" : ""}</p>
                  {t.detalle && <p className="text-[#5c6470]">{t.detalle}</p>}
                  <p className="mt-1 font-serif text-lg text-[#1f3b2f]">{t.precio} <span className="font-sans text-[11px] text-[#5c6470]">{t.unidad}</span></p>
                  {t.incluye.filter(Boolean).length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-[12px] text-[#333]">
                      {t.incluye.filter(Boolean).map((x, j) => <li key={j}>{x}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            {e.anticipoPct != null && <p className="mt-2 text-[12px] text-[#5c6470]">Anticipo para reservar: {e.anticipoPct}%.</p>}
          </Bloque>
        )}

        {(e.incluye.filter(Boolean).length > 0 || e.noIncluye.filter(Boolean).length > 0) && (
          <Bloque titulo="Qué incluye">
            <div className="grid gap-6 sm:grid-cols-2">
              <ul className="list-disc pl-4">{e.incluye.filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul>
              {e.noIncluye.filter(Boolean).length > 0 && (
                <div>
                  <p className="mb-1 font-semibold">No incluye</p>
                  <ul className="list-disc pl-4 text-[#5c6470]">{e.noIncluye.filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              )}
            </div>
          </Bloque>
        )}

        {salidas.length > 0 && (
          <Bloque titulo="Salidas">
            <ul className="space-y-1">
              {salidas.map((s) => (
                <li key={s.id}>
                  {s.inicio} → {s.fin}
                  {s.cupos != null ? ` · ${s.cupos} cupos` : ""} · {s.estado}
                  {s.nota ? ` · ${s.nota}` : ""}
                </li>
              ))}
            </ul>
          </Bloque>
        )}

        {(politicas.length > 0 || e.grupo?.min || e.grupo?.max || e.nivel) && (
          <Bloque titulo="Condiciones">
            <ul className="space-y-2">
              {(e.grupo?.min || e.grupo?.max) && (
                <li>
                  <span className="font-semibold">Grupo:</span> {e.grupo?.min ? `mínimo ${e.grupo.min}` : ""}
                  {e.grupo?.min && e.grupo?.max ? " · " : ""}
                  {e.grupo?.max ? `máximo ${e.grupo.max} personas` : ""}
                </li>
              )}
              {e.nivel && <li><span className="font-semibold">Nivel de juego:</span> {e.nivel}</li>}
              {politicas.map((p, i) => (
                <li key={i} className="evitar-corte">
                  <span className="font-semibold">{p.titulo}.</span> {p.texto}
                </li>
              ))}
            </ul>
          </Bloque>
        )}

        <footer className="mt-10 border-t border-[#e6ddc9] pt-4 text-center text-[12px] text-[#5c6470]">
          <p className="font-serif text-base italic text-[#1f3b2f]">{MARCA.cierre}</p>
          <p className="mt-1">
            {MARCA.director} · WhatsApp {MARCA.whatsapp} · {MARCA.email} · {MARCA.web}
          </p>
        </footer>
      </article>
    </div>
  );
}
