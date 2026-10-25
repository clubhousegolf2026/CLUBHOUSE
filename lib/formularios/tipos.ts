/** Modelo del constructor de formularios. Sin dependencias de servidor:
 *  lo usan el editor del admin, el formulario público y la API. */

export type TipoCampo =
  | "texto"
  | "email"
  | "telefono"
  | "parrafo"
  | "numero"
  | "fecha"
  | "lista"
  | "opciones"
  | "casillas"
  | "consentimiento"
  | "titulo"
  | "paso";

export const TIPOS_CAMPO: { id: TipoCampo; etiqueta: string; ayuda: string }[] = [
  { id: "texto", etiqueta: "Texto corto", ayuda: "Nombre, ciudad, documento…" },
  { id: "email", etiqueta: "Correo", ayuda: "Valida el formato" },
  { id: "telefono", etiqueta: "Teléfono", ayuda: "WhatsApp o celular" },
  { id: "parrafo", etiqueta: "Texto largo", ayuda: "Comentarios, alergias…" },
  { id: "numero", etiqueta: "Número", ayuda: "Con botones + y −" },
  { id: "fecha", etiqueta: "Fecha", ayuda: "Selector de calendario" },
  { id: "lista", etiqueta: "Lista desplegable", ayuda: "Elegir una opción" },
  { id: "opciones", etiqueta: "Opción única", ayuda: "Tarjetas para elegir una" },
  { id: "casillas", etiqueta: "Varias opciones", ayuda: "Marcar todas las que apliquen" },
  { id: "consentimiento", etiqueta: "Aceptación", ayuda: "Términos, datos personales" },
  { id: "titulo", etiqueta: "Título o texto", ayuda: "Separa y explica secciones" },
  { id: "paso", etiqueta: "Salto de paso", ayuda: "Divide el formulario en pasos" },
];

/** Estos tipos no recogen datos: son contenido o estructura. */
export const TIPOS_SIN_DATO: TipoCampo[] = ["titulo", "paso"];
export const TIPOS_CON_OPCIONES: TipoCampo[] = ["lista", "opciones", "casillas"];

export interface OpcionCampo {
  etiqueta: string;
  /** Precio adicional en COP si se elige (opcional). */
  precio?: number;
}

export interface CampoFormulario {
  id: string;
  tipo: TipoCampo;
  etiqueta: string;
  ayuda?: string;
  placeholder?: string;
  requerido?: boolean;
  ancho?: "completo" | "mitad";
  opciones?: OpcionCampo[];
  min?: number | null;
  max?: number | null;
  /** Solo se muestra si otro campo tiene este valor. */
  condicion?: { campo: string; valor: string } | null;
  /** A qué dato del CRM corresponde. */
  mapeo?: "nombre" | "email" | "telefono" | null;
  /** Número de personas: multiplica la tarifa base del pago. */
  personas?: boolean;
  /** Las opciones salen del viaje relacionado y se mantienen al día solas. */
  desdePlan?: "tarifas" | "salidas";
}

export type Plantilla = "clasico" | "pasos" | "portada" | "cristal" | "conversacional";

export const PLANTILLAS: { id: Plantilla; nombre: string; descripcion: string }[] = [
  { id: "clasico", nombre: "Clásico", descripcion: "Tarjeta centrada, limpia y elegante. La más versátil." },
  { id: "pasos", nombre: "Por pasos", descripcion: "Asistente con barra de progreso y resumen final antes de enviar." },
  { id: "portada", nombre: "Portada", descripcion: "Foto grande a un lado y el formulario al otro, estilo editorial." },
  { id: "cristal", nombre: "Cristal oscuro", descripcion: "Fondo verde profundo con tarjeta de vidrio y brillos dorados." },
  { id: "conversacional", nombre: "Conversacional", descripcion: "Una pregunta a la vez, a pantalla completa, con tecla Enter." },
];

export interface DisenoFormulario {
  acento: string;
  radio: "recto" | "suave" | "redondo";
  fuente: "serif" | "sans";
  imagen: string;
  mostrarMarca: boolean;
}

export interface ConfigPago {
  activo: boolean;
  concepto: string;
  moneda: "COP" | "USD";
  /** Tarifa por persona (o total si no hay campo de personas), en `moneda`. */
  base: number;
  /** Cuántos pesos vale un dólar (solo si moneda es USD). */
  tasaUsd: number;
  /** Si se cobra solo un anticipo: porcentaje 1–100. */
  anticipoPct: number | null;
  /** De dónde sale la tarifa: escrita a mano o tomada de un viaje (siempre actualizada). */
  fuente: "fijo" | "viaje";
  viajeSlug: string;
  /** Perfil de la tarifa del viaje (p. ej. «Golfista»). */
  viajePerfil: string;
  /** Si la tarifa está en USD: convertir con la TRM del día en lugar de `tasaUsd`. */
  trmAuto: boolean;
  /** Campo (id) cuya opción elegida decide la tarifa. Vacío = la tarifa fija de arriba. */
  perfilCampo: string;
  /** Tarifas del viaje con su valor (las completa el servidor con los precios de hoy). */
  tarifas: { etiqueta: string; base: number }[];
}

export interface ConfigFormulario {
  titulo: string;
  descripcion: string;
  boton: string;
  exito: { titulo: string; texto: string; redireccion: string };
  diseno: DisenoFormulario;
  campos: CampoFormulario[];
  pago: ConfigPago;
  cupos: number | null;
  /** Fecha límite (YYYY-MM-DD); vacío = sin límite. */
  cierre: string;
  /** Viaje relacionado (solo informativo, sale en el CRM). */
  experiencia: string;
  etiquetas: string[];
}

