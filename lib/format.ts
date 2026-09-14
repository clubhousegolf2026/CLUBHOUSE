const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function cop(valor: number): string {
  return copFormatter.format(Math.round(valor || 0));
}

const fechaLarga = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function fechaCo(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return fechaLarga.format(d);
}

export function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
