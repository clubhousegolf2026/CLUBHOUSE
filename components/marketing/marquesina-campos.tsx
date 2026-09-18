/** Cinta continua con los campos de golf del catálogo. Se duplica la lista
 *  para que el bucle (-50 %) sea imperceptible. */
export function MarquesinaCampos({ campos }: { campos: string[] }) {
  if (campos.length === 0) return null;
  const fila = [...campos, ...campos];
  return (
    <div
      aria-label="Campos de golf disponibles"
      className="relative overflow-hidden border-y border-white/10 bg-[#061a13] py-5"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#061a13] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#061a13] to-transparent" />
      <div className="marquesina" aria-hidden>
        {[0, 1].map((k) => (
          <ul key={k} className="flex shrink-0 items-center">
            {fila.map((c, i) => (
              <li key={`${k}-${i}`} className="flex items-center whitespace-nowrap">
                <span className="px-8 font-serif text-2xl italic text-crema/70">{c}</span>
                <span className="text-[#c6a664]">◆</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