export interface FormularioFila {
  id: string;
  slug: string;
  nombre: string;
  plantilla: Plantilla;
  publicado: boolean;
  config: ConfigFormulario;
  created_at: string;
  updated_at: string;
}

export const PALETA_ACENTOS = ["#a98745", "#2e5b45", "#2563eb", "#b42318", "#6d28d9", "#0e7490", "#be185d", "#1a1a1a"];

const id = () => Math.random().toString(36).slice(2, 8);

export function campoNuevo(tipo: TipoCampo): CampoFormulario {
  const base: CampoFormulario = { id: `c_${id()}`, tipo, etiqueta: "", requerido: false, ancho: "completo" };
  switch (tipo) {
    case "texto": return { ...base, etiqueta: "Pregunta" };
    case "email": return { ...base, etiqueta: "Correo electrónico", requerido: true, mapeo: "email" };
    case "telefono": return { ...base, etiqueta: "Teléfono / WhatsApp", mapeo: "telefono" };
    case "parrafo": return { ...base, etiqueta: "Comentarios" };
    case "numero": return { ...base, etiqueta: "Cantidad", min: 1, max: 20 };
    case "fecha": return { ...base, etiqueta: "Fecha" };
    case "lista": return { ...base, etiqueta: "Elige una opción", opciones: [{ etiqueta: "Opción 1" }, { etiqueta: "Opción 2" }] };
    case "opciones": return { ...base, etiqueta: "Elige una opción", opciones: [{ etiqueta: "Opción 1" }, { etiqueta: "Opción 2" }] };
    case "casillas": return { ...base, etiqueta: "Marca las que apliquen", opciones: [{ etiqueta: "Opción 1" }, { etiqueta: "Opción 2" }] };
    case "consentimiento": return { ...base, etiqueta: "Acepto el tratamiento de mis datos personales", requerido: true };
    case "titulo": return { ...base, etiqueta: "Título de la sección", ayuda: "" };
    case "paso": return { ...base, etiqueta: "Nuevo paso" };
  }
}

/** Configuración inicial de un formulario nuevo (cada plantilla arranca con lo que mejor le queda). */
export function configPorDefecto(plantilla: Plantilla, nombre = "Inscripción"): ConfigFormulario {
  const personas: CampoFormulario = { ...campoNuevo("numero"), id: "personas", etiqueta: "¿Cuántos golfistas viajan?", min: 1, max: 40, personas: true, ancho: "mitad", requerido: true };
  const datos: CampoFormulario[] = [
    { ...campoNuevo("texto"), id: "nombre", etiqueta: "Nombre completo", requerido: true, mapeo: "nombre", ancho: "mitad" },
    { ...campoNuevo("email"), id: "email", ancho: "mitad" },
    { ...campoNuevo("telefono"), id: "telefono", ancho: "mitad" },
    personas,
    { ...campoNuevo("fecha"), id: "fecha", etiqueta: "Fecha tentativa de viaje", ancho: "mitad" },
    { ...campoNuevo("parrafo"), id: "mensaje", etiqueta: "Cuéntenos más", placeholder: "Campos que sueña jugar, ocasión del viaje…" },
    { ...campoNuevo("consentimiento"), id: "acepto" },
  ];

  let campos: CampoFormulario[] = datos;
  if (plantilla === "pasos") {
    campos = [
      { ...campoNuevo("paso"), id: "p1", etiqueta: "Sus datos" },
      datos[0], datos[1], datos[2],
      { ...campoNuevo("paso"), id: "p2", etiqueta: "Su viaje" },
      datos[3], datos[4], datos[5],
      { ...campoNuevo("paso"), id: "p3", etiqueta: "Confirmación" },
      datos[6],
    ];
  }

  return {
    titulo: nombre,
    descripcion: "Complete sus datos y un asesor de Clubhouse se pondrá en contacto.",
    boton: "Enviar inscripción",
    exito: { titulo: "¡Inscripción recibida!", texto: "Gracias. Un asesor le contactará muy pronto para confirmar los detalles.", redireccion: "" },
    diseno: {
      acento: plantilla === "cristal" ? "#e8c97a" : plantilla === "conversacional" ? "#2e5b45" : "#a98745",
      radio: plantilla === "cristal" ? "redondo" : "suave",
      fuente: "serif",
      imagen: "/fotos/utah.webp",
      mostrarMarca: true,
    },
    campos,
    pago: { activo: false, concepto: nombre, moneda: "COP", base: 0, tasaUsd: 4000, anticipoPct: null, fuente: "fijo", viajeSlug: "", viajePerfil: "", trmAuto: true, perfilCampo: "", tarifas: [] },
    cupos: null,
    cierre: "",
    experiencia: "",
    etiquetas: [],
  };
}

/** Mezcla lo guardado con los valores por defecto (por si a una config vieja le faltan claves). */
export function normalizarConfig(c: Partial<ConfigFormulario> | null | undefined, plantilla: Plantilla): ConfigFormulario {
  const d = configPorDefecto(plantilla);
  const x = c ?? {};
  return {
    ...d,
    ...x,
    exito: { ...d.exito, ...(x.exito ?? {}) },
    diseno: { ...d.diseno, ...(x.diseno ?? {}) },
    pago: { ...d.pago, ...(x.pago ?? {}) },
    campos: Array.isArray(x.campos) ? x.campos : d.campos,
    etiquetas: Array.isArray(x.etiquetas) ? x.etiquetas : [],
  };
}

export const slugificar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const MIN_PAGO_COP = 1500;
