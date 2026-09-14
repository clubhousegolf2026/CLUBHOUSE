import type { Tarifa } from "@/lib/pricing/types";
import type {
  PaquetePredefinido,
  Testimonio,
  BloqueoCalendario,
  Destino,
} from "./types";

/* ============================================================
   DATOS MOCK — Fase 1 sin Supabase.
   Cuando llegue la conexión, estos arreglos se reemplazan por
   consultas en lib/data/index.ts (la firma de las funciones no cambia).
   ============================================================ */

const foto = (seed: string, alt: string) => ({
  url: `https://picsum.photos/seed/${seed}/1200/800`,
  alt,
});

export const TARIFAS_MOCK: Tarifa[] = [
  {
    codigo: "fee-servicio-clubhouse",
    tipo: "fee_servicio",
    nombre: "Gestión y asistencia Clubhouse",
    descripcion: "Coordinación de reservas, anfitrión local y soporte 24/7 durante el viaje.",
    precioUnitarioCop: 120_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.0,
  },
  // ---- Campos de golf ----
  {
    codigo: "campo-campestre",
    tipo: "campo_golf",
    nombre: "Club Campestre de Bogotá",
    descripcion: "Par 72 · 18 hoyos · diseño clásico entre eucaliptos y lagos.",
    precioUnitarioCop: 380_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.15,
    metadata: { par: 72, hoyos: 18, foto: foto("campestre", "Green del Club Campestre").url },
  },
  {
    codigo: "campo-serrezuela",
    tipo: "campo_golf",
    nombre: "Serrezuela Golf & Country",
    descripcion: "Par 71 · 18 hoyos · fairways amplios y vista a los cerros.",
    precioUnitarioCop: 320_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.12,
    metadata: { par: 71, hoyos: 18, foto: foto("serrezuela", "Campo de Serrezuela").url },
  },
  {
    codigo: "campo-guaymaral",
    tipo: "campo_golf",
    nombre: "Guaymaral Golf Club",
    descripcion: "Par 72 · 18 hoyos · el más técnico de la sabana, mucho agua en juego.",
    precioUnitarioCop: 410_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.18,
    metadata: { par: 72, hoyos: 18, foto: foto("guaymaral", "Lago en Guaymaral").url },
  },
  {
    codigo: "campo-llanogrande",
    tipo: "campo_golf",
    nombre: "Llanogrande — Rionegro",
    descripcion: "Par 72 · 18 hoyos · clima de montaña antioqueña, verde todo el año.",
    precioUnitarioCop: 360_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.1,
    metadata: { par: 72, hoyos: 18, foto: foto("llanogrande", "Fairway en Llanogrande").url },
  },
  // ---- Hoteles ----
  {
    codigo: "hotel-boutique-dbl",
    tipo: "hotel",
    nombre: "Hotel Boutique La Sabana — Doble",
    descripcion: "Casa de campo restaurada, 12 habitaciones, desayuno incluido.",
    precioUnitarioCop: 420_000,
    unidad: "habitacion_noche",
    temporadaAltaFactor: 1.2,
    metadata: { estrellas: 4, desayuno: true, foto: foto("boutique", "Hotel boutique").url },
  },
  {
    codigo: "hotel-estelar-dbl",
    tipo: "hotel",
    nombre: "Hotel Estelar — Suite Doble",
    descripcion: "5 estrellas, spa, transporte al campo incluido, desayuno buffet.",
    precioUnitarioCop: 560_000,
    unidad: "habitacion_noche",
    temporadaAltaFactor: 1.25,
    metadata: { estrellas: 5, desayuno: true, foto: foto("estelar", "Suite del hotel Estelar").url },
  },
  {
    codigo: "hotel-hacienda-dbl",
    tipo: "hotel",
    nombre: "Hacienda de Golf — Doble Superior",
    descripcion: "Alojamiento dentro del club, sales del cuarto directo al primer tee.",
    precioUnitarioCop: 640_000,
    unidad: "habitacion_noche",
    temporadaAltaFactor: 1.3,
    metadata: { estrellas: 5, desayuno: true, foto: foto("hacienda", "Hacienda de golf").url },
  },
  // ---- Transporte ----
  {
    codigo: "transporte-van",
    tipo: "transporte",
    nombre: "Van privada con conductor",
    descripcion: "Hasta 8 pasajeros. Traslados aeropuerto, hotel y campos todos los días.",
    precioUnitarioCop: 480_000,
    unidad: "servicio",
    temporadaAltaFactor: 1.0,
    metadata: { capacidadPax: 8 },
  },
  {
    codigo: "transporte-suv",
    tipo: "transporte",
    nombre: "SUV ejecutiva con conductor",
    descripcion: "Hasta 4 pasajeros, gama alta, agua y wifi a bordo.",
    precioUnitarioCop: 620_000,
    unidad: "servicio",
    temporadaAltaFactor: 1.0,
    metadata: { capacidadPax: 4 },
  },
  {
    codigo: "transporte-traslados",
    tipo: "transporte",
    nombre: "Solo traslados de aeropuerto",
    descripcion: "Recogida y entrega en el aeropuerto. Sin movilidad diaria.",
    precioUnitarioCop: 180_000,
    unidad: "servicio",
    temporadaAltaFactor: 1.0,
  },
  // ---- Actividades ----
  {
    codigo: "actividad-cata",
    tipo: "actividad",
    nombre: "Cata de vinos y quesos",
    descripcion: "Maridaje guiado de 6 etiquetas en viñedo de la sabana.",
    precioUnitarioCop: 190_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.0,
  },
  {
    codigo: "actividad-city",
    tipo: "actividad",
    nombre: "City tour Bogotá histórica",
    descripcion: "La Candelaria, Monserrate y Museo del Oro con guía privado.",
    precioUnitarioCop: 150_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.0,
  },
  {
    codigo: "actividad-clinica",
    tipo: "actividad",
    nombre: "Clínica con PGA pro",
    descripcion: "Sesión de 2 horas de swing y putting con profesional certificado.",
    precioUnitarioCop: 260_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.0,
  },
  {
    codigo: "actividad-spa",
    tipo: "actividad",
    nombre: "Circuito de spa y masaje",
    descripcion: "Masaje de recuperación de 60 min + hidroterapia.",
    precioUnitarioCop: 220_000,
    unidad: "persona_dia",
    temporadaAltaFactor: 1.0,
  },
];

