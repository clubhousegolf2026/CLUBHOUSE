"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ImageIcon, Link2, MapPinned, Rocket, Trash2, Wallet, X, FileText } from "lucide-react";
import { SubirFotos } from "@/components/admin/subir-fotos";
import {
  AreaTexto,
  BarraGuardar,
  Campo,
  Chip,
  Entrada,
  Interruptor,
  Seccion,
} from "@/components/admin/form-ui";
import {
  crearPaquete,
  actualizarPaquete,
  eliminarPaquete,
  type DatosPaquete,
} from "@/app/admin/(panel)/paquetes/actions";

type CampoOpcion = { codigo: string; nombre: string };
type DestinoOpcion = { id: string; nombre: string };

const slugificar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function PaqueteForm({
  paquete,
  campos,
  destinos,
}: {
  paquete?: DatosPaquete;
  campos: CampoOpcion[];
  destinos: DestinoOpcion[];
}) {
  const router = useRouter();
  const esNuevo = !paquete;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(paquete?.nombre ?? "");
  const [slug, setSlug] = useState(paquete?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(!esNuevo);
  const [descripcion, setDescripcion] = useState(paquete?.descripcion ?? "");
  const [noches, setNoches] = useState(paquete?.noches ?? 1);
  const [dias, setDias] = useState(paquete?.dias ?? 2);
  const [precio, setPrecio] = useState(paquete?.precioDesdeCop ?? 0);
  const [destacado, setDestacado] = useState(paquete?.destacado ?? false);
  const [activo, setActivo] = useState(paquete?.activo ?? true);
  const [incluye, setIncluye] = useState(paquete?.incluye.join("\n") ?? "");
  const [noIncluye, setNoIncluye] = useState(paquete?.noIncluye.join("\n") ?? "");
  const [galeria, setGaleria] = useState(
    paquete?.galeria ?? [{ url: "", alt: "" }],
  );
  const [camposIds, setCamposIds] = useState<string[]>(paquete?.camposIds ?? []);
  const [destinosIds, setDestinosIds] = useState<string[]>(
    paquete?.destinosIds ?? [],
  );

  function alGuardar() {
    setError(null);
    const datos: DatosPaquete = {
      id: paquete?.id ?? `pkg-${slug}`,
      slug,
      nombre,
      descripcion,
      noches,
      dias,
      precioDesdeCop: precio,
      destacado,
      activo,
      incluye: incluye.split("\n").map((l) => l.trim()).filter(Boolean),
      noIncluye: noIncluye.split("\n").map((l) => l.trim()).filter(Boolean),
      galeria: galeria.filter((g) => g.url.trim()),
      camposIds,
      destinosIds,
    };

    if (!datos.nombre || !datos.slug || !datos.descripcion) {
      setError("Nombre, slug y descripción son obligatorios.");
      return;
    }
    if (datos.activo && datos.galeria.length === 0) {
      setError("Agrega al menos una foto antes de publicar el paquete.");
      return;
    }

    startTransition(async () => {
      try {
        if (esNuevo) {
          await crearPaquete(datos);
        } else {
          await actualizarPaquete(datos);
          router.refresh();
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar.");
      }
    });
  }

  function alEliminar() {
    if (!paquete) return;
    if (!confirm(`¿Eliminar "${paquete.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    startTransition(async () => {
      try {
        await eliminarPaquete(paquete.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo eliminar.");
      }
    });
  }

  function mover(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= galeria.length) return;
    const copia = [...galeria];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    setGaleria(copia);
  }

  function alternar(lista: string[], set: (v: string[]) => void, id: string) {
    set(lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id]);
  }

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <Seccion
            icono={<FileText size={18} />}
            titulo="Información general"
            descripcion="El nombre y la descripción que verá el viajero."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Nombre">
                <Entrada
                  value={nombre}
                  placeholder="Sabana Clásica"
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (!slugTocado) setSlug(slugificar(e.target.value));
                  }}
                />
              </Campo>
              <Campo label="Dirección web" ayuda="Se genera sola a partir del nombre.">
                <Entrada
                  prefijo="/paquetes/"
                  className="pl-[92px]"
                  value={slug}
                  onChange={(e) => {
                    setSlugTocado(true);
                    setSlug(slugificar(e.target.value));
                  }}
                />
              </Campo>
            </div>
            <Campo label="Descripción">
              <AreaTexto rows={4} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </Campo>
          </Seccion>

          <Seccion
            icono={<Wallet size={18} />}
            titulo="Duración y precio"
            descripcion="El precio “desde” es por persona con base en 2 pasajeros."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo label="Noches">
                <Entrada type="number" min={0} sufijo="noches" value={noches} onChange={(e) => setNoches(Number(e.target.value))} />
              </Campo>
              <Campo label="Días">
                <Entrada type="number" min={1} sufijo="días" value={dias} onChange={(e) => setDias(Number(e.target.value))} />
              </Campo>
              <Campo label="Precio desde">
                <Entrada type="number" min={0} step={1000} prefijo="$" sufijo="COP" value={precio} onChange={(e) => setPrecio(Number(e.target.value))} />
              </Campo>
            </div>
          </Seccion>

          <Seccion
            icono={<Check size={18} />}
            titulo="Qué incluye"
            descripcion="Una línea por elemento."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Incluye">
                <AreaTexto rows={6} value={incluye} onChange={(e) => setIncluye(e.target.value)} placeholder={"3 green fees\n4 noches en hotel"} />
              </Campo>
              <Campo label="No incluye">
                <AreaTexto rows={6} value={noIncluye} onChange={(e) => setNoIncluye(e.target.value)} placeholder={"Tiquetes aéreos\nCenas"} />
              </Campo>
            </div>
          </Seccion>

          <Seccion
            icono={<ImageIcon size={18} />}
            titulo="Galería de fotos"
            descripcion="La primera foto es la portada. Puedes reordenarlas."
          >
            <SubirFotos
              carpeta={slug}
              alt={nombre}
              onSubidas={(nuevas) =>
                setGaleria((actual) => [...actual.filter((g) => g.url.trim()), ...nuevas])
              }
            />
            {galeria.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {galeria.map((foto, i) => (
                  <li key={i} className="overflow-hidden rounded-2xl border border-arena bg-white">
                    <div className="group relative aspect-[4/3] bg-arena">
                      {foto.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={foto.url} alt={foto.alt} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center px-4">
                          <Entrada
                            placeholder="Pega la URL de la imagen"
                            value={foto.url}
                            onChange={(e) => {
                              const copia = [...galeria];
                              copia[i] = { ...copia[i], url: e.target.value };
                              setGaleria(copia);
                            }}
                          />
                        </div>
                      )}
                      {i === 0 && foto.url && (
                        <span className="absolute left-2 top-2 rounded-full bg-carbon/75 px-2.5 py-1 text-[11px] font-medium text-crema backdrop-blur">
                          Portada
                        </span>
                      )}
                      <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => mover(i, -1)}
                          aria-label="Mover antes (la primera es la portada)"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-carbon/70 text-crema backdrop-blur hover:bg-carbon disabled:opacity-30"
                        >
                          <ArrowLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setGaleria(galeria.filter((_, j) => j !== i))}
                          aria-label="Quitar foto"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-carbon/70 text-crema backdrop-blur hover:bg-error"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <Entrada
                        placeholder="Descripción de la foto"
                        className="h-9 text-xs"
                        value={foto.alt}
                        onChange={(e) => {
                          const copia = [...galeria];
                          copia[i] = { ...copia[i], alt: e.target.value };
                          setGaleria(copia);
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setGaleria([...galeria, { url: "", alt: "" }])}
              className="inline-flex items-center gap-1.5 text-sm text-verde-golf hover:underline"
            >
              <Link2 size={14} /> Agregar una foto por URL
            </button>
          </Seccion>

          <Seccion
            icono={<MapPinned size={18} />}
            titulo="Campos y destinos"
            descripcion="Toca para seleccionar."
          >
            <div>
              <span className="text-sm font-medium text-carbon">Campos de golf incluidos</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {campos.length === 0 && (
                  <p className="text-sm text-niebla">No hay campos de golf en el catálogo todavía.</p>
                )}
                {campos.map((c) => (
                  <Chip key={c.codigo} activo={camposIds.includes(c.codigo)} onClick={() => alternar(camposIds, setCamposIds, c.codigo)}>
                    {c.nombre}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-carbon">Destinos donde aparece</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {destinos.map((d) => (
                  <Chip key={d.id} activo={destinosIds.includes(d.id)} onClick={() => alternar(destinosIds, setDestinosIds, d.id)}>
                    {d.nombre}
                  </Chip>
                ))}
              </div>
            </div>
          </Seccion>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <Seccion icono={<Rocket size={18} />} titulo="Publicación">
            <Interruptor
              checked={activo}
              onChange={setActivo}
              titulo="Publicado"
              descripcion="Visible en el sitio y en el filtro de planes."
            />
            <div className="border-t border-arena" />
            <Interruptor
              checked={destacado}
              onChange={setDestacado}
              titulo="Destacado"
              descripcion="Aparece como “Más elegido”."
            />
          </Seccion>
        </aside>
      </div>

      <BarraGuardar
        pending={pending}
        etiqueta={esNuevo ? "Crear paquete" : "Guardar cambios"}
        onGuardar={alGuardar}
        onEliminar={esNuevo ? undefined : alEliminar}
        error={error}
      />
    </div>
  );
}
