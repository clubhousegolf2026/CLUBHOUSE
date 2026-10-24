import Image, { type ImageProps } from "next/image";

/** Foto que nunca rompe la página: las rutas propias y las de Supabase pasan
 *  por next/image; cualquier otra dirección (pegada a mano en el admin) se
 *  muestra con una etiqueta <img> normal, porque next/image falla con hosts
 *  no configurados. Sin dirección no dibuja nada. */
export function FotoSegura(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  if (!src) return null;

  const optimizable =
    src.startsWith("/") ||
    /^https:\/\/[^/]*\.supabase\.co\//.test(src) ||
    /^https:\/\/(images\.unsplash\.com|picsum\.photos)\//.test(src);
  if (optimizable) return <Image {...props} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={props.alt}
      loading="lazy"
      className={`absolute inset-0 h-full w-full ${props.className ?? ""}`}
    />
  );
}
