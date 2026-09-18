"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/cn";
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
  multiple = true,
  className,
}: {
  carpeta: string;
  alt: string;
  onSubidas: (fotos: { url: string; alt: string }[]) => void;
  multiple?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subir(archivos: File[]) {
    if (archivos.length === 0) return;
    setError(null);
    setSubiendo(true);
    try {
      const supabase = createBrowserSupabase();
      const subidas: { url: string; alt: string }[] = [];
      for (const archivo of multiple ? archivos : archivos.slice(0, 1)) {
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
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        hidden
        onChange={(e) => {
          const archivos = Array.from(e.target.files ?? []);
          e.target.value = "";
          void subir(archivos);
        }}
      />
      <button
        type="button"
        disabled={subiendo}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          void subir(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors disabled:cursor-wait",
          arrastrando
            ? "border-verde-golf bg-verde-golf/10"
            : "border-arena bg-crema/60 hover:border-verde-golf/50 hover:bg-verde-golf/5",
        )}
      >
        {subiendo ? (
          <>
            <Loader2 size={26} className="animate-spin text-verde-golf" />
            <span className="text-sm font-medium text-carbon">Subiendo…</span>
          </>
        ) : (
          <>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-verde-golf/10 text-verde-golf">
              <UploadCloud size={22} />
            </span>
            <span className="text-sm font-medium text-carbon">
              Arrastra {multiple ? "tus fotos" : "la foto"} aquí o{" "}
              <span className="text-verde-golf underline underline-offset-4">
                busca en tu equipo
              </span>
            </span>
            <span className="flex items-center gap-1 text-xs text-niebla">
              <ImagePlus size={12} /> JPG, PNG o WebP · se optimizan automáticamente
            </span>
          </>
        )}
      </button>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
