/** Experiencias firmadas: itinerarios internacionales que la agencia ya tiene
 *  armados (propuestas reales). Viven en código, no en Supabase, porque son
 *  piezas editoriales con estructura propia (programa, rondas, tarifas). */

export interface Ronda {
  nombre: string;
  lugar: string;
  descripcion: string;
  datos: string[];
  foto: string;
}

export interface DiaPrograma {
  fecha: string;
  titulo: string;
  detalle: string[];
}

export interface Tarifa {
  perfil: string;
  detalle: string;
  precio: string;
  unidad: string;
  incluye: string[];
  destacada?: boolean;
}

export type EstadoSalida = "abierta" | "ultimos" | "llena" | "cerrada";

/** Una fecha concreta de salida del viaje (un mismo viaje puede tener varias). */
export interface Salida {
  id: string;
  inicio: string; // YYYY-MM-DD
  fin: string; // YYYY-MM-DD
  cupos: number | null;
  estado: EstadoSalida;
  nota?: string;
}

export interface Politica {
  titulo: string;
  texto: string;
}

export interface PreguntaFrecuente {
  q: string;
  a: string;
}

export interface Experiencia {
  slug: string;
  pais: string;
  bandera: string;
  /** [longitud, latitud] del punto que se marca en el globo del inicio */
  coordenadas: [number, number];
  nombre: string;
  subtitulo: string;
  fechas: string;
  duracion: string;
  resumen: string;
  titularLargo: string;
  descripcionLarga: string;
  claves: { titulo: string; texto: string }[];
  cifras: { valor: string; etiqueta: string }[];
  desde: string;
  foto: string;
  fotoAlt: string;
  fotoSecundaria: string;
  programa: DiaPrograma[];
  rondas: Ronda[];
  alojamiento: { periodo: string; nombre: string; descripcion: string }[];
  masAllaDelGolf: { titulo: string; texto: string }[];
  tarifas: Tarifa[];
  incluye: string[];
  noIncluye: string[];
  /** Campos opcionales: las experiencias del código no los traen. */
  publicada?: boolean;
  destacada?: boolean;
  orden?: number;
  galeria?: { url: string; alt: string }[];
  salidas?: Salida[];
  politicas?: Politica[];
  faq?: PreguntaFrecuente[];
  /** Nivel de juego recomendado, p. ej. «Handicap hasta 28». */
  nivel?: string;
  grupo?: { min: number | null; max: number | null };
  idiomas?: string;
  anticipoPct?: number | null;
  /** Título y descripción para buscadores (si están vacíos se usan el nombre y la descripción de la página). */
  seoTitulo?: string;
  seoDescripcion?: string;
}

