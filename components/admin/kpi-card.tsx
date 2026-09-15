export function KpiCard({
  etiqueta,
  valor,
  detalle,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-arena bg-blanco-roto p-5">
      <p className="text-xs uppercase tracking-[0.1em] text-niebla">{etiqueta}</p>
      <p className="mt-2 font-serif text-3xl text-carbon tabular-nums">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-niebla">{detalle}</p>}
    </div>
  );
}
