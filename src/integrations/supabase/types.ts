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
      contents: {
        Row: {
          content_link: string | null
          created_at: string
          id: string
          influencer_id: string
          interactions: number
          is_extra: boolean
          month_year: string
          notes: string | null
          post_date: string
          product: string
          proof_url: string | null
          reach: number
          type: string
          updated_at: string
        }
        Insert: {
          content_link?: string | null
          created_at?: string
          id?: string
          influencer_id: string
          interactions?: number
          is_extra?: boolean
          month_year: string
          notes?: string | null
          post_date: string
          product: string
          proof_url?: string | null
          reach?: number
          type: string
          updated_at?: string
        }
        Update: {
          content_link?: string | null
          created_at?: string
          id?: string
          influencer_id?: string
          interactions?: number
          is_extra?: boolean
          month_year?: string
          notes?: string | null
          post_date?: string
          product?: string
          proof_url?: string | null
          reach?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contents_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          description: string | null
          file_url: string
          id: string
          title: string
          updated_at: string
          uploaded_by_name: string
          uploaded_by_user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          title: string
          updated_at?: string
          uploaded_by_name: string
          uploaded_by_user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
          uploaded_by_name?: string
          uploaded_by_user_id?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          address_city: string
          address_complement: string | null
          address_neighborhood: string
          address_number: string
          address_state: string
          address_street: string
          address_zip_code: string
          contract_url: string | null
          coupon_preference: string
          cpf: string
          created_at: string
          email: string
          full_name: string
          generated_coupon: string | null
          id: string
          instagram: string | null
          is_doctor: boolean
          partnership_end_date: string | null
          partnership_start_date: string | null
          period: string | null
          phone: string
          pix_key: string
          posting_dates: string[] | null
          profile_photo_url: string | null
          referral_link: string | null
          status: string
          university: string | null
          updated_at: string
          user_id: string | null
          years_as_medic: number | null
        }
        Insert: {
          address_city: string
          address_complement?: string | null
          address_neighborhood: string
          address_number: string
          address_state: string
          address_street: string
          address_zip_code: string
          contract_url?: string | null
          coupon_preference: string
          cpf: string
          created_at?: string
          email: string
          full_name: string
          generated_coupon?: string | null
          id?: string
          instagram?: string | null
          is_doctor?: boolean
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          period?: string | null
          phone: string
          pix_key: string
          posting_dates?: string[] | null
          profile_photo_url?: string | null
          referral_link?: string | null
          status?: string
          university?: string | null
          updated_at?: string
          user_id?: string | null
          years_as_medic?: number | null
        }
        Update: {
          address_city?: string
          address_complement?: string | null
          address_neighborhood?: string
          address_number?: string
          address_state?: string
          address_street?: string
          address_zip_code?: string
          contract_url?: string | null
          coupon_preference?: string
          cpf?: string
          created_at?: string
          email?: string
          full_name?: string
          generated_coupon?: string | null
          id?: string
          instagram?: string | null
          is_doctor?: boolean
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          period?: string | null
          phone?: string
          pix_key?: string
          posting_dates?: string[] | null
          profile_photo_url?: string | null
          referral_link?: string | null
          status?: string
          university?: string | null
          updated_at?: string
          user_id?: string | null
          years_as_medic?: number | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string
          email: string | null
          expires_at: string
          id: string
          influencer_id: string | null
          name: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invite_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          expires_at?: string
          id?: string
          influencer_id?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          expires_at?: string
          id?: string
          influencer_id?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_goals: {
        Row: {
          created_at: string
          id: string
          month_year: string
          target_active_influencers: number
          target_leads: number
          target_registered_contents: number
          target_sales: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          target_active_influencers?: number
          target_leads?: number
          target_registered_contents?: number
          target_sales?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          target_active_influencers?: number
          target_leads?: number
          target_registered_contents?: number
          target_sales?: number
          updated_at?: string
        }
        Relationships: []
      }
      performance_evaluations: {
        Row: {
          bonus_checklist: Json | null
          bonus_score: number
          content_quality_score: number
          created_at: string
          engagement_score: number
          id: string
          influencer_id: string
          leads: number
          month_year: string
          partner_posture_score: number
          qualitative_notes: string | null
          quality_checklist: Json | null
          sales: number
          sales_score: number
          total_score: number | null
          updated_at: string
        }
        Insert: {
          bonus_checklist?: Json | null
          bonus_score?: number
          content_quality_score?: number
          created_at?: string
          engagement_score?: number
          id?: string
          influencer_id: string
          leads?: number
          month_year: string
          partner_posture_score?: number
          qualitative_notes?: string | null
          quality_checklist?: Json | null
          sales?: number
          sales_score?: number
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          bonus_checklist?: Json | null
          bonus_score?: number
          content_quality_score?: number
          created_at?: string
          engagement_score?: number
          id?: string
          influencer_id?: string
          leads?: number
          month_year?: string
          partner_posture_score?: number
          qualitative_notes?: string | null
          quality_checklist?: Json | null
          sales?: number
          sales_score?: number
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_evaluations_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prospect_cards: {
        Row: {
          city: string | null
          converted_from_pipeline_type:
            | Database["public"]["Enums"]["pipeline_type"]
            | null
          converted_influencer_id: string | null
          created_at: string
          created_by: string
          date_awaiting_response: string | null
          date_closed: string | null
          date_first_contact: string | null
          date_last_contact: string | null
          date_negotiation_start: string | null
          followers: number | null
          id: string
          instagram_url: string
          name: string
          niche: string
          pipeline_type: Database["public"]["Enums"]["pipeline_type"]
          position: number
          rejection_notes: string | null
          rejection_reason:
            | Database["public"]["Enums"]["rejection_reason"]
            | null
          size_category: string
          state_uf: string | null
          status: Database["public"]["Enums"]["prospect_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          converted_from_pipeline_type?:
            | Database["public"]["Enums"]["pipeline_type"]
            | null
          converted_influencer_id?: string | null
          created_at?: string
          created_by: string
          date_awaiting_response?: string | null
          date_closed?: string | null
          date_first_contact?: string | null
          date_last_contact?: string | null
          date_negotiation_start?: string | null
          followers?: number | null
          id?: string
          instagram_url: string
          name: string
          niche: string
          pipeline_type: Database["public"]["Enums"]["pipeline_type"]
          position?: number
          rejection_notes?: string | null
          rejection_reason?:
            | Database["public"]["Enums"]["rejection_reason"]
            | null
          size_category: string
          state_uf?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          converted_from_pipeline_type?:
            | Database["public"]["Enums"]["pipeline_type"]
            | null
          converted_influencer_id?: string | null
          created_at?: string
          created_by?: string
          date_awaiting_response?: string | null
          date_closed?: string | null
          date_first_contact?: string | null
          date_last_contact?: string | null
          date_negotiation_start?: string | null
          followers?: number | null
          id?: string
          instagram_url?: string
          name?: string
          niche?: string
          pipeline_type?: Database["public"]["Enums"]["pipeline_type"]
          position?: number
          rejection_notes?: string | null
          rejection_reason?:
            | Database["public"]["Enums"]["rejection_reason"]
            | null
          size_category?: string
          state_uf?: string | null
          status?: Database["public"]["Enums"]["prospect_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospect_cards_converted_influencer_id_fkey"
            columns: ["converted_influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_comments: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          id: string
          prospect_card_id: string
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          prospect_card_id: string
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          prospect_card_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_comments_prospect_card_id_fkey"
            columns: ["prospect_card_id"]
            isOneToOne: false
            referencedRelation: "prospect_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      prospect_reopen_history: {
        Row: {
          id: string
          prospect_card_id: string
          reopened_at: string
          reopened_by: string
        }
        Insert: {
          id?: string
          prospect_card_id: string
          reopened_at?: string
          reopened_by: string
        }
        Update: {
          id?: string
          prospect_card_id?: string
          reopened_at?: string
          reopened_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_reopen_history_prospect_card_id_fkey"
            columns: ["prospect_card_id"]
            isOneToOne: false
            referencedRelation: "prospect_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ranking: {
        Args: { p_month_year: string }
        Returns: {
          full_name: string
          influencer_id: string
          instagram: string
          profile_photo_url: string
          total_score: number
        }[]
      }
      get_user_influencer_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_invite_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          expires_at: string
          id: string
          influencer_id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invite_status"]
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "influencer"
      document_category: "briefing_institutional" | "rules"
      invite_status: "pending" | "accepted" | "expired" | "revoked"
      pipeline_type: "FPG_ONLINE" | "POS_GRAD"
      prospect_status:
        | "contato_inicial"
        | "em_negociacao"
        | "aguardando_retorno"
        | "aprovada_confirmada"
        | "nao_prosseguir"
      rejection_reason:
        | "nao_alinhamento_valores"
        | "exclusividade_outra_empresa"
        | "publico_nao_qualificado"
        | "nao_respondeu"
        | "nao_teve_interesse"
        | "outro"
      user_status: "active" | "inactive"
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
      app_role: ["admin", "influencer"],
      document_category: ["briefing_institutional", "rules"],
      invite_status: ["pending", "accepted", "expired", "revoked"],
      pipeline_type: ["FPG_ONLINE", "POS_GRAD"],
      prospect_status: [
        "contato_inicial",
        "em_negociacao",
        "aguardando_retorno",
        "aprovada_confirmada",
        "nao_prosseguir",
      ],
      rejection_reason: [
        "nao_alinhamento_valores",
        "exclusividade_outra_empresa",
        "publico_nao_qualificado",
        "nao_respondeu",
        "nao_teve_interesse",
        "outro",
      ],
      user_status: ["active", "inactive"],
    },
  },
} as const
