import type {
  Tarifa,
  SeleccionItinerario,
  Cotizacion,
  LineaCotizacion,
} from "./types";

/** IVA configurable. Turismo receptivo puede tener tratamiento especial:
 *  revisar con el contador antes de producción. */
export const IVA = Number(process.env.NEXT_PUBLIC_IVA ?? "0.19");

/**
 * Cálculo determinista y sin efectos secundarios.
 * Mismo input => mismo output. Se ejecuta en el navegador (respuesta
 * instantánea) y en el servidor (fuente de verdad antes de reservar).
 */
export function calcularCotizacion(
  sel: SeleccionItinerario,
  catalogo: Map<string, Tarifa>,
): Cotizacion {
  const lineas: LineaCotizacion[] = [];
  const factor = (t: Tarifa) => (sel.temporadaAlta ? t.temporadaAltaFactor : 1);

  // Campos de golf — precio por jugador y por ronda
  for (const codigo of sel.campos) {
    const t = catalogo.get(codigo);
    if (!t) continue;
    const rondas = sel.rondasPorCampo[codigo] ?? 1;
    const unit = Math.round(t.precioUnitarioCop * factor(t));
    const cantidad = sel.numPax * rondas;
    lineas.push({
      concepto: `Green fee · ${t.nombre}`,
      detalle: `${sel.numPax} jugador(es) × ${rondas} ronda(s)`,
      cantidad,
      precioUnitario: unit,
      subtotal: unit * cantidad,
    });
  }

  // Alojamiento — por habitación y por noche
  if (sel.hotelCodigo) {
    const t = catalogo.get(sel.hotelCodigo);
    if (t) {
      const unit = Math.round(t.precioUnitarioCop * factor(t));
      const cantidad = sel.habitaciones * sel.noches;
      lineas.push({
        concepto: `Alojamiento · ${t.nombre}`,
        detalle: `${sel.habitaciones} hab × ${sel.noches} noche(s)`,
        cantidad,
        precioUnitario: unit,
        subtotal: unit * cantidad,
      });
    }
  }

  // Transporte — servicio fijo por grupo
  if (sel.transporteCodigo) {
    const t = catalogo.get(sel.transporteCodigo);
    if (t) {
      const unit = Math.round(t.precioUnitarioCop * factor(t));
      lineas.push({
        concepto: `Transporte · ${t.nombre}`,
        detalle: "Servicio para el grupo",
        cantidad: 1,
        precioUnitario: unit,
        subtotal: unit,
      });
    }
  }

  // Actividades — por persona
  for (const codigo of sel.actividades) {
    const t = catalogo.get(codigo);
    if (!t) continue;
    const unit = Math.round(t.precioUnitarioCop * factor(t));
    lineas.push({
      concepto: `Actividad · ${t.nombre}`,
      detalle: `${sel.numPax} persona(s)`,
      cantidad: sel.numPax,
      precioUnitario: unit,
      subtotal: unit * sel.numPax,
    });
  }

  // Fee de gestión de la agencia
  const fee = catalogo.get("fee-servicio-clubhouse");
  if (fee) {
    lineas.push({
      concepto: "Gestión y asistencia Clubhouse",
      detalle: `${sel.numPax} persona(s)`,
      cantidad: sel.numPax,
      precioUnitario: fee.precioUnitarioCop,
      subtotal: fee.precioUnitarioCop * sel.numPax,
    });
  }

  const subtotal = lineas.reduce((s, l) => s + l.subtotal, 0);
  const impuestos = Math.round(subtotal * IVA);
  const total = subtotal + impuestos;

  return {
    lineas,
    subtotal,
    impuestos,
    total,
    porPersona: sel.numPax > 0 ? Math.round(total / sel.numPax) : total,
  };
}
