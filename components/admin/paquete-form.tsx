"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-[var(--radius-control)] bg-error/10 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Nombre">
          <input
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!slugTocado) setSlug(slugificar(e.target.value));
            }}
            className={estiloInput}
          />
        </Campo>
        <Campo label="Slug (URL)">
          <input
            value={slug}
            onChange={(e) => {
              setSlugTocado(true);
              setSlug(slugificar(e.target.value));
            }}
            className={estiloInput}
          />
        </Campo>
      </div>

      <Campo label="Descripción">
        <textarea
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className={estiloInput}
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Noches">
          <input
            type="number"
            min={0}
            value={noches}
            onChange={(e) => setNoches(Number(e.target.value))}
            className={estiloInput}
          />
        </Campo>
        <Campo label="Días">
          <input
            type="number"
            min={1}
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            className={estiloInput}
          />
        </Campo>
        <Campo label="Precio desde (COP)">
          <input
            type="number"
            min={0}
            step={1000}
            value={precio}
            onChange={(e) => setPrecio(Number(e.target.value))}
            className={estiloInput}
          />
        </Campo>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-carbon">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
          />
          Destacado (aparece en portada)
        </label>
        <label className="flex items-center gap-2 text-sm text-carbon">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          Publicado (visible en el sitio)
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label="Incluye (uno por línea)">
          <textarea
            rows={4}
            value={incluye}
            onChange={(e) => setIncluye(e.target.value)}
            className={estiloInput}
          />
        </Campo>
        <Campo label="No incluye (uno por línea)">
          <textarea
            rows={4}
            value={noIncluye}
            onChange={(e) => setNoIncluye(e.target.value)}
            className={estiloInput}
          />
        </Campo>
      </div>

      <div>
        <span className="text-sm font-medium text-carbon">Galería</span>
        <div className="mt-2 space-y-2">
          {galeria.map((foto, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="URL de la imagen"
                value={foto.url}
                onChange={(e) => {
                  const copia = [...galeria];
                  copia[i] = { ...copia[i], url: e.target.value };
                  setGaleria(copia);
                }}
                className={`${estiloInput} flex-[2]`}
              />
              <input
                placeholder="Texto alternativo"
                value={foto.alt}
                onChange={(e) => {
                  const copia = [...galeria];
                  copia[i] = { ...copia[i], alt: e.target.value };
                  setGaleria(copia);
                }}
                className={`${estiloInput} flex-[1]`}
              />
              <button
                type="button"
                onClick={() => setGaleria(galeria.filter((_, j) => j !== i))}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-error hover:bg-error/10"
                aria-label="Quitar foto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGaleria([...galeria, { url: "", alt: "" }])}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-verde-golf hover:underline"
        >
          <Plus size={15} /> Agregar foto
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <span className="text-sm font-medium text-carbon">
            Campos de golf incluidos
          </span>
          <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto rounded-[var(--radius-control)] border border-arena p-3">
            {campos.length === 0 && (
              <p className="text-xs text-niebla">
                No hay campos de golf en el catálogo todavía.
              </p>
            )}
            {campos.map((c) => (
              <label key={c.codigo} className="flex items-center gap-2 text-sm text-carbon">
                <input
                  type="checkbox"
                  checked={camposIds.includes(c.codigo)}
                  onChange={(e) =>
                    setCamposIds(
                      e.target.checked
                        ? [...camposIds, c.codigo]
                        : camposIds.filter((x) => x !== c.codigo),
                    )
                  }
                />
                {c.nombre}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-carbon">
            Destinos donde aparece
          </span>
          <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto rounded-[var(--radius-control)] border border-arena p-3">
            {destinos.map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-sm text-carbon">
                <input
                  type="checkbox"
                  checked={destinosIds.includes(d.id)}
                  onChange={(e) =>
                    setDestinosIds(
                      e.target.checked
                        ? [...destinosIds, d.id]
                        : destinosIds.filter((x) => x !== d.id),
                    )
                  }
                />
                {d.nombre}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-arena pt-5">
        <Button onClick={alGuardar} disabled={pending}>
          {pending ? "Guardando…" : esNuevo ? "Crear paquete" : "Guardar cambios"}
        </Button>
        {!esNuevo && (
          <Button
            variante="fantasma"
            className="text-error hover:bg-error/10"
            onClick={alEliminar}
            disabled={pending}
          >
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}

const estiloInput =
  "mt-1 w-full rounded-[var(--radius-control)] border border-arena bg-crema px-3 py-2 text-sm outline-none focus:border-verde-golf";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-carbon">{label}</span>
      {children}
    </label>
  );
}
