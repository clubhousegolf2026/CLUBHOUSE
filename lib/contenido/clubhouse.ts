/** Contenido editorial de marca (brochure Clubhouse ES). No vive en
 *  Supabase porque no cambia con la operación: es el discurso de la agencia. */

export const MARCA = {
  claim: "Bespoke golf travel",
  ciudad: "Bogotá · Colombia",
  director: "Juan Manuel Morales Calderón",
  whatsapp: "+57 314 332 48 99",
  whatsappUrl: "https://wa.me/573143324899",
  email: "manager@clubhousetravel.com.co",
  web: "www.clubhousetravel.com.co",
  cierre: "Nos vemos en el tee.",
} as const;

/** Las preguntas de apertura del brochure: el gancho emocional de la marca. */
export const SUENOS = [
  "¿Quién no ha soñado con jugar el hoyo 1 de Bethpage Black, el 17 de TPC Sawgrass o el 18 de Pebble Beach?",
  "¿Quién no recuerda las 8 victorias de Tiger Woods en Torrey Pines o las 4 de Rory McIlroy en Quail Hollow?",
  "¿Quién no ha querido cruzar el Swilcan Bridge en St Andrews o alojarse en el hotel de Arnold Palmer en Bay Hill?",
  "¿Quién no ha soñado con jugar en Valderrama y revivir la primera Ryder Cup que se jugó en España?",
] as const;

export const INCLUYE = [
  { titulo: "Tiquetes aéreos", texto: "Vuelos en las rutas y horarios que mejor le funcionen." },
  { titulo: "Traslados o alquiler de auto", texto: "Del aeropuerto al hotel y de campo en campo." },
  { titulo: "Hoteles o villas", texto: "Alojamiento elegido según el destino y el grupo." },
  { titulo: "Tee times", texto: "Salidas reservadas en los campos que usted quiere jugar." },
  { titulo: "Tours gastronómicos", texto: "La cocina local como parte de la experiencia." },
  { titulo: "Historia y cultura", texto: "Recorridos para conocer cada destino más allá del campo." },
] as const;

export const PASOS = [
  { n: "01", titulo: "Conversamos", texto: "Entendemos su juego, su grupo, sus fechas y lo que espera del viaje." },
  { n: "02", titulo: "Diseñamos", texto: "Armamos un itinerario a medida: campos, alojamiento, traslados y experiencias." },
  { n: "03", titulo: "Reservamos", texto: "Nos encargamos de tiquetes, hoteles o villas, tee times y tours." },
  { n: "04", titulo: "Usted viaja y juega", texto: "Usted solo se ocupa de disfrutar cada ronda." },
] as const;

export const TRAYECTORIA = [
  "Go Sports Media · Medios deportivos",
  "Agencia EFE · Periodismo",
  "Federación Colombiana de Golf",
  "Global Golf Magazine · Director",
  "Golf Channel Latinoamérica · Televisión",
  "Diario El Espectador · Columnista de golf",
  "FROSCH Latinoamérica · Golf Manager, 10 años",
  "Clubhouse · Fundador y Director",
] as const;