export const PAQUETES_MOCK: PaquetePredefinido[] = [
  {
    id: "pkg-sabana-clasica",
    slug: "sabana-clasica",
    nombre: "Sabana Clásica",
    descripcion:
      "Cuatro días para jugar los dos campos más emblemáticos de la sabana de Bogotá, con alojamiento boutique y todo resuelto de puerta a puerta.",
    camposIncluidos: ["Club Campestre de Bogotá", "Serrezuela Golf & Country"],
    noches: 3,
    dias: 4,
    precioDesdeCop: 3_950_000,
    galeria: [
      foto("sabana1", "Green del Club Campestre al amanecer"),
      foto("sabana2", "Carrito de golf entre eucaliptos"),
      foto("sabana3", "Hotel boutique de la sabana"),
    ],
    incluye: [
      "2 green fees (Campestre y Serrezuela)",
      "3 noches en hotel boutique con desayuno",
      "Van privada con conductor todos los días",
      "Anfitrión local y soporte 24/7",
    ],
    noIncluye: ["Tiquetes aéreos", "Almuerzos y cenas", "Propinas"],
    destacado: true,
  },
  {
    id: "pkg-altura-total",
    slug: "altura-total",
    nombre: "Altura Total",
    descripcion:
      "El itinerario para quien quiere jugarlo todo: tres campos en cinco días, hotel 5 estrellas y una clínica con un PGA pro para pulir el swing.",
    camposIncluidos: [
      "Club Campestre de Bogotá",
      "Guaymaral Golf Club",
      "Serrezuela Golf & Country",
    ],
    noches: 4,
    dias: 5,
    precioDesdeCop: 6_480_000,
    galeria: [
      foto("altura1", "Lago en Guaymaral Golf Club"),
      foto("altura2", "Suite del hotel Estelar"),
      foto("altura3", "Clínica de golf con profesional"),
    ],
    incluye: [
      "3 green fees",
      "4 noches en hotel 5 estrellas con spa",
      "Clínica de 2 horas con PGA pro",
      "SUV ejecutiva con conductor",
    ],
    noIncluye: ["Tiquetes aéreos", "Cenas", "Actividades no listadas"],
    destacado: true,
  },
  {
    id: "pkg-antioquia-verde",
    slug: "antioquia-verde",
    nombre: "Antioquia Verde",
    descripcion:
      "Escápate a Rionegro: clima de montaña, campo impecable todo el año y una hacienda de golf donde sales del cuarto directo al primer tee.",
    camposIncluidos: ["Llanogrande — Rionegro"],
    noches: 2,
    dias: 3,
    precioDesdeCop: 2_780_000,
    galeria: [
      foto("antioquia1", "Fairway de Llanogrande entre montañas"),
      foto("antioquia2", "Hacienda de golf en Rionegro"),
      foto("antioquia3", "Atardecer sobre el campo"),
    ],
    incluye: [
      "2 green fees en Llanogrande",
      "2 noches en hacienda de golf",
      "Traslados desde el aeropuerto José María Córdova",
      "Anfitrión local",
    ],
    noIncluye: ["Tiquetes aéreos", "Comidas", "Movilidad fuera del club"],
    destacado: false,
  },
  {
    id: "pkg-fin-de-semana",
    slug: "fin-de-semana-golf",
    nombre: "Fin de Semana de Golf",
    descripcion:
      "Dos días, un campo, cero complicaciones. El plan perfecto para estrenar el destino sin pedir muchos días de vacaciones.",
    camposIncluidos: ["Serrezuela Golf & Country"],
    noches: 1,
    dias: 2,
    precioDesdeCop: 1_450_000,
    galeria: [
      foto("finde1", "Salida del primer hoyo en Serrezuela"),
      foto("finde2", "Club house al atardecer"),
    ],
    incluye: [
      "1 green fee en Serrezuela",
      "1 noche en hotel boutique con desayuno",
      "Traslados de aeropuerto",
    ],
    noIncluye: ["Tiquetes aéreos", "Comidas", "Segundo día de juego"],
    destacado: false,
  },
];

