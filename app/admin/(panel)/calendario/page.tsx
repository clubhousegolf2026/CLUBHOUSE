import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { getExperienciasAdmin } from "@/lib/contenido/experiencias-editables";
import { BloqueoForm } from "@/components/admin/bloqueo-form";
import { EliminarBloqueoButton } from "@/components/admin/eliminar-bloqueo-button";
import { EditarBloqueoButton } from "@/components/admin/editar-bloqueo-button";
import { CalendarioMes, type EventoCal, type SerieCal } from "@/components/admin/calendario/calendario-mes";
import {
  AjustesCalendario,
  NuevoCalendario,
  type CalendarioFila,
} from "@/components/admin/calendario/calendarios-gestion";
import { fechaCo } from "@/lib/format";

export const dynamic = "force-dynamic";

const ETIQUETA_TIPO: Record<string, { texto: string; tono: string }> = {
  bloqueo: { texto: "Bloqueo", tono: "bg-error/10 text-error" },
  temporada_alta: { texto: "Temporada alta", tono: "bg-champagne/15 text-[#8a6d1f]" },
  cupo: { texto: "Cupo limitado", tono: "bg-verde-golf/10 text-verde-golf" },
};

type Bloqueo = {
  id: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: "bloqueo" | "temporada_alta" | "cupo";
  nota: string | null;
  factor_precio: number | null;
  paquete_id: string | null;
  calendario_id: string | null;
};

type Lead = {
  id: string;
  nombre: string;
  estado: string;
  fecha_tentativa: string | null;
  proxima_fecha: string | null;
  proxima_accion: string | null;
};

const COLOR_LIBRE = "#5c6470";
const COLOR_SALIDAS = "#a98745";
const COLOR_CRM = "#6d28d9";

const tituloBloqueo = (b: Bloqueo) =>
  `${ETIQUETA_TIPO[b.tipo].texto}${b.nota ? ` · ${b.nota}` : ""}`;

