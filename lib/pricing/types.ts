import { z } from "zod";

export type TipoComponente =
  | "campo_golf"
  | "hotel"
  | "transporte"
  | "actividad"
  | "fee_servicio";

export interface Tarifa {
  codigo: string;
  tipo: TipoComponente;
  nombre: string;
  descripcion?: string;
  precioUnitarioCop: number;
  unidad: "persona_dia" | "habitacion_noche" | "servicio" | "grupo";
  temporadaAltaFactor: number; // >= 1
  metadata?: Record<string, unknown>;
}

export const seleccionSchema = z.object({
  campos: z.array(z.string()).max(8),
  rondasPorCampo: z.record(z.string(), z.number().int().min(1).max(4)).default({}),
  hotelCodigo: z.string().nullable(),
  habitaciones: z.number().int().min(1).max(20),
  transporteCodigo: z.string().nullable(),
  actividades: z.array(z.string()).max(12),
  noches: z.number().int().min(1).max(30),
  numPax: z.number().int().min(1).max(40),
  fechaInicio: z.string().nullable(),
  temporadaAlta: z.boolean(),
});

export type SeleccionItinerario = z.infer<typeof seleccionSchema>;

export interface LineaCotizacion {
  concepto: string;
  detalle: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Cotizacion {
  lineas: LineaCotizacion[];
  subtotal: number;
  impuestos: number;
  total: number;
  porPersona: number;
}
