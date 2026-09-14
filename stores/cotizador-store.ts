"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { calcularCotizacion } from "@/lib/pricing/engine";
import type {
  Tarifa,
  SeleccionItinerario,
  Cotizacion,
} from "@/lib/pricing/types";

interface CotizadorState {
  catalogo: Map<string, Tarifa>;
  seleccion: SeleccionItinerario;
  cotizacion: Cotizacion;
  paso: number;
  hidratado: boolean;

  hidratarCatalogo: (tarifas: Tarifa[]) => void;
  setCampos: (codigos: string[]) => void;
  toggleCampo: (codigo: string) => void;
  setRondas: (codigo: string, n: number) => void;
  setHotel: (codigo: string | null) => void;
  setHabitaciones: (n: number) => void;
  setTransporte: (codigo: string | null) => void;
  toggleActividad: (codigo: string) => void;
  setNoches: (n: number) => void;
  setNumPax: (n: number) => void;
  setFecha: (iso: string | null, temporadaAlta: boolean) => void;
  setPaso: (p: number) => void;
  reset: () => void;
}

const SELECCION_INICIAL: SeleccionItinerario = {
  campos: [],
  rondasPorCampo: {},
  hotelCodigo: null,
  habitaciones: 1,
  transporteCodigo: null,
  actividades: [],
  noches: 3,
  numPax: 2,
  fechaInicio: null,
  temporadaAlta: false,
};

const COTIZACION_VACIA: Cotizacion = {
  lineas: [],
  subtotal: 0,
  impuestos: 0,
  total: 0,
  porPersona: 0,
};

export const useCotizador = create<CotizadorState>()(
  persist(
    (set, get) => {
      /** Punto único de mutación: recalcula el precio SINCRÓNICAMENTE.
       *  React re-renderiza el panel en el mismo tick => el usuario ve el
       *  cambio "al instante", sin llamadas de red ni spinners. */
      const aplicar = (patch: Partial<SeleccionItinerario>) => {
        const seleccion = { ...get().seleccion, ...patch };
        set({
          seleccion,
          cotizacion: calcularCotizacion(seleccion, get().catalogo),
        });
      };

      return {
        catalogo: new Map(),
        seleccion: SELECCION_INICIAL,
        cotizacion: COTIZACION_VACIA,
        paso: 0,
        hidratado: false,

        hidratarCatalogo: (tarifas) => {
          const catalogo = new Map(tarifas.map((t) => [t.codigo, t]));
          set({
            catalogo,
            hidratado: true,
            cotizacion: calcularCotizacion(get().seleccion, catalogo),
          });
        },

        setCampos: (campos) => aplicar({ campos }),
        toggleCampo: (codigo) => {
          const cur = get().seleccion.campos;
          aplicar({
            campos: cur.includes(codigo)
              ? cur.filter((c) => c !== codigo)
              : [...cur, codigo],
          });
        },
        setRondas: (codigo, n) =>
          aplicar({
            rondasPorCampo: {
              ...get().seleccion.rondasPorCampo,
              [codigo]: Math.min(4, Math.max(1, n)),
            },
          }),
        setHotel: (hotelCodigo) => aplicar({ hotelCodigo }),
        setHabitaciones: (n) => aplicar({ habitaciones: Math.max(1, n) }),
        setTransporte: (transporteCodigo) => aplicar({ transporteCodigo }),
        toggleActividad: (codigo) => {
          const cur = get().seleccion.actividades;
          aplicar({
            actividades: cur.includes(codigo)
              ? cur.filter((c) => c !== codigo)
              : [...cur, codigo],
          });
        },
        setNoches: (n) => aplicar({ noches: Math.min(30, Math.max(1, n)) }),
        setNumPax: (n) => aplicar({ numPax: Math.min(40, Math.max(1, n)) }),
        setFecha: (fechaInicio, temporadaAlta) =>
          aplicar({ fechaInicio, temporadaAlta }),
        setPaso: (paso) => set({ paso }),
        reset: () =>
          set({
            seleccion: SELECCION_INICIAL,
            cotizacion: calcularCotizacion(SELECCION_INICIAL, get().catalogo),
            paso: 0,
          }),
      };
    },
    {
      name: "clubhouse-cotizador",
      storage: createJSONStorage(() => localStorage),
      // El Map del catálogo se rehidrata desde el server; solo persistimos
      // lo que el usuario eligió.
      partialize: (s) => ({ seleccion: s.seleccion, paso: s.paso }),
    },
  ),
);