export const TESTIMONIOS_MOCK: Testimonio[] = [
  {
    id: "t1",
    nombre: "Andrés Restrepo",
    origen: "Medellín",
    texto:
      "Reservé el paquete de Altura Total para cuatro amigos. No tuvimos que coordinar nada: nos recogían, jugábamos y nos llevaban. El campo de Guaymaral vale el viaje solo.",
    handicap: "Hándicap 12",
  },
  {
    id: "t2",
    nombre: "Marcela Gómez",
    origen: "Cali",
    texto:
      "El constructor de itinerario me dejó armar exactamente el viaje que quería y ver el precio de una. Sin llamadas, sin esperar cotizaciones por correo tres días.",
    handicap: "Hándicap 20",
  },
  {
    id: "t3",
    nombre: "Tom Bennett",
    origen: "Miami, USA",
    texto:
      "Booked the Sabana Clásica package for a golf trip with my father. Everything was exactly as described and the local host made all the difference.",
    handicap: "Hcp 8",
  },
];

export const DESTINOS_MOCK: Destino[] = [
  {
    id: "dest-sabana",
    nombre: "Sabana de Bogotá",
    region: "Cundinamarca",
    pais: "Colombia",
    coordenadas: [-74.08, 4.78],
    resumen:
      "El corazón del golf colombiano. Tres campos de campeonato a menos de una hora del aeropuerto El Dorado, clima fresco todo el año y greens rápidos a 2.600 m de altura.",
    campos: [
      "Club Campestre de Bogotá",
      "Serrezuela Golf & Country",
      "Guaymaral Golf Club",
    ],
    slugsPaquetes: ["sabana-clasica", "altura-total", "fin-de-semana-golf"],
    disponible: true,
  },
  {
    id: "dest-rionegro",
    nombre: "Oriente Antioqueño",
    region: "Rionegro · Llanogrande",
    pais: "Colombia",
    coordenadas: [-75.42, 6.16],
    resumen:
      "Clima de eterna primavera a 20 minutos del aeropuerto José María Córdova. El campo de Llanogrande se mantiene verde los 365 días y se juega entre montañas.",
    campos: ["Llanogrande — Rionegro"],
    slugsPaquetes: ["antioquia-verde"],
    disponible: true,
  },
  {
    id: "dest-eje-cafetero",
    nombre: "Eje Cafetero",
    region: "Pereira · Armenia",
    pais: "Colombia",
    coordenadas: [-75.69, 4.81],
    resumen:
      "Nuevo destino en preparación: golf entre cafetales, termales y haciendas patrimoniales. Estamos cerrando acuerdos con los campos de la zona.",
    campos: ["Club Campestre de Pereira (próximamente)"],
    slugsPaquetes: [],
    disponible: false,
  },
  // Destinos internacionales en estudio — se muestran como "Próximamente"
  // para poblar el globo sin prometer una operación que aún no existe.
  {
    id: "dest-los-cabos",
    nombre: "Los Cabos",
    region: "Baja California Sur",
    pais: "México",
    coordenadas: [-109.91, 22.89],
    resumen:
      "Golf frente al Mar de Cortés. Estamos evaluando alianzas con campos y hoteles de la zona para abrir este destino.",
    campos: ["Cabo del Sol (próximamente)"],
    slugsPaquetes: [],
    disponible: false,
  },
  {
    id: "dest-guanacaste",
    nombre: "Guanacaste",
    region: "Pacífico Norte",
    pais: "Costa Rica",
    coordenadas: [-85.64, 10.63],
    resumen:
      "Playa y golf en un mismo viaje. En conversación con operadores locales para sumar este destino al catálogo.",
    campos: ["Hacienda Pinilla (próximamente)"],
    slugsPaquetes: [],
    disponible: false,
  },
  {
    id: "dest-punta-cana",
    nombre: "Punta Cana",
    region: "La Altagracia",
    pais: "República Dominicana",
    coordenadas: [-68.4, 18.58],
    resumen:
      "Uno de los polos de golf más fuertes del Caribe. Todavía en evaluación comercial, próximamente más noticias.",
    campos: ["Punta Espada (próximamente)"],
    slugsPaquetes: [],
    disponible: false,
  },
  {
    id: "dest-costa-del-sol",
    nombre: "Costa del Sol",
    region: "Andalucía",
    pais: "España",
    coordenadas: [-4.88, 36.51],
    resumen:
      "La meca del golf europeo. Un destino a futuro para clientes que quieran combinar Colombia con un viaje a España.",
    campos: ["Valderrama (próximamente)"],
    slugsPaquetes: [],
    disponible: false,
  },
];

const hoy = new Date();
const iso = (offsetDias: number) => {
  const d = new Date(hoy);
  d.setDate(d.getDate() + offsetDias);
  return d.toISOString().slice(0, 10);
};

export const BLOQUEOS_MOCK: BloqueoCalendario[] = [
  { id: "b1", fechaInicio: iso(2), fechaFin: iso(4), tipo: "bloqueo", nota: "Mantenimiento de campos" },
  { id: "b2", fechaInicio: iso(20), fechaFin: iso(45), tipo: "temporada_alta", nota: "Temporada alta (+15%)", factorPrecio: 1.15 },
  { id: "b3", fechaInicio: iso(60), fechaFin: iso(62), tipo: "bloqueo", nota: "Torneo privado — sin cupos" },
];
