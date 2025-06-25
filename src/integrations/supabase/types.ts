export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calls: {
        Row: {
          call_duration: number | null
          call_summary: string | null
          candidate_id: number | null
          created_at: string
          evaluation: string | null
          id: number
          name: string | null
          phone: number | null
          search_id: number | null
          status: string | null
          structured_call_data: Json | null
          transcript: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          call_duration?: number | null
          call_summary?: string | null
          candidate_id?: number | null
          created_at?: string
          evaluation?: string | null
          id?: number
          name?: string | null
          phone?: number | null
          search_id?: number | null
          status?: string | null
          structured_call_data?: Json | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          call_duration?: number | null
          call_summary?: string | null
          candidate_id?: number | null
          created_at?: string
          evaluation?: string | null
          id?: number
          name?: string | null
          phone?: number | null
          search_id?: number | null
          status?: string | null
          structured_call_data?: Json | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          call_status: string | null
          created_at: string
          email: string | null
          hiring_status: boolean | null
          history_id: number | null
          id: number
          join_status: boolean | null
          liked: boolean | null
          match_score: number | null
          name: string | null
          phone: number | null
          relevant_work_experience: string | null
          search_id: number | null
          skills: string | null
          skills_experience: Json | null
          summary: string | null
          total_experience: string | null
          user_id: number | null
        }
        Insert: {
          call_status?: string | null
          created_at?: string
          email?: string | null
          hiring_status?: boolean | null
          history_id?: number | null
          id?: number
          join_status?: boolean | null
          liked?: boolean | null
          match_score?: number | null
          name?: string | null
          phone?: number | null
          relevant_work_experience?: string | null
          search_id?: number | null
          skills?: string | null
          skills_experience?: Json | null
          summary?: string | null
          total_experience?: string | null
          user_id?: number | null
        }
        Update: {
          call_status?: string | null
          created_at?: string
          email?: string | null
          hiring_status?: boolean | null
          history_id?: number | null
          id?: number
          join_status?: boolean | null
          liked?: boolean | null
          match_score?: number | null
          name?: string | null
          phone?: number | null
          relevant_work_experience?: string | null
          search_id?: number | null
          skills?: string | null
          skills_experience?: Json | null
          summary?: string | null
          total_experience?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_history_id_fkey"
            columns: ["history_id"]
            isOneToOne: false
            referencedRelation: "history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      history: {
        Row: {
          created_at: string
          creds: number | null
          id: number
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string
          creds?: number | null
          id?: number
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string
          creds?: number | null
          id?: number
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search: {
        Row: {
          company_location: string | null
          contract_hiring: boolean | null
          created_at: string
          custom_question: string | null
          hc_name: string | null
          history_id: number | null
          id: number
          job_description: string | null
          job_role: string | null
          key_skills: string | null
          noc: number | null
          notice_period: string | null
          processed: boolean | null
          raw_data: string | null
          rc_name: string | null
          remote_work: boolean | null
          shortlisted_index: Json | null
          user_id: number | null
        }
        Insert: {
          company_location?: string | null
          contract_hiring?: boolean | null
          created_at?: string
          custom_question?: string | null
          hc_name?: string | null
          history_id?: number | null
          id?: number
          job_description?: string | null
          job_role?: string | null
          key_skills?: string | null
          noc?: number | null
          notice_period?: string | null
          processed?: boolean | null
          raw_data?: string | null
          rc_name?: string | null
          remote_work?: boolean | null
          shortlisted_index?: Json | null
          user_id?: number | null
        }
        Update: {
          company_location?: string | null
          contract_hiring?: boolean | null
          created_at?: string
          custom_question?: string | null
          hc_name?: string | null
          history_id?: number | null
          id?: number
          job_description?: string | null
          job_role?: string | null
          key_skills?: string | null
          noc?: number | null
          notice_period?: string | null
          processed?: boolean | null
          raw_data?: string | null
          rc_name?: string | null
          remote_work?: boolean | null
          shortlisted_index?: Json | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_id_fkey"
            columns: ["history_id"]
            isOneToOne: false
            referencedRelation: "history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          creds: number | null
          email: string | null
          id: number
          name: string | null
          organization: string | null
          password: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          creds?: number | null
          email?: string | null
          id?: number
          name?: string | null
          organization?: string | null
          password: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          creds?: number | null
          email?: string | null
          id?: number
          name?: string | null
          organization?: string | null
          password?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
