import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import { programarEvento } from "@/lib/api/webhooks";
import { leadApi } from "@/app/api/v1/_comun";
import { nuevaReferencia } from "@/lib/wompi";
import { calcularCobro, cobraAlgo, resumenTexto, validar, vacio, type Valores } from "./esquema";
import { normalizarConfig, type ConfigFormulario, type FormularioFila } from "./tipos";

const ERRORES_TABLA = ["42P01", "PGRST205"];

export function filaAFormulario(f: Record<string, unknown>): FormularioFila {
  const plantilla = f.plantilla as FormularioFila["plantilla"];
  return {
    id: f.id as string,
    slug: f.slug as string,
    nombre: f.nombre as string,
    plantilla,
    publicado: Boolean(f.publicado),
    config: normalizarConfig(f.config as Partial<ConfigFormulario>, plantilla),
    created_at: f.created_at as string,
    updated_at: f.updated_at as string,
  };
}

export type ResultadoInscripcion =
  | { ok: true; pago: string | null; exito: ConfigFormulario["exito"] }
  | { ok: false; status: number; error: string; errores?: Record<string, string> };

/** Recibe una inscripción: valida, crea el lead en el CRM, guarda la respuesta y,
 *  si el formulario cobra, deja listo el pago de Wompi. Usa la clave de servicio. */
export async function procesarInscripcion(slug: string, valores: Valores): Promise<ResultadoInscripcion> {
  const db = createServiceClient();
  if (!db) {
    return { ok: false, status: 503, error: "Las inscripciones aún no están activadas en el servidor (falta SUPABASE_SERVICE_ROLE_KEY)." };
  }

  const { data: fila, error: eForm } = await db.from("formularios").select("*").eq("slug", slug).maybeSingle();
  if (eForm) {
    const falta = ERRORES_TABLA.includes(eForm.code ?? "");
    return { ok: false, status: 500, error: falta ? "Falta aplicar la migración 0010 en Supabase." : "No se pudo leer el formulario." };
  }
  if (!fila || !fila.publicado) return { ok: false, status: 404, error: "Este formulario no está disponible." };
  const f = filaAFormulario(fila);
  const cfg = f.config;

  if (cfg.cierre && new Date().toISOString().slice(0, 10) > cfg.cierre) {
    return { ok: false, status: 410, error: "Las inscripciones de este formulario ya cerraron." };
  }
  if (cfg.cupos != null) {
    const { count } = await db
      .from("inscripciones")
      .select("id", { count: "exact", head: true })
      .eq("formulario_id", f.id)
      .neq("estado", "cancelada");
    if ((count ?? 0) >= cfg.cupos) return { ok: false, status: 409, error: "Los cupos de este formulario se agotaron." };
  }

  const { errores, limpio } = validar(cfg, valores);
  if (Object.keys(errores).length > 0) return { ok: false, status: 400, error: "Revise los campos marcados.", errores };

  const dato = (m: "nombre" | "email" | "telefono") => {
    const c = cfg.campos.find((x) => x.mapeo === m);
    const v = c ? limpio[c.id] : undefined;
    return typeof v === "string" && v ? v : null;
  };
  const nombre = dato("nombre");
  const email = dato("email");
  const telefono = dato("telefono");
  if (!email) return { ok: false, status: 400, error: "El formulario necesita un campo de correo." };

  const cobro = calcularCobro(cfg, limpio);
  const cobra = cobraAlgo(cfg, cobro);
  const fechaCampo = cfg.campos.find((c) => c.tipo === "fecha");
  const fecha = fechaCampo ? limpio[fechaCampo.id] : undefined;

  // 1) Lead en el CRM
  const lead = {
    nombre: nombre ?? email,
    email,
    telefono,
    mensaje: `Formulario «${f.nombre}»\n${resumenTexto(cfg, limpio)}`.slice(0, 3900),
    fecha_tentativa: typeof fecha === "string" && fecha ? fecha : null,
    valor_estimado_cop: cobro.totalCop > 0 ? cobro.totalCop : null,
    origen: "contacto" as const,
  };
  const etiquetas = [...cfg.etiquetas, `form:${f.slug}`];
  let r = await db.from("contactos").insert({ ...lead, etiquetas }).select("*").single();
  if (r.error && ["42703", "PGRST204"].includes(r.error.code ?? "")) {
    r = await db.from("contactos").insert(lead).select("*").single();
  }
  const contacto = r.data;

  // 2) La respuesta
  const referencia = cobra ? nuevaReferencia() : null;
  const { data: insc, error: eInsc } = await db
    .from("inscripciones")
    .insert({
      formulario_id: f.id,
      datos: limpio,
      nombre,
      email,
      telefono,
      contacto_id: contacto?.id ?? null,
      estado: cobra ? "pendiente_pago" : "recibida",
      monto_cop: cobra ? cobro.cobrarCop : null,
      pago_referencia: referencia,
    })
    .select("id")
    .single();
  if (eInsc || !insc) {
    const falta = ERRORES_TABLA.includes(eInsc?.code ?? "");
    return { ok: false, status: 500, error: falta ? "Falta aplicar la migración 0010 en Supabase." : "No se pudo guardar su inscripción." };
  }

  // 3) El cobro
  if (cobra && referencia) {
    const { error: ePago } = await db.from("pagos").insert({
      referencia,
      monto_cop: cobro.cobrarCop,
      concepto: cfg.pago.concepto || f.nombre,
      nombre,
      email,
      telefono,
      origen: "inscripcion",
      origen_id: insc.id,
    });
    if (ePago) return { ok: false, status: 500, error: "Se guardó su inscripción, pero no se pudo preparar el pago. Un asesor le contactará." };
  }

  // 4) Avisos a los webhooks
  if (contacto) programarEvento("lead.creado", leadApi(contacto));
  programarEvento("inscripcion.creada", {
    inscripcion: insc.id,
    formulario: f.slug,
    nombre,
    email,
    respuestas: Object.fromEntries(Object.entries(limpio).filter(([, v]) => !vacio(v))),
    monto_cop: cobra ? cobro.cobrarCop : null,
    pago_referencia: referencia,
  });

  return { ok: true, pago: referencia ? `/pagar/${referencia}?ir=1` : null, exito: cfg.exito };
}

/** Lectura pública (RLS: solo formularios publicados). */
export async function leerFormularioPublico(db: SupabaseClient, slug: string): Promise<FormularioFila | null> {
  const { data } = await db.from("formularios").select("*").eq("slug", slug).eq("publicado", true).maybeSingle();
  return data ? filaAFormulario(data) : null;
}
