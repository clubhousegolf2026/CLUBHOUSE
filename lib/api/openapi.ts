import { EVENTOS, type EventoId } from "./catalogo";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Obj = Record<string, any>;

const ESTADOS_LEAD = ["nuevo", "contactado", "cotizado", "confirmado", "viajo", "perdido"];
const ESTADOS_PAGO = ["pendiente", "pagado", "fallido", "reembolsado"];

const ref = (n: string) => ({ $ref: `#/components/schemas/${n}` });
const json = (schema: Obj, ejemplo?: unknown) => ({
  "application/json": { schema, ...(ejemplo !== undefined ? { example: ejemplo } : {}) },
});
const errores = (...codigos: number[]) =>
  Object.fromEntries(
    codigos.map((c) => [
      String(c),
      {
        description: {
          400: "Datos inválidos.",
          401: "Falta la clave o no es válida.",
          403: "La clave no tiene el permiso necesario.",
          404: "No se encontró el recurso.",
          429: "Demasiadas solicitudes (límite: 120 por minuto).",
          500: "Error interno.",
          503: "La API no está activada en el servidor.",
        }[c as 400] ?? "Error.",
        content: json(ref("Error")),
      },
    ]),
  );

const LEAD_EJEMPLO = {
  id: "5b0c9c2e-6f0a-4a8e-9d51-2f3a2b1c7d10",
  nombre: "Carlos Gómez",
  email: "carlos@example.com",
  telefono: "+573001112233",
  estado: "nuevo",
  origen: "contacto",
  valor_estimado_cop: 15000000,
  mensaje: "Somos 4 golfistas y queremos la Utah Experience.",
  notas: null,
  fecha_tentativa: "2027-06-28",
  proxima_accion: "Llamar para confirmar fechas",
  proxima_fecha: "2026-11-02",
  etiquetas: ["Utah", "grupo"],
  creado: "2026-10-24T14:03:11.000Z",
  actualizado: "2026-10-24T14:03:11.000Z",
};

