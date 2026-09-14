// Generado desde el esquema de Supabase (proyecto "CLUB HOUSE").
// No editar a mano — regenerar con la migración correspondiente si el
// esquema cambia (ver migraciones clubhouse_schema_inicial / clubhouse_seed_catalogo).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bloqueos_calendario: {
        Row: {
          created_at: string
          factor_precio: number | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          nota: string | null
          tipo: Database["public"]["Enums"]["tipo_bloqueo"]
        }
        Insert: {
          created_at?: string
          factor_precio?: number | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          nota?: string | null
          tipo: Database["public"]["Enums"]["tipo_bloqueo"]
        }
        Update: {
          created_at?: string
          factor_precio?: number | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          nota?: string | null
          tipo?: Database["public"]["Enums"]["tipo_bloqueo"]
        }
        Relationships: []
      }
      contactos: {
        Row: {
          created_at: string
          email: string
          fecha_tentativa: string | null
          id: string
          mensaje: string | null
          nombre: string
          origen: Database["public"]["Enums"]["origen_contacto"]
          telefono: string | null
        }
        Insert: {
          created_at?: string
          email: string
          fecha_tentativa?: string | null
          id?: string
          mensaje?: string | null
          nombre: string
          origen: Database["public"]["Enums"]["origen_contacto"]
          telefono?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          fecha_tentativa?: string | null
          id?: string
          mensaje?: string | null
          nombre?: string
          origen?: Database["public"]["Enums"]["origen_contacto"]
          telefono?: string | null
        }
        Relationships: []
      }
      cotizaciones: {
        Row: {
          contacto_id: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_cotizacion"]
          id: string
          impuestos: number
          lineas: Json
          moneda: string
          por_persona: number
          seleccion: Json
          subtotal: number
          tipo: Database["public"]["Enums"]["tipo_cotizacion"]
          total: number
          updated_at: string
        }
        Insert: {
          contacto_id: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_cotizacion"]
          id?: string
          impuestos: number
          lineas: Json
          moneda?: string
          por_persona: number
          seleccion: Json
          subtotal: number
          tipo: Database["public"]["Enums"]["tipo_cotizacion"]
          total: number
          updated_at?: string
        }
        Update: {
          contacto_id?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_cotizacion"]
          id?: string
          impuestos?: number
          lineas?: Json
          moneda?: string
          por_persona?: number
          seleccion?: Json
          subtotal?: number
          tipo?: Database["public"]["Enums"]["tipo_cotizacion"]
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contactos"
            referencedColumns: ["id"]
          },
        ]
      }
      destino_paquetes: {
        Row: {
          destino_id: string
          paquete_id: string
        }
        Insert: {
          destino_id: string
          paquete_id: string
        }
        Update: {
          destino_id?: string
          paquete_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "destino_paquetes_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "destinos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "destino_paquetes_paquete_id_fkey"
            columns: ["paquete_id"]
            isOneToOne: false
            referencedRelation: "paquetes"
            referencedColumns: ["id"]
          },
        ]
      }
      destinos: {
        Row: {
          created_at: string
          disponible: boolean
          id: string
          lat: number
          lng: number
          nombre: string
          orden: number
          pais: string
          region: string
          resumen: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          disponible?: boolean
          id: string
          lat: number
          lng: number
          nombre: string
          orden?: number
          pais: string
          region: string
          resumen: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          disponible?: boolean
          id?: string
          lat?: number
          lng?: number
          nombre?: string
          orden?: number
          pais?: string
          region?: string
          resumen?: string
          updated_at?: string
        }
        Relationships: []
      }
      paquete_campos: {
        Row: {
          orden: number
          paquete_id: string
          tarifa_codigo: string
        }
        Insert: {
          orden?: number
          paquete_id: string
          tarifa_codigo: string
        }
        Update: {
          orden?: number
          paquete_id?: string
          tarifa_codigo?: string
        }
        Relationships: [
          {
            foreignKeyName: "paquete_campos_paquete_id_fkey"
            columns: ["paquete_id"]
            isOneToOne: false
            referencedRelation: "paquetes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paquete_campos_tarifa_codigo_fkey"
            columns: ["tarifa_codigo"]
            isOneToOne: false
            referencedRelation: "tarifas_componentes"
            referencedColumns: ["codigo"]
          },
        ]
      }
      paquetes: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string
          destacado: boolean
          dias: number
          galeria: Json
          id: string
          incluye: string[]
          no_incluye: string[]
          noches: number
          nombre: string
          precio_desde_cop: number
          slug: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion: string
          destacado?: boolean
          dias: number
          galeria?: Json
          id: string
          incluye?: string[]
          no_incluye?: string[]
          noches: number
          nombre: string
          precio_desde_cop: number
          slug: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string
          destacado?: boolean
          dias?: number
          galeria?: Json
          id?: string
          incluye?: string[]
          no_incluye?: string[]
          noches?: number
          nombre?: string
          precio_desde_cop?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          confirmada_at: string | null
          cotizacion_id: string
          created_at: string
          estado_pago: Database["public"]["Enums"]["estado_pago"]
          id: string
          monto_deposito_cop: number
          pasarela: string | null
          referencia_pago: string | null
        }
        Insert: {
          confirmada_at?: string | null
          cotizacion_id: string
          created_at?: string
          estado_pago?: Database["public"]["Enums"]["estado_pago"]
          id?: string
          monto_deposito_cop: number
          pasarela?: string | null
          referencia_pago?: string | null
        }
        Update: {
          confirmada_at?: string | null
          cotizacion_id?: string
          created_at?: string
          estado_pago?: Database["public"]["Enums"]["estado_pago"]
          id?: string
          monto_deposito_cop?: number
          pasarela?: string | null
          referencia_pago?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: true
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      tarifas_componentes: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          descripcion: string | null
          destino_id: string | null
          metadata: Json
          nombre: string
          precio_unitario_cop: number
          temporada_alta_factor: number
          tipo: Database["public"]["Enums"]["tipo_componente"]
          unidad: Database["public"]["Enums"]["unidad_tarifa"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          descripcion?: string | null
          destino_id?: string | null
          metadata?: Json
          nombre: string
          precio_unitario_cop: number
          temporada_alta_factor?: number
          tipo: Database["public"]["Enums"]["tipo_componente"]
          unidad: Database["public"]["Enums"]["unidad_tarifa"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          descripcion?: string | null
          destino_id?: string | null
          metadata?: Json
          nombre?: string
          precio_unitario_cop?: number
          temporada_alta_factor?: number
          tipo?: Database["public"]["Enums"]["tipo_componente"]
          unidad?: Database["public"]["Enums"]["unidad_tarifa"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarifas_componentes_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "destinos"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonios: {
        Row: {
          created_at: string
          handicap: string | null
          id: string
          nombre: string
          orden: number
          origen: string
          texto: string
        }
        Insert: {
          created_at?: string
          handicap?: string | null
          id: string
          nombre: string
          orden?: number
          origen: string
          texto: string
        }
        Update: {
          created_at?: string
          handicap?: string | null
          id?: string
          nombre?: string
          orden?: number
          origen?: string
          texto?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estado_cotizacion: "nueva" | "contactada" | "confirmada" | "cancelada"
      estado_pago: "pendiente" | "pagado" | "fallido" | "reembolsado"
      origen_contacto: "contacto" | "cotizador"
      tipo_bloqueo: "bloqueo" | "temporada_alta" | "cupo"
      tipo_componente:
        | "fee_servicio"
        | "campo_golf"
        | "hotel"
        | "transporte"
        | "actividad"
      tipo_cotizacion: "cotizacion" | "reserva"
      unidad_tarifa: "persona_dia" | "habitacion_noche" | "servicio" | "grupo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_cotizacion: ["nueva", "contactada", "confirmada", "cancelada"],
      estado_pago: ["pendiente", "pagado", "fallido", "reembolsado"],
      origen_contacto: ["contacto", "cotizador"],
      tipo_bloqueo: ["bloqueo", "temporada_alta", "cupo"],
      tipo_componente: [
        "fee_servicio",
        "campo_golf",
        "hotel",
        "transporte",
        "actividad",
      ],
      tipo_cotizacion: ["cotizacion", "reserva"],
      unidad_tarifa: ["persona_dia", "habitacion_noche", "servicio", "grupo"],
    },
  },
} as const
