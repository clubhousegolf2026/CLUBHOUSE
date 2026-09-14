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
}
