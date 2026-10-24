/** Forma pública de una reserva, con el cliente y el total de su cotización. */
export const SELECT_RESERVA =
  "id, estado_pago, monto_deposito_cop, pasarela, referencia_pago, created_at, confirmada_at, cotizacion:cotizaciones(total, por_persona, moneda, contacto:contactos(id, nombre, email, telefono))";

export type FilaReserva = {
  id: string;
  estado_pago: string;
  monto_deposito_cop: number;
  pasarela: string | null;
  referencia_pago: string | null;
  created_at: string;
  confirmada_at: string | null;
  cotizacion: {
    total: number;
    por_persona: number;
    moneda: string;
    contacto: { id: string; nombre: string; email: string; telefono: string | null } | null;
  } | null;
};

export function reservaApi(r: FilaReserva) {
  return {
    id: r.id,
    estado_pago: r.estado_pago,
    anticipo: r.monto_deposito_cop,
    total: r.cotizacion?.total ?? null,
    por_persona: r.cotizacion?.por_persona ?? null,
    moneda: r.cotizacion?.moneda ?? "COP",
    pasarela: r.pasarela,
    referencia_pago: r.referencia_pago,
    cliente: r.cotizacion?.contacto ?? null,
    creada: r.created_at,
    confirmada: r.confirmada_at,
  };
}
