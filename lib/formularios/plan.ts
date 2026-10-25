import { campoNuevo, configPorDefecto, type CampoFormulario, type ConfigFormulario, type Plantilla } from "./tipos";
import { etiquetaSalida, etiquetaTarifa, parsePrecio, salidasAbiertas, type PlanInfo } from "@/lib/precios";

/** Lógica pura (sirve en el editor y en el servidor) para unir un formulario con un plan. */

export interface OpcionesPlan {
  nombreForm: boolean;
  textos: boolean;
  foto: boolean;
  info: boolean;
  salidas: boolean;
  tarifas: boolean;
  incluye: boolean;
  condiciones: boolean;
  pago: boolean;
}

export const TODO_DEL_PLAN: OpcionesPlan = {
  nombreForm: true,
  textos: true,
  foto: true,
  info: true,
  salidas: true,
  tarifas: true,
  incluye: true,
  condiciones: true,
  pago: true,
};

/** Campos que genera un plan: al soltar otro plan se reemplazan solos, sin tocar los tuyos. */
export const IDS_PLAN = ["plan_info", "plan_incluye", "plan_salida", "plan_tarifa", "plan_condiciones"];

/** Rellena el formulario con la información del plan. */
export function aplicarPlan(base: ConfigFormulario, plantilla: Plantilla, plan: PlanInfo, o: OpcionesPlan): ConfigFormulario {
  const cfg: ConfigFormulario = JSON.parse(JSON.stringify(base));
  cfg.experiencia = plan.slug;
  cfg.etiquetas = [...new Set([...cfg.etiquetas, plan.nombre, plan.pais].filter(Boolean))];
  if (o.textos) {
    cfg.titulo = plan.nombre;
    cfg.descripcion = (plan.resumen || plan.descripcion).slice(0, 240);
    cfg.boton = "Reservar mi cupo";
  }
  if (o.foto && plan.foto) cfg.diseno.imagen = plan.foto;

  let campos = cfg.campos.filter((c) => !IDS_PLAN.includes(c.id));

  // Los datos de contacto y el número de personas nunca deben faltar.
  const basicos = configPorDefecto(plantilla).campos.filter((c) => ["nombre", "email", "telefono", "personas"].includes(c.id));
  for (const b of [...basicos].reverse()) if (!campos.some((c) => c.id === b.id)) campos.unshift(b);
  if (plan.grupoMax) campos = campos.map((c) => (c.personas ? { ...c, max: plan.grupoMax } : c));

  const nuevos: CampoFormulario[] = [];
  if (o.info) {
    nuevos.push({
      ...campoNuevo("titulo"),
      id: "plan_info",
      etiqueta: `${plan.bandera} ${plan.nombre}`.trim(),
      ayuda: [plan.subtitulo, plan.fechas, plan.duracion, plan.desde ? `Desde ${plan.desde}` : ""].filter(Boolean).join(" · "),
    });
  }
  if (o.incluye && plan.incluye.length > 0) {
    nuevos.push({ ...campoNuevo("titulo"), id: "plan_incluye", etiqueta: "Qué incluye", ayuda: plan.incluye.slice(0, 8).join(" · ") });
  }
  const abiertas = salidasAbiertas(plan);
  if (o.salidas && abiertas.length > 0) {
    nuevos.push({
      ...campoNuevo("opciones"),
      id: "plan_salida",
      etiqueta: "Elige tu salida",
      requerido: true,
      desdePlan: "salidas",
      opciones: abiertas.map((s) => ({ etiqueta: etiquetaSalida(s) })),
    });
  }
  if (o.tarifas && plan.tarifas.length > 0) {
    nuevos.push({
      ...campoNuevo("opciones"),
      id: "plan_tarifa",
      etiqueta: "Elige tu tarifa",
      requerido: true,
      desdePlan: "tarifas",
      opciones: plan.tarifas.map((t) => ({ etiqueta: etiquetaTarifa(t) })),
    });
  }

  // Van justo después de los datos de contacto.
  let corte = 0;
  campos.forEach((c, i) => {
    if (c.mapeo) corte = i + 1;
  });
  campos = [...campos.slice(0, corte), ...nuevos, ...campos.slice(corte)];

  if (o.condiciones) {
    campos.push({
      ...campoNuevo("consentimiento"),
      id: "plan_condiciones",
      etiqueta: "Acepto las condiciones del viaje",
      requerido: true,
      ayuda: plan.politicas.map((p) => p.titulo).filter(Boolean).join(" · "),
    });
  }
  cfg.campos = campos;

  if (o.pago && plan.tarifas.length > 0) {
    cfg.pago = {
      ...cfg.pago,
      activo: true,
      fuente: "viaje",
      viajeSlug: plan.slug,
      viajePerfil: plan.tarifas[0]?.perfil ?? "",
      concepto: `Inscripción · ${plan.nombre}`,
      trmAuto: true,
      anticipoPct: plan.anticipoPct ?? cfg.pago.anticipoPct,
      perfilCampo: o.tarifas ? "plan_tarifa" : "",
    };
  }
  return cfg;
}

export interface DetalleCobro {
  viaje: string | null;
  perfil: string | null;
  usd: number | null;
  trm: number | null;
  trmFecha: string | null;
}

/** El formulario con los datos de HOY: opciones de tarifas y salidas del plan,
 *  precio actual y conversión a pesos con la TRM del día. */
export function configVivo(config: ConfigFormulario, plan: PlanInfo | undefined, trm: number): { config: ConfigFormulario; detalle: DetalleCobro } {
  const cfg: ConfigFormulario = { ...config, pago: { ...config.pago }, campos: config.campos.map((c) => ({ ...c })) };
  const detalle: DetalleCobro = { viaje: null, perfil: null, usd: null, trm: null, trmFecha: null };

  if (plan) {
    cfg.campos = cfg.campos.flatMap((c) => {
      if (c.desdePlan === "tarifas") {
        const opciones = plan.tarifas.map((t) => ({ etiqueta: etiquetaTarifa(t) }));
        return opciones.length > 0 ? [{ ...c, opciones }] : [];
      }
      if (c.desdePlan === "salidas") {
        const opciones = salidasAbiertas(plan).map((s) => ({ etiqueta: etiquetaSalida(s) }));
        return opciones.length > 0 ? [{ ...c, opciones }] : [];
      }
      return [c];
    });
  }

  const p = cfg.pago;
  if (p.fuente === "viaje" && plan) {
    const lista = plan.tarifas.map((t) => ({ etiqueta: etiquetaTarifa(t), pr: parsePrecio(t.precio) })).filter((x) => x.pr);
    const fija = plan.tarifas.find((t) => t.perfil === p.viajePerfil) ?? plan.tarifas[0];
    const pr = fija ? parsePrecio(fija.precio) : null;
    if (pr && fija) {
      p.base = pr.valor;
      p.moneda = pr.moneda;
      detalle.viaje = plan.nombre;
      detalle.perfil = fija.perfil;
    }
    p.tarifas = lista.filter((x) => x.pr!.moneda === p.moneda).map((x) => ({ etiqueta: x.etiqueta, base: x.pr!.valor }));
  }

  if (p.moneda === "USD") {
    detalle.usd = p.base;
    if (p.trmAuto && trm > 0) p.tasaUsd = trm;
    detalle.trm = p.tasaUsd;
    detalle.trmFecha = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
  }
  return { config: cfg, detalle };
}
