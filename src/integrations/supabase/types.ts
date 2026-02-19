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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          created_at: string
          id: string
          neighborhood_id: string | null
          number: string | null
          street: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          neighborhood_id?: string | null
          number?: string | null
          street?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          neighborhood_id?: string | null
          number?: string | null
          street?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          city: string
          created_at: string
          id: string
          name: string
          updated_at: string
          zone_color: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          zone_color?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          zone_color?: string
        }
        Relationships: []
      }
      occurrence_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          occurrence_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          occurrence_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          occurrence_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrence_images_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrences: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          pole_id: string | null
          priority: Database["public"]["Enums"]["priority_level"]
          protocol: string
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["occurrence_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          pole_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          protocol?: string
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["occurrence_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          pole_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"]
          protocol?: string
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["occurrence_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "occurrences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_pole_id_fkey"
            columns: ["pole_id"]
            isOneToOne: false
            referencedRelation: "poles"
            referencedColumns: ["id"]
          },
        ]
      }
      pole_id_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_external_id: string
          old_external_id: string
          pole_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_external_id: string
          old_external_id: string
          pole_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_external_id?: string
          old_external_id?: string
          pole_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pole_id_history_pole_id_fkey"
            columns: ["pole_id"]
            isOneToOne: false
            referencedRelation: "poles"
            referencedColumns: ["id"]
          },
        ]
      }
      poles: {
        Row: {
          address_id: string | null
          created_at: string
          external_id: string
          id: string
          ips: string[] | null
          lamp_type: string | null
          latitude: number
          longitude: number
          power_w: number | null
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          created_at?: string
          external_id: string
          id?: string
          ips?: string[] | null
          lamp_type?: string | null
          latitude: number
          longitude: number
          power_w?: number | null
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          created_at?: string
          external_id?: string
          id?: string
          ips?: string[] | null
          lamp_type?: string | null
          latitude?: number
          longitude?: number
          power_w?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poles_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          occurrence_id: string
          priority: Database["public"]["Enums"]["priority_level"]
          started_at: string | null
          status: Database["public"]["Enums"]["work_order_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          occurrence_id: string
          priority?: Database["public"]["Enums"]["priority_level"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          occurrence_id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["work_order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_operator: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "operator" | "citizen"
      occurrence_status:
        | "open"
        | "in_progress"
        | "resolved"
        | "closed"
        | "cancelled"
      priority_level: "low" | "medium" | "high" | "critical"
      work_order_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "operator", "citizen"],
      occurrence_status: [
        "open",
        "in_progress",
        "resolved",
        "closed",
        "cancelled",
      ],
      priority_level: ["low", "medium", "high", "critical"],
      work_order_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
