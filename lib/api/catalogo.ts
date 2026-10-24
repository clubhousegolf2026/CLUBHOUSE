/** Listas de permisos y eventos. Sin dependencias de servidor para poder
 *  usarlas también desde componentes de cliente. */

export const SCOPES = [
  { id: "leads:read", etiqueta: "Leads · leer", ayuda: "Listar y consultar leads" },
  { id: "leads:write", etiqueta: "Leads · escribir", ayuda: "Crear, editar y eliminar leads" },
  { id: "reservas:read", etiqueta: "Reservas · leer", ayuda: "Listar y consultar reservas" },
] as const;
export type Scope = (typeof SCOPES)[number]["id"];

export const EVENTOS = [
  { id: "lead.creado", etiqueta: "Lead creado", ayuda: "Llega un lead nuevo: formulario del sitio, admin o API." },
  { id: "lead.etapa_cambiada", etiqueta: "Lead cambia de etapa", ayuda: "Un lead se mueve de columna en el CRM." },
  { id: "reserva.creada", etiqueta: "Reserva creada", ayuda: "Se registra una reserva nueva." },
  { id: "reserva.pago_cambiado", etiqueta: "Pago de reserva cambia", ayuda: "Una reserva pasa a pagada, fallida, reembolsada…" },
  { id: "inscripcion.creada", etiqueta: "Inscripción recibida", ayuda: "Alguien envía un formulario de inscripción." },
  { id: "pago.aprobado", etiqueta: "Pago aprobado (Wompi)", ayuda: "Wompi confirma un pago." },
] as const;
export type EventoId = (typeof EVENTOS)[number]["id"];

export const PREFIJO_CLAVE = "ch_live_";
