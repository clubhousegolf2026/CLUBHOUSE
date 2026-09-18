"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";

const LADO_MAX = 1920;

/** Reduce la foto a máx. 1920 px y la re-codifica a WebP: las fotos de
 *  celular pesan 4-8 MB y el bucket admite 5 MB; así además cargan rápido. */
async function comprimir(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((ok) =>
    canvas.toBlob(ok, "image/webp", 0.82),
  );
  if (!blob) throw new Error("No se pudo procesar la imagen.");
  return blob;
}

export function SubirFotos({
  carpeta,
  alt,
  onSubidas,
}: {
  carpeta: string;
  alt: string;
  onSubidas: (fotos: { url: string; alt: string }[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (archivos.length === 0) return;

    setError(null);
    setSubiendo(true);
    try {
      const supabase = createBrowserSupabase();
      const subidas: { url: string; alt: string }[] = [];
      for (const archivo of archivos) {
        if (!archivo.type.startsWith("image/")) {
          throw new Error(`"${archivo.name}" no es una imagen.`);
        }
        const blob = await comprimir(archivo);
        const ruta = `${carpeta || "sin-nombre"}/${crypto.randomUUID()}.webp`;
        const { error: err } = await supabase.storage
          .from("paquetes")
          .upload(ruta, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (err) throw new Error(err.message);
        const { data } = supabase.storage.from("paquetes").getPublicUrl(ruta);
        subidas.push({ url: data.publicUrl, alt });
      }
      onSubidas(subidas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={alElegir}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border border-dashed border-verde-golf/50 px-3 py-2 text-sm text-verde-golf hover:bg-verde-golf/5 disabled:opacity-50"
      >
        {subiendo ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Subiendo…
          </>
        ) : (
          <>
            <ImagePlus size={15} /> Subir fotos
          </>
        )}
      </button>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
