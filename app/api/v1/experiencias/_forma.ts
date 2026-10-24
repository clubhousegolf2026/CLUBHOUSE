import type { Experiencia } from "@/lib/contenido/experiencias";

/** Forma pública de una experiencia: solo lo que ya ve el viajero en el sitio
 *  (nunca costos ni márgenes). */
export function experienciaApi(e: Experiencia) {
  return {
    slug: e.slug,
    nombre: e.nombre,
    subtitulo: e.subtitulo,
    pais: e.pais,
    bandera: e.bandera,
    ubicacion: { lat: e.coordenadas[1], lng: e.coordenadas[0] },
    fechas: e.fechas,
    duracion: e.duracion,
    precio_desde: e.desde,
    resumen: e.resumen,
    descripcion: e.descripcionLarga,
    destacada: Boolean(e.destacada),
    foto: e.foto,
    galeria: e.galeria ?? [],
    salidas: e.salidas ?? [],
    tarifas: e.tarifas.map((t) => ({ perfil: t.perfil, detalle: t.detalle, precio: t.precio, unidad: t.unidad, incluye: t.incluye })),
    programa: e.programa,
    campos: e.rondas.map((r) => ({ nombre: r.nombre, lugar: r.lugar, descripcion: r.descripcion, datos: r.datos, foto: r.foto })),
    alojamiento: e.alojamiento,
    incluye: e.incluye,
    no_incluye: e.noIncluye,
    politicas: e.politicas ?? [],
    faq: e.faq ?? [],
    url: `/experiencias/${e.slug}`,
  };
}
