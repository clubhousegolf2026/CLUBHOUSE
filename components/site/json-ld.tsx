/** Datos estructurados (schema.org) para buscadores. El contenido lo
 *  generamos nosotros (no viene de usuarios); se escapa "<" por seguridad. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