export function especificacionOpenApi(origen: string): Obj {
  const parametroId = { name: "id", in: "path", required: true, description: "Identificador (UUID).", schema: { type: "string", format: "uuid" } };
  const paginacion = [
    { name: "limite", in: "query", description: "Resultados por página (1–100).", schema: { type: "integer", minimum: 1, maximum: 100, default: 50 } },
    { name: "desplazamiento", in: "query", description: "Cuántos resultados saltar.", schema: { type: "integer", minimum: 0, default: 0 } },
  ];
  const seguridad = [{ bearerAuth: [] }];

  const eventosDoc: Obj = {};
  for (const ev of EVENTOS) {
    eventosDoc[ev.id] = {
      summary: ev.etiqueta,
      description: ev.ayuda,
      requestBody: {
        content: json(ref("EventoWebhook"), ejemploEvento(ev.id)),
      },
    };
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "API de Clubhouse",
      version: "1.0.0",
      description: [
        "API REST de **Clubhouse** (agencia de viajes de golf) para conectar el CRM con otros sistemas: automatizaciones (n8n, Zapier, Make), contabilidad, WhatsApp, tu propio sitio.",
        "",
        "**Autenticación.** Los endpoints de leads y reservas usan una clave en el encabezado `Authorization: Bearer ch_live_…`. Se crean en *Admin → Integraciones → Claves de API*. Cada clave tiene permisos (scopes) y se puede revocar en cualquier momento. El catálogo de experiencias es público y no necesita clave.",
        "",
        "**Formato.** Todo es JSON (UTF-8). Las fechas van en ISO 8601. Los errores siempre llegan como `{ \"error\": { \"code\", \"message\" } }`.",
        "",
        "**Límites.** 120 solicitudes por minuto y por IP.",
        "",
        "**Webhooks.** Además de consultar, Clubhouse puede avisarte cuando algo pasa (un lead nuevo, un pago…). Mira la sección *Webhooks* al final.",
      ].join("\n"),
    },
    servers: [{ url: origen, description: "Producción" }],
    tags: [
      { name: "Leads", description: "Contactos del CRM: crear, consultar, mover de etapa y eliminar." },
      { name: "Reservas", description: "Reservas y su estado de pago (solo lectura)." },
      { name: "Experiencias", description: "Catálogo público de viajes. Sin clave." },
      { name: "Sistema", description: "Estado del servicio." },
    ],
    security: seguridad,
    paths: {
      "/api/v1/health": {
        get: {
          tags: ["Sistema"],
          summary: "Estado del servicio",
          description: "Responde 200 si la API está arriba. No requiere clave.",
          security: [],
          responses: { "200": { description: "OK", content: json({ type: "object", properties: { ok: { type: "boolean" }, version: { type: "string" }, hora: { type: "string", format: "date-time" } } }, { ok: true, version: "1", hora: "2026-10-24T14:00:00.000Z" }) } },
        },
      },
      "/api/v1/leads": {
        get: {
          tags: ["Leads"],
          summary: "Listar leads",
          description: "Devuelve los leads del CRM, del más reciente al más antiguo. Permiso: `leads:read`.",
          parameters: [
            { name: "estado", in: "query", description: "Filtra por etapa del embudo.", schema: { type: "string", enum: ESTADOS_LEAD } },
            { name: "q", in: "query", description: "Busca en nombre y correo.", schema: { type: "string" } },
            ...paginacion,
          ],
          responses: {
            "200": { description: "Lista paginada.", content: json({ type: "object", properties: { datos: { type: "array", items: ref("Lead") }, total: { type: "integer" }, limite: { type: "integer" }, desplazamiento: { type: "integer" } } }, { datos: [LEAD_EJEMPLO], total: 1, limite: 50, desplazamiento: 0 }) },
            ...errores(400, 401, 403, 429, 503),
          },
        },
        post: {
          tags: ["Leads"],
          summary: "Crear un lead",
          description: "Crea un contacto nuevo en la etapa **nuevo** y dispara el evento `lead.creado`. Permiso: `leads:write`.",
          requestBody: { required: true, content: json(ref("LeadCrear"), { nombre: "Carlos Gómez", email: "carlos@example.com", telefono: "+573001112233", mensaje: "Somos 4 golfistas y queremos la Utah Experience.", etiquetas: ["Utah"] }) },
          responses: { "201": { description: "Lead creado.", content: json(ref("Lead"), LEAD_EJEMPLO) }, ...errores(400, 401, 403, 429, 503) },
        },
      },
      "/api/v1/leads/{id}": {
        get: {
          tags: ["Leads"],
          summary: "Consultar un lead",
          description: "Permiso: `leads:read`.",
          parameters: [parametroId],
          responses: { "200": { description: "El lead.", content: json(ref("Lead"), LEAD_EJEMPLO) }, ...errores(400, 401, 403, 404, 429, 503) },
        },
        patch: {
          tags: ["Leads"],
          summary: "Actualizar un lead",
          description: "Envía solo los campos que cambian. Si cambias `estado`, el lead se mueve de columna en el CRM y se dispara `lead.etapa_cambiada`. Permiso: `leads:write`.",
          parameters: [parametroId],
          requestBody: { required: true, content: json(ref("LeadEditar"), { estado: "contactado", proxima_accion: "Enviar cotización", proxima_fecha: "2026-11-02" }) },
          responses: { "200": { description: "El lead actualizado.", content: json(ref("Lead"), { ...LEAD_EJEMPLO, estado: "contactado" }) }, ...errores(400, 401, 403, 404, 429, 503) },
        },
        delete: {
          tags: ["Leads"],
          summary: "Eliminar un lead",
          description: "Borra el lead y todo su historial. No se puede deshacer. Permiso: `leads:write`.",
          parameters: [parametroId],
          responses: { "204": { description: "Eliminado." }, ...errores(400, 401, 403, 404, 429, 503) },
        },
      },
      "/api/v1/reservas": {
        get: {
          tags: ["Reservas"],
          summary: "Listar reservas",
          description: "Permiso: `reservas:read`.",
          parameters: [
            { name: "estado_pago", in: "query", description: "Filtra por estado de pago.", schema: { type: "string", enum: ESTADOS_PAGO } },
            ...paginacion,
          ],
          responses: {
            "200": { description: "Lista paginada.", content: json({ type: "object", properties: { datos: { type: "array", items: ref("Reserva") }, total: { type: "integer" }, limite: { type: "integer" }, desplazamiento: { type: "integer" } } }) },
            ...errores(400, 401, 403, 429, 503),
          },
        },
      },
      "/api/v1/reservas/{id}": {
        get: {
          tags: ["Reservas"],
          summary: "Consultar una reserva",
          description: "Permiso: `reservas:read`.",
          parameters: [parametroId],
          responses: { "200": { description: "La reserva.", content: json(ref("Reserva")) }, ...errores(400, 401, 403, 404, 429, 503) },
        },
      },
      "/api/v1/experiencias": {
        get: {
          tags: ["Experiencias"],
          summary: "Listar experiencias publicadas",
          description: "Catálogo público de viajes. No requiere clave. Nunca incluye costos ni márgenes.",
          security: [],
          responses: { "200": { description: "Las experiencias publicadas.", content: json({ type: "object", properties: { datos: { type: "array", items: ref("Experiencia") }, total: { type: "integer" } } }) }, ...errores(429) },
        },
      },
      "/api/v1/experiencias/{slug}": {
        get: {
          tags: ["Experiencias"],
          summary: "Consultar una experiencia",
          security: [],
          parameters: [{ name: "slug", in: "path", required: true, description: "Dirección de la experiencia, p. ej. `utah`.", schema: { type: "string" } }],
          responses: { "200": { description: "La experiencia.", content: json(ref("Experiencia")) }, ...errores(404, 429) },
        },
      },
    },
    "x-webhooks": {
      descripcion: [
        "Clubhouse envía un `POST` con cuerpo JSON a cada URL suscrita al evento. Configúralos en *Admin → Integraciones → Webhooks*.",
        "",
        "**Encabezados:** `X-Clubhouse-Event` (nombre del evento) y `X-Clubhouse-Signature` con la forma `t=<unix>,v1=<firma>`.",
        "",
        "**Verificar la firma:** calcula `HMAC-SHA256` con tu secreto (`whsec_…`) sobre el texto `<t>.<cuerpo exacto recibido>`, compáralo con `v1` y rechaza los mensajes con `t` de hace más de 5 minutos.",
        "",
        "**Respuesta:** responde con cualquier `2xx` en menos de 8 segundos. Cada intento queda registrado en el panel.",
      ].join("\n"),
      eventos: eventosDoc,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "ch_live_…",
          description: "Clave de API creada en Admin → Integraciones. Ejemplo: `Authorization: Bearer ch_live_abc123…`",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: { error: { type: "object", properties: { code: { type: "string", example: "clave_invalida" }, message: { type: "string", example: "La clave no existe o fue revocada." } } } },
        },
        Lead: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            telefono: { type: "string", nullable: true },
            estado: { type: "string", enum: ESTADOS_LEAD, description: "Etapa del embudo." },
            origen: { type: "string", enum: ["contacto", "cotizador"] },
            valor_estimado_cop: { type: "integer", nullable: true },
            mensaje: { type: "string", nullable: true, description: "Lo que escribió el cliente." },
            notas: { type: "string", nullable: true, description: "Notas internas." },
            fecha_tentativa: { type: "string", format: "date", nullable: true },
            proxima_accion: { type: "string", nullable: true },
            proxima_fecha: { type: "string", format: "date", nullable: true },
            etiquetas: { type: "array", items: { type: "string" } },
            creado: { type: "string", format: "date-time" },
            actualizado: { type: "string", format: "date-time" },
          },
        },
        LeadCrear: {
          type: "object",
          required: ["nombre", "email"],
          properties: {
            nombre: { type: "string", maxLength: 120 },
            email: { type: "string", format: "email" },
            telefono: { type: "string", nullable: true },
            mensaje: { type: "string", nullable: true, maxLength: 2000 },
            fecha_tentativa: { type: "string", format: "date", nullable: true },
            valor_estimado_cop: { type: "integer", minimum: 0, nullable: true },
            notas: { type: "string", nullable: true },
            etiquetas: { type: "array", items: { type: "string" }, maxItems: 20 },
          },
        },
        LeadEditar: {
          type: "object",
          description: "Todos los campos son opcionales; envía solo los que cambian.",
          properties: {
            nombre: { type: "string" },
            email: { type: "string", format: "email" },
            telefono: { type: "string", nullable: true },
            notas: { type: "string", nullable: true },
            estado: { type: "string", enum: ESTADOS_LEAD },
            valor_estimado_cop: { type: "integer", minimum: 0, nullable: true },
            proxima_accion: { type: "string", nullable: true },
            proxima_fecha: { type: "string", format: "date", nullable: true },
            etiquetas: { type: "array", items: { type: "string" } },
          },
        },
        Reserva: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            estado_pago: { type: "string", enum: ESTADOS_PAGO },
            anticipo: { type: "integer", description: "Monto del anticipo." },
            total: { type: "integer", nullable: true },
            por_persona: { type: "integer", nullable: true },
            moneda: { type: "string", example: "COP" },
            pasarela: { type: "string", nullable: true },
            referencia_pago: { type: "string", nullable: true },
            cliente: { type: "object", nullable: true, properties: { id: { type: "string", format: "uuid" }, nombre: { type: "string" }, email: { type: "string" }, telefono: { type: "string", nullable: true } } },
            creada: { type: "string", format: "date-time" },
            confirmada: { type: "string", format: "date-time", nullable: true },
          },
        },
        Experiencia: {
          type: "object",
          properties: {
            slug: { type: "string", example: "utah" },
            nombre: { type: "string", example: "Utah Experience" },
            subtitulo: { type: "string" },
            pais: { type: "string" },
            bandera: { type: "string" },
            ubicacion: { type: "object", properties: { lat: { type: "number" }, lng: { type: "number" } } },
            fechas: { type: "string", example: "28 jun – 5 jul 2027" },
            duracion: { type: "string", example: "7 noches / 8 días" },
            precio_desde: { type: "string", example: "USD 3.050" },
            resumen: { type: "string" },
            descripcion: { type: "string" },
            destacada: { type: "boolean" },
            foto: { type: "string" },
            galeria: { type: "array", items: { type: "object", properties: { url: { type: "string" }, alt: { type: "string" } } } },
            salidas: { type: "array", items: { type: "object", properties: { id: { type: "string" }, inicio: { type: "string", format: "date" }, fin: { type: "string", format: "date" }, cupos: { type: "integer", nullable: true }, estado: { type: "string", enum: ["abierta", "ultimos", "llena", "cerrada"] }, nota: { type: "string" } } } },
            tarifas: { type: "array", items: { type: "object", properties: { perfil: { type: "string" }, detalle: { type: "string" }, precio: { type: "string" }, unidad: { type: "string" }, incluye: { type: "array", items: { type: "string" } } } } },
            programa: { type: "array", items: { type: "object", properties: { fecha: { type: "string" }, titulo: { type: "string" }, detalle: { type: "array", items: { type: "string" } } } } },
            campos: { type: "array", items: { type: "object", properties: { nombre: { type: "string" }, lugar: { type: "string" }, descripcion: { type: "string" }, datos: { type: "array", items: { type: "string" } }, foto: { type: "string" } } } },
            alojamiento: { type: "array", items: { type: "object", properties: { periodo: { type: "string" }, nombre: { type: "string" }, descripcion: { type: "string" } } } },
            incluye: { type: "array", items: { type: "string" } },
            no_incluye: { type: "array", items: { type: "string" } },
            politicas: { type: "array", items: { type: "object", properties: { titulo: { type: "string" }, texto: { type: "string" } } } },
            faq: { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } } } },
            url: { type: "string", example: "/experiencias/utah" },
          },
        },
        EventoWebhook: {
          type: "object",
          description: "Cuerpo que recibe tu URL.",
          properties: {
            id: { type: "string", format: "uuid", description: "Identificador único de la entrega." },
            evento: { type: "string", enum: EVENTOS.map((e) => e.id) },
            creado: { type: "string", format: "date-time" },
            datos: { type: "object", description: "Depende del evento (ver ejemplos)." },
          },
        },
      },
    },
  };
}

function ejemploEvento(id: EventoId): unknown {
  const base = { id: "9f1c0f3e-7a55-4a52-8b7c-0d0f6f0c1a11", creado: "2026-10-24T14:05:00.000Z" };
  switch (id) {
    case "lead.creado":
      return { ...base, evento: id, datos: LEAD_EJEMPLO };
    case "lead.etapa_cambiada":
      return { ...base, evento: id, datos: { lead: { ...LEAD_EJEMPLO, estado: "cotizado" }, etapa_anterior: "contactado", etapa_nueva: "cotizado" } };
    case "reserva.creada":
      return { ...base, evento: id, datos: { id: "c3b1f2a0-0d6e-4c9a-8a77-5e1d0b9f4a22", estado_pago: "pendiente", total: 15000000, anticipo: 4500000, cliente: { nombre: "Carlos Gómez", email: "carlos@example.com" } } };
    case "reserva.pago_cambiado":
      return { ...base, evento: id, datos: { id: "c3b1f2a0-0d6e-4c9a-8a77-5e1d0b9f4a22", estado_pago_anterior: "pendiente", estado_pago: "pagado", total: 15000000, anticipo: 4500000 } };
  }
}
