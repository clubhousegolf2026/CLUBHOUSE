-- ============================================================
-- CLUB HOUSE · Desglose de cada cobro (viaje, USD, TRM del día) · migración 0011 (idempotente)
-- ============================================================
alter table pagos add column if not exists detalle jsonb;
notify pgrst, 'reload schema';