export const EXPERIENCIAS: Experiencia[] = [
  {
    slug: "tailandia",
    pais: "Tailandia",
    bandera: "🇹🇭",
    coordenadas: [100.75, 13.35],
    nombre: "Tailandia, golf de clase mundial",
    subtitulo: "Bangkok & Pattaya",
    fechas: "8 – 16 mar 2027",
    duracion: "8 noches / 9 días",
    resumen:
      "Cuatro rondas en campos de campeonato, caddie para cada golfista y transporte privado durante todo el viaje.",
    titularLargo: "Golf, templos y playa en un solo viaje",
    descripcionLarga:
      "Ocho noches en Tailandia: cuatro en Bangkok y cuatro en Pattaya, con cuatro rondas en campos de campeonato, caddie para cada golfista y transporte privado durante todo el viaje.",
    claves: [
      { titulo: "Cuatro campos de campeonato", texto: "Alpine, Nikanti, Laem Chabang y Siam CC." },
      { titulo: "Golfistas y acompañantes", texto: "Excursiones para todo el grupo." },
      { titulo: "Sin preocupaciones", texto: "Van VIP privada, recibimiento y asistencia 24/7." },
    ],
    cifras: [
      { valor: "4", etiqueta: "rondas" },
      { valor: "8", etiqueta: "noches" },
      { valor: "2", etiqueta: "ciudades" },
      { valor: "24/7", etiqueta: "asistencia" },
    ],
    desde: "USD 3.580",
    foto: "/fotos/tailandia.webp",
    fotoAlt: "Campo de golf en Tailandia con búnker y arboleda",
    fotoSecundaria: "/fotos/tailandia-campo.webp",
    programa: [
      { fecha: "Lun 8 mar", titulo: "Llegada", detalle: ["Recibimiento en el aeropuerto", "Hotel en Bangkok"] },
      { fecha: "Mar 9 mar", titulo: "Alpine", detalle: ["Ronda 1", "Tarde libre"] },
      { fecha: "Mié 10 mar", titulo: "Bangkok", detalle: ["Gran Palacio y Wat Pho", "Paseo por los canales"] },
      { fecha: "Jue 11 mar", titulo: "Nikanti", detalle: ["Ronda 2", "Golf todo incluido"] },
      { fecha: "Vie 12 mar", titulo: "A Pattaya", detalle: ["Traslado privado", "Hotel frente al mar"] },
      { fecha: "Sáb 13 mar", titulo: "Laem Chabang", detalle: ["Ronda 3", "Santuario de la Verdad"] },
      { fecha: "Dom 14 mar", titulo: "Islas", detalle: ["Catamarán a Koh Phai y Koh Rin"] },
      { fecha: "Lun 15 mar", titulo: "Siam CC", detalle: ["Ronda 4 · Old Course", "Cena de despedida"] },
      { fecha: "Mar 16 mar", titulo: "Regreso", detalle: ["Desayuno y check-out", "Traslado al aeropuerto"] },
    ],
    rondas: [
      {
        nombre: "Alpine Golf Club",
        lugar: "Ronda 1 · Bangkok",
        descripcion:
          "Diseñado por Ronald Garl e inaugurado en 1996, Alpine es uno de los campos más reconocidos de Tailandia: aquí ganó Tiger Woods en el año 2000. Está al noreste de Bangkok, a unos 75 minutos del centro, con un recorrido par 72 de más de 7.000 yardas que exige precisión en cada golpe.",
        datos: ["Par 72", "7.044 yd", "Ronald Garl · 1996"],
        foto: "/fotos/alpine.webp",
      },
      {
        nombre: "Nikanti Golf Club",
        lugar: "Ronda 2 · Bangkok",
        descripcion:
          "Inaugurado en 2014 en Nakhon Pathom, al oeste de Bangkok, Nikanti es un club de concepto todo incluido, pensado para una jornada de golf sin pendientes. El diseño es de Pirapon Namatra, de Golf East, y propone un par 72 de 6.789 yardas a solo 45 minutos de los hoteles junto al río.",
        datos: ["Par 72", "6.789 yd", "Golf todo incluido · 2014"],
        foto: "/fotos/tailandia-campo.webp",
      },
      {
        nombre: "Laem Chabang",
        lugar: "Ronda 3 · Pattaya",
        descripcion:
          "Un diseño de Jack Nicklaus inaugurado en 1995, con 27 hoyos entre colinas, lagos y vegetación tropical, a 30 minutos de Pattaya. Sus tres nueves permiten variar el recorrido, y es uno de los clásicos de la costa este de Tailandia.",
        datos: ["27 hoyos · par 72", "7.065 yd", "Jack Nicklaus · 1995"],
        foto: "/fotos/laem-chabang.webp",
      },
      {
        nombre: "Siam Country Club · Old Course",
        lugar: "Ronda 4 · Pattaya",
        descripcion:
          "El campo más tradicional de Pattaya: diseñado por Ichisuke Izumi en 1971 y renovado por Schmidt-Curley en 2006 y 2007. Es sede habitual del torneo LPGA de Tailandia y, con 7.162 yardas, el recorrido más largo del viaje.",
        datos: ["Par 72", "7.162 yd", "Izumi 1971 · Schmidt-Curley 2007"],
        foto: "/fotos/chee-chan.webp",
      },
    ],
    alojamiento: [
      {
        periodo: "8 – 12 mar · 4 noches · Bangkok",
        nombre: "Hyatt Regency Bangkok Sukhumvit",
        descripcion:
          "Habitación Standard en pleno Sukhumvit, la zona más animada de Bangkok, cerca del tren elevado, restaurantes y vida nocturna.",
      },
      {
        periodo: "12 – 16 mar · 4 noches · Pattaya",
        nombre: "The Standard, Pattaya Na Jomtien",
        descripcion:
          "Habitación Standard en un hotel de diseño frente a la playa de Na Jomtien, cerca de los campos de Pattaya.",
      },
    ],
    masAllaDelGolf: [
      { titulo: "Gran Palacio", texto: "Wat Pho y los canales de Bangkok." },
      { titulo: "Elefantes", texto: "Santuario en Pattaya." },
      { titulo: "Santuario de la Verdad", texto: "El templo de madera de Pattaya." },
      { titulo: "Catamarán", texto: "Islas Koh Phai y Koh Rin." },
      { titulo: "Clase de cocina tailandesa", texto: "La cocina local, de primera mano." },
      { titulo: "Ayutthaya", texto: "En barco de cola larga." },
    ],
    tarifas: [
      {
        perfil: "Golfista",
        detalle: "Habitación doble",
        precio: "USD 3.580",
        unidad: "por persona",
        incluye: ["8 noches con desayuno", "4 rondas con caddie", "Traslados y excursiones"],
        destacada: true,
      },
      {
        perfil: "No golfista",
        detalle: "Habitación doble",
        precio: "USD 2.600",
        unidad: "por persona",
        incluye: ["8 noches con desayuno", "Excursiones del programa", "Traslados"],
      },
      {
        perfil: "Golfista",
        detalle: "Habitación sencilla",
        precio: "USD 4.730",
        unidad: "por persona",
        incluye: ["8 noches con desayuno", "4 rondas con caddie", "Traslados y excursiones"],
      },
    ],
    incluye: [
      "8 noches: 4 en Bangkok y 4 en Pattaya, con desayuno",
      "Golfistas: 4 rondas con caddie por jugador",
      "Excursiones indicadas en el programa",
      "Traslados en van VIP privada, con recibimiento",
      "Agua a diario y línea de golf 24/7",
      "Impuestos y cargos de servicio",
    ],
    noIncluye: [
      "Tiquetes aéreos",
      "Tasas aeroportuarias y visas",
      "Comidas no mencionadas",
      "Propinas de caddies y conductores",
      "Gastos personales y seguro de viaje",
    ],
  },
  {
    slug: "utah",
    pais: "Estados Unidos",
    bandera: "🇺🇸",
    coordenadas: [-113.58, 37.1],
    nombre: "Utah Experience",
    subtitulo: "St. George & Black Desert",
    fechas: "28 jun – 5 jul 2027",
    duracion: "7 noches / 8 días",
    resumen:
      "Tres rondas entre rocas rojas y desierto volcánico, con una casa privada para el grupo y cierre en Black Desert Resort.",
    titularLargo: "Golf entre rocas rojas y desierto volcánico",
    descripcionLarga:
      "Ocho golfistas y siete noches en el sur de Utah: cuatro en una casa privada en St. George y tres en Black Desert Resort, con tres rondas en algunos de los mejores campos de la región.",
    claves: [
      { titulo: "Tres campos de primer nivel", texto: "The Ledges, Sand Hollow y Black Desert." },
      { titulo: "Una casa para el grupo", texto: "Cuatro noches juntos en Red Sands." },
      { titulo: "Cierre de lujo", texto: "Tres noches en residencias de Black Desert Resort." },
    ],
    cifras: [
      { valor: "3", etiqueta: "campos par 72" },
      { valor: "2", etiqueta: "giras: PGA y LPGA" },
      { valor: "7", etiqueta: "noches" },
      { valor: "2 h", etiqueta: "desde Las Vegas" },
    ],
    desde: "USD 3.050",
    foto: "/fotos/utah.webp",
    fotoAlt: "Campo de golf de Utah entre lava negra y montañas de roca roja",
    fotoSecundaria: "/fotos/utah-canon.webp",
    programa: [
      { fecha: "Lun 28 jun", titulo: "Llegada", detalle: ["Llegada a St. George", "Check-in en Red Sands"] },
      { fecha: "Mar 29 jun", titulo: "The Ledges", detalle: ["Ronda 1 · en la mañana", "Tarde libre en la casa"] },
      { fecha: "Mié 30 jun", titulo: "Sand Hollow", detalle: ["Ronda 2 · en la mañana", "Tarde libre"] },
      { fecha: "Jue 1 jul", titulo: "Día libre", detalle: ["Día libre en St. George", "Cena de grupo"] },
      { fecha: "Vie 2 jul", titulo: "Black Desert", detalle: ["Ronda 3 · en la mañana", "Check-in en el resort"] },
      { fecha: "Sáb 3 jul", titulo: "En el resort", detalle: ["Día libre en Black Desert", "Piscina y amenidades"] },
      { fecha: "Dom 4 jul", titulo: "Día libre", detalle: ["4 de julio en Utah", "Cena de despedida"] },
      { fecha: "Lun 5 jul", titulo: "Regreso", detalle: ["Check-out", "Regreso a casa"] },
    ],
    rondas: [
      {
        nombre: "The Ledges",
        lugar: "Ronda 1 · Martes 29 de junio",
        descripcion:
          "Diseñado por Matt Dye e inaugurado en 2006, The Ledges tiene fairways enmarcados por acantilados de arenisca roja y roca volcánica. Sus cambios de elevación y greens rápidos piden precisión desde el tee, y las vistas acompañan los 18 hoyos.",
        datos: ["Par 72", "7.100 yd · slope 137", "Matt Dye · 2006"],
        foto: "/fotos/the-ledges.webp",
      },
      {
        nombre: "Sand Hollow Championship",
        lugar: "Ronda 2 · Miércoles 30 de junio",
        descripcion:
          "Obra de John Fought y Andy Staples, inaugurado en 2008. Se juega sobre arena roja y roca volcánica, y en la segunda vuelta varios hoyos bordean acantilados con vistas abiertas al desierto. Golf Digest lo ha destacado como el mejor campo público de Utah.",
        datos: ["Par 72", "7.300 yd · slope 137", "Fought y Staples · 2008"],
        foto: "/fotos/utah-canon.webp",
      },
      {
        nombre: "Black Desert",
        lugar: "Ronda 3 · Viernes 2 de julio",
        descripcion:
          "Diseñado por Tom Weiskopf con Phil Smith, abrió en 2023 entre antiguos campos de lava negra y montañas de roca roja, en Ivins. Ya recibió al PGA Tour y al LPGA Tour, y tiene dos par 4 alcanzables desde el tee, el 5 y el 14.",
        datos: ["Par 72", "7.288 yd · slope 138", "Tom Weiskopf · 2023"],
        foto: "/fotos/black-desert.webp",
      },
    ],
    alojamiento: [
      {
        periodo: "28 jun – 2 jul · 4 noches",
        nombre: "Red Sands Vacation Rental",
        descripcion:
          "Una casa unifamiliar de lujo en St. George para los ocho golfistas, con amenidades privadas como piscina, jacuzzi o sala de juegos, según la casa.",
      },
      {
        periodo: "2 – 5 jul · 3 noches",
        nombre: "Black Desert Resort",
        descripcion:
          "Dos residencias de cuatro habitaciones en el resort conocido como el «Pebble del desierto», junto al campo de la tercera ronda.",
      },
    ],
    masAllaDelGolf: [
      { titulo: "Casa privada", texto: "Espacio para todo el grupo." },
      { titulo: "Black Desert", texto: "Lujo entre lava y roca roja." },
      { titulo: "Salidas en la mañana", texto: "Antes del calor del desierto." },
    ],
    tarifas: [
      {
        perfil: "Golfista",
        detalle: "Alojamiento compartido",
        precio: "USD 3.050",
        unidad: "por persona",
        incluye: [
          "7 noches: 4 en Red Sands y 3 en Black Desert",
          "3 rondas: The Ledges, Sand Hollow y Black Desert",
          "Acceso a las amenidades de cada alojamiento",
        ],
        destacada: true,
      },
      {
        perfil: "Grupo",
        detalle: "8 golfistas",
        precio: "USD 24.400",
        unidad: "total del grupo",
        incluye: [
          "Tarifa calculada para 8 viajeros",
          "1 casa privada y 2 residencias de 4 habitaciones",
          "Sujeta a disponibilidad hasta la confirmación",
        ],
      },
    ],
    incluye: [
      "4 noches en casa privada en Red Sands",
      "3 noches en Black Desert Resort (2 residencias de 4 hab.)",
      "3 rondas: The Ledges, Sand Hollow y Black Desert",
      "Acceso a las amenidades de cada alojamiento",
    ],
    noIncluye: [
      "Tiquetes aéreos desde Colombia",
      "Traslados y alquiler de carro",
      "Alimentación y bebidas",
      "Propinas y gastos personales",
      "Seguro de viaje",
    ],
  },
];

export const getExperiencia = (slug: string) =>
  EXPERIENCIAS.find((e) => e.slug === slug);
