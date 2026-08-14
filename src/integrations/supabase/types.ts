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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          id: string
          ip: string | null
          resource: string | null
          result: string
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          id?: string
          ip?: string | null
          resource?: string | null
          result?: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          id?: string
          ip?: string | null
          resource?: string | null
          result?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          email: string
          id: string
          integration: string
          is_protected: boolean
          last_login_at: string | null
          name: string
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          integration?: string
          is_protected?: boolean
          last_login_at?: string | null
          name: string
          role?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          integration?: string
          is_protected?: boolean
          last_login_at?: string | null
          name?: string
          role?: string
          status?: string
        }
        Relationships: []
      }
      infrastructure_files: {
        Row: {
          created_at: string
          detected_columns: Json
          error_message: string | null
          filename: string
          id: string
          sheet_names: Json
          size_bytes: number
          status: string
          storage_path: string | null
          summary: Json
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          detected_columns?: Json
          error_message?: string | null
          filename: string
          id?: string
          sheet_names?: Json
          size_bytes?: number
          status?: string
          storage_path?: string | null
          summary?: Json
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          detected_columns?: Json
          error_message?: string | null
          filename?: string
          id?: string
          sheet_names?: Json
          size_bytes?: number
          status?: string
          storage_path?: string | null
          summary?: Json
          uploaded_by?: string | null
        }
        Relationships: []
      }
      infrastructure_links: {
        Row: {
          bandwidth_mbps: number | null
          circuit_id: string | null
          created_at: string
          customer: string | null
          device: string | null
          file_id: string
          id: string
          interface_name: string | null
          link_name: string
          observium_ref: string | null
          raw: Json
          region: string | null
          solarwinds_ref: string | null
        }
        Insert: {
          bandwidth_mbps?: number | null
          circuit_id?: string | null
          created_at?: string
          customer?: string | null
          device?: string | null
          file_id: string
          id?: string
          interface_name?: string | null
          link_name: string
          observium_ref?: string | null
          raw?: Json
          region?: string | null
          solarwinds_ref?: string | null
        }
        Update: {
          bandwidth_mbps?: number | null
          circuit_id?: string | null
          created_at?: string
          customer?: string | null
          device?: string | null
          file_id?: string
          id?: string
          interface_name?: string | null
          link_name?: string
          observium_ref?: string | null
          raw?: Json
          region?: string | null
          solarwinds_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_links_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_files"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          base_url: string
          created_at: string
          detail: string | null
          id: string
          kind: string
          last_checked_at: string | null
          last_used_at: string | null
          login_password: string | null
          login_username: string | null
          name: string
          owner_email: string | null
          status: string
          updated_at: string
        }
        Insert: {
          base_url: string
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          last_checked_at?: string | null
          last_used_at?: string | null
          login_password?: string | null
          login_username?: string | null
          name: string
          owner_email?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          base_url?: string
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          last_checked_at?: string | null
          last_used_at?: string | null
          login_password?: string | null
          login_username?: string | null
          name?: string
          owner_email?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_captures: {
        Row: {
          approved: boolean
          captured_at: string | null
          checksum: string | null
          created_at: string
          error_message: string | null
          id: string
          image_path: string | null
          ocr_ok: boolean | null
          ocr_text: string | null
          platform: string
          report_id: string
          slot_key: string
          slot_label: string | null
          source_url: string | null
          status: string
        }
        Insert: {
          approved?: boolean
          captured_at?: string | null
          checksum?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          image_path?: string | null
          ocr_ok?: boolean | null
          ocr_text?: string | null
          platform: string
          report_id: string
          slot_key: string
          slot_label?: string | null
          source_url?: string | null
          status?: string
        }
        Update: {
          approved?: boolean
          captured_at?: string | null
          checksum?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          image_path?: string | null
          ocr_ok?: boolean | null
          ocr_text?: string | null
          platform?: string
          report_id?: string
          slot_key?: string
          slot_label?: string | null
          source_url?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_captures_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          body_text: string | null
          created_at: string
          filename: string
          graph_slots: Json
          id: string
          is_active: boolean
          label: string
          placeholders: Json
          size_bytes: number
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          body_text?: string | null
          created_at?: string
          filename: string
          graph_slots?: Json
          id?: string
          is_active?: boolean
          label: string
          placeholders?: Json
          size_bytes?: number
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          body_text?: string | null
          created_at?: string
          filename?: string
          graph_slots?: Json
          id?: string
          is_active?: boolean
          label?: string
          placeholders?: Json
          size_bytes?: number
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          approved_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          format: string
          html: string | null
          id: string
          name: string
          period_label: string | null
          status: string
          template_id: string | null
          template_label: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          format?: string
          html?: string | null
          id?: string
          name: string
          period_label?: string | null
          status?: string
          template_id?: string | null
          template_label?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          format?: string
          html?: string | null
          id?: string
          name?: string
          period_label?: string | null
          status?: string
          template_id?: string | null
          template_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
