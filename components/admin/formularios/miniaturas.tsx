import type { Plantilla } from "@/lib/formularios/tipos";

const linea = (w: string, c = "#d9d2c0", h = "h-1.5") => <span className={`block ${h} rounded-full`} style={{ width: w, background: c }} />;

/** Dibujo pequeño de cada plantilla, para elegirla de un vistazo. */
export function MiniaturaPlantilla({ plantilla, acento = "#a98745" }: { plantilla: Plantilla; acento?: string }) {
  const boton = <span className="mt-2 block h-3 w-14 rounded-full" style={{ background: acento }} />;

  if (plantilla === "clasico") {
    return (
      <div className="grid h-full w-full place-items-center bg-[#f6f3ec] p-3">
        <div className="w-4/5 space-y-1.5 rounded-lg bg-white p-3 shadow-md">
          {linea("55%", "#1a1a1a", "h-2")}
          <span className="block h-px w-full" style={{ background: acento }} />
          <div className="grid grid-cols-2 gap-1.5">
            <span className="block h-3 rounded bg-[#efe9da]" />
            <span className="block h-3 rounded bg-[#efe9da]" />
          </div>
          <span className="block h-3 rounded bg-[#efe9da]" />
          {boton}
        </div>
      </div>
    );
  }
  if (plantilla === "pasos") {
    return (
      <div className="grid h-full w-full place-items-center bg-[#f6f3ec] p-3">
        <div className="w-4/5 rounded-lg bg-white p-3 shadow-md">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="flex flex-1 items-center gap-1 last:flex-none">
                <span className="block h-3 w-3 rounded-full" style={{ background: i === 0 ? acento : "#e6ddc9" }} />
                {i < 2 && <span className="block h-0.5 flex-1" style={{ background: i === 0 ? acento : "#e6ddc9" }} />}
              </span>
            ))}
          </div>
          <div className="mt-2 space-y-1.5">
            <span className="block h-3 rounded bg-[#efe9da]" />
            <span className="block h-3 rounded bg-[#efe9da]" />
          </div>
          <div className="mt-2 flex justify-between">
            {linea("20%")}
            <span className="block h-3 w-10 rounded-full" style={{ background: acento }} />
          </div>
        </div>
      </div>
    );
  }
  if (plantilla === "portada") {
    return (
      <div className="grid h-full w-full grid-cols-[1.1fr_1fr] bg-[#fdfcf9]">
        <div className="relative bg-gradient-to-br from-[#1f5a45] to-[#0a2a20] p-2.5">
          <span className="mb-1 block h-0.5 w-5" style={{ background: acento }} />
          {linea("70%", "#fff", "h-2")}
          <span className="mt-1.5 block">{linea("50%", "rgba(255,255,255,.5)")}</span>
        </div>
        <div className="space-y-2 p-3">
          <span className="block h-px w-full bg-[#d9d2c0]" />
          <span className="block h-px w-full bg-[#d9d2c0]" />
          <span className="block h-px w-3/4 bg-[#d9d2c0]" />
          {boton}
        </div>
      </div>
    );
  }
  if (plantilla === "cristal") {
    return (
      <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[#061a13] p-3">
        <span className="absolute -left-4 -top-4 h-14 w-14 rounded-full opacity-40 blur-xl" style={{ background: acento }} />
        <span className="absolute -bottom-6 right-0 h-16 w-16 rounded-full bg-[#2f8a63] opacity-40 blur-xl" />
        <div className="relative w-4/5 space-y-1.5 rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur">
          {linea("55%", "#fff", "h-2")}
          <span className="block h-px w-full" style={{ background: acento }} />
          <span className="block h-3 rounded border border-white/20 bg-white/10" />
          <span className="block h-3 rounded border border-white/20 bg-white/10" />
          {boton}
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex h-full w-full flex-col justify-center bg-[#fdfcf9] p-4">
      <span className="absolute inset-x-0 top-0 block h-1" style={{ background: `linear-gradient(90deg, ${acento} 40%, #ece6d6 40%)` }} />
      <span className="mb-1 block text-[9px] font-semibold" style={{ color: acento }}>3 →</span>
      {linea("80%", "#1a1a1a", "h-2.5")}
      <span className="mt-2 block h-px w-3/4 bg-[#d9d2c0]" />
      <span className="mt-3 block h-4 w-16 rounded-full" style={{ background: acento }} />
    </div>
  );
}
