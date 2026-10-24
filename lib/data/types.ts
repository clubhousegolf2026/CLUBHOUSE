export interface FotoGaleria {
  url: string;
  alt: string;
}

export interface PaquetePredefinido {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  camposIncluidos: string[];
  noches: number;
  dias: number;
  precioDesdeCop: number;
  galeria: FotoGaleria[];
  incluye: string[];
  noIncluye: string[];
  destacado: boolean;
  /** Experiencia firmada: enlaza a su propia página y muestra el precio en texto (USD) */
  href?: string;
  precioTexto?: string;
  /** Precio numérico y moneda cuando no es COP (para filtrar y ordenar) */
  precioNumero?: number;
  moneda?: "USD";
  insignia?: string;
}

export interface Testimonio {
  id: string;
  nombre: string;
  origen: string;
  texto: string;
  handicap?: string;
}

export interface BloqueoCalendario {
  id: string;
  fechaInicio: string; // ISO date
  fechaFin: string;
  tipo: "bloqueo" | "temporada_alta" | "cupo";
  nota?: string;
  factorPrecio?: number;
}

export interface Destino {
  id: string;
  nombre: string;
  region: string;
  pais: string;
  /** [longitud, latitud] — formato GeoJSON usado por el mapa */
  coordenadas: [number, number];
  resumen: string;
  campos: string[];
  slugsPaquetes: string[];
  disponible: boolean;
  foto?: string;
  /** Si el punto del globo es una experiencia firmada (Tailandia, Utah…) */
  experiencia?: { slug: string; desde: string; fechas: string; duracion: string };
}