export default async function CalendarioAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ cal?: string }>;
}) {
  const { cal } = await searchParams;
  const supabase = (await createServerSupabase()) as unknown as SupabaseClient;

  const [calendariosR, bloqueosR, leadsR, exps] = await Promise.all([
    supabase.from("calendarios").select("id, nombre, descripcion, color, experiencia_slug").order("orden").order("created_at"),
    supabase.from("bloqueos_calendario").select("*").order("fecha_inicio"),
    supabase
      .from("contactos")
      .select("id, nombre, estado, fecha_tentativa, proxima_fecha, proxima_accion")
      .neq("estado", "perdido")
      .or("fecha_tentativa.not.is.null,proxima_fecha.not.is.null"),
    getExperienciasAdmin(supabase),
  ]);

  const migracionPendiente = Boolean(calendariosR.error && ["42P01", "PGRST205"].includes(calendariosR.error.code ?? ""));
  const calendarios = (calendariosR.error ? [] : calendariosR.data ?? []) as CalendarioFila[];
  const bloqueos = ((bloqueosR.data ?? []) as Bloqueo[]).filter((b) => !b.paquete_id);
  const leads = (leadsR.error ? [] : leadsR.data ?? []) as Lead[];
  const experiencias = exps.experiencias.map((e) => ({ slug: e.slug, nombre: e.nombre }));

  const serieDe = (b: Bloqueo) => (b.calendario_id ? `cal:${b.calendario_id}` : "cal:libre");

  const salidas: (EventoCal & { slug: string })[] = exps.experiencias.flatMap((e) =>
    (e.salidas ?? [])
      .filter((s) => s.inicio && s.fin)
      .map((s) => ({
        id: `salida:${e.slug}:${s.id}`,
        slug: e.slug,
        titulo: `${e.nombre}${s.estado === "llena" ? " (llena)" : ""}`,
        inicio: s.inicio,
        fin: s.fin,
        serie: "salidas",
        tipo: "salida" as const,
        detalle: [s.cupos != null ? `${s.cupos} cupos` : "", s.nota].filter(Boolean).join(" · ") || undefined,
        href: `/admin/experiencias/${e.slug}`,
      })),
  );

  const eventosLeads: EventoCal[] = leads.flatMap((l) => {
    const lista: EventoCal[] = [];
    if (l.fecha_tentativa) {
      lista.push({ id: `lead:${l.id}`, titulo: l.nombre, inicio: l.fecha_tentativa, fin: l.fecha_tentativa, serie: "crm", tipo: "lead", href: "/admin/crm" });
    }
    if (l.proxima_fecha) {
      lista.push({ id: `accion:${l.id}`, titulo: `${l.nombre}: ${l.proxima_accion ?? "seguimiento"}`, inicio: l.proxima_fecha, fin: l.proxima_fecha, serie: "crm", tipo: "accion", href: "/admin/crm" });
    }
    return lista;
  });

  const eventosBloqueos: EventoCal[] = bloqueos.map((b) => ({
    id: `b:${b.id}`,
    titulo: tituloBloqueo(b),
    inicio: b.fecha_inicio,
    fin: b.fecha_fin,
    serie: serieDe(b),
    tipo: b.tipo,
    detalle: b.tipo === "temporada_alta" && b.factor_precio ? `Precio +${Math.round((b.factor_precio - 1) * 100)}%` : undefined,
  }));

  const seleccionado = cal && cal !== "libre" ? calendarios.find((c) => c.id === cal) ?? null : null;
  const vistaLibre = cal === "libre";

  // ── qué se muestra en el calendario mensual según la pestaña ──
  let series: SerieCal[];
  let eventos: EventoCal[];
  if (seleccionado) {
    series = [{ id: `cal:${seleccionado.id}`, nombre: seleccionado.nombre, color: seleccionado.color }];
    eventos = eventosBloqueos.filter((e) => e.serie === `cal:${seleccionado.id}`);
    if (seleccionado.experiencia_slug) {
      series.push({ id: "salidas", nombre: "Salidas del viaje", color: COLOR_SALIDAS });
      eventos.push(...salidas.filter((s) => s.slug === seleccionado.experiencia_slug));
    }
  } else if (vistaLibre) {
    series = [{ id: "cal:libre", nombre: "Itinerario libre", color: COLOR_LIBRE }];
    eventos = eventosBloqueos.filter((e) => e.serie === "cal:libre");
  } else {
    series = [
      { id: "cal:libre", nombre: "Itinerario libre", color: COLOR_LIBRE },
      ...calendarios.map((c) => ({ id: `cal:${c.id}`, nombre: c.nombre, color: c.color })),
      { id: "salidas", nombre: "Salidas de viajes", color: COLOR_SALIDAS },
      { id: "crm", nombre: "CRM · fechas de leads", color: COLOR_CRM },
    ];
    eventos = [...eventosBloqueos, ...salidas, ...eventosLeads];
  }

  const filas = bloqueos.filter((b) => (seleccionado ? b.calendario_id === seleccionado.id : !b.calendario_id));

  const pestana = (activa: boolean) =>
    `inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
      activa ? "bg-verde-calle text-crema" : "text-niebla hover:text-carbon"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-carbon">Calendario</h1>
          <p className="max-w-2xl text-sm text-niebla">
            El calendario general junta todo: fechas bloqueadas, temporadas, salidas de los viajes y seguimientos del CRM.
            Crea un calendario aparte por viaje, por campo o por lo que necesites.
          </p>
        </div>
        <NuevoCalendario experiencias={experiencias} />
      </div>

      {migracionPendiente && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-alerta/30 bg-alerta/10 p-4 text-sm text-alerta">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <strong className="block">Falta crear la tabla de calendarios en Supabase.</strong>
            Ejecuta <code>supabase/migrations/0008_calendarios.sql</code> en el SQL Editor y recarga.
          </div>
        </div>
      )}

      <div className="flex w-fit max-w-full flex-wrap gap-1.5 rounded-3xl bg-arena/30 p-1.5">
        <Link href="/admin/calendario" className={pestana(!cal)}>
          <CalendarDays size={15} /> Calendario general
        </Link>
        <Link href="/admin/calendario?cal=libre" className={pestana(vistaLibre)}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR_LIBRE }} /> Itinerario libre
        </Link>
        {calendarios.map((c) => (
          <Link key={c.id} href={`/admin/calendario?cal=${c.id}`} className={pestana(seleccionado?.id === c.id)}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} /> {c.nombre}
          </Link>
        ))}
      </div>

      {seleccionado && (
        <div className="space-y-3">
          {seleccionado.descripcion && <p className="text-sm text-niebla">{seleccionado.descripcion}</p>}
          <AjustesCalendario calendario={seleccionado} experiencias={experiencias} />
        </div>
      )}
      {vistaLibre && (
        <p className="text-sm text-niebla">
          Estas fechas son las que usa el <strong className="text-carbon">cotizador libre</strong> del sitio: un bloqueo impide
          cotizar ese día y una temporada alta sube el precio.
        </p>
      )}

      <CalendarioMes key={cal ?? "general"} eventos={eventos} series={series} />

      {(seleccionado || vistaLibre) && (
        <>
          <BloqueoForm calendarioId={seleccionado?.id ?? null} />

          <div className="overflow-hidden rounded-[var(--radius-panel)] border border-arena bg-blanco-roto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-arena text-left text-xs uppercase tracking-wide text-niebla">
                  <th className="px-4 py-3">Rango</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Nota</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filas.map((b) => {
                  const et = ETIQUETA_TIPO[b.tipo];
                  return (
                    <tr key={b.id} className="border-b border-arena last:border-0">
                      <td className="px-4 py-3">
                        {fechaCo(b.fecha_inicio)} — {fechaCo(b.fecha_fin)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${et.tono}`}>
                          {et.texto}
                          {b.factor_precio ? ` (+${Math.round((b.factor_precio - 1) * 100)}%)` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-niebla">{b.nota ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          <EditarBloqueoButton bloqueo={b} />
                          <EliminarBloqueoButton id={b.id} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-niebla">
                      {seleccionado
                        ? "Este calendario todavía no tiene fechas. Agrega la primera arriba."
                        : "El itinerario libre no tiene fechas restringidas."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {cal && !seleccionado && !vistaLibre && (
        <p className="text-sm text-niebla">
          No se encontró ese calendario. <Link href="/admin/calendario" className="text-verde-golf underline">Volver al general</Link>.
        </p>
      )}
    </div>
  );
}
