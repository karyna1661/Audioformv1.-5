export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      surveys: {
        Row: {
          id: string
          title: string
          questions: Json
          created_at: string
          expires_at: string | null
          is_active: boolean
          user_id: string | null
        }
        Insert: {
          id?: string
          title: string
          questions: Json
          created_at?: string
          expires_at?: string | null
          is_active?: boolean
          user_id?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["surveys"]["Insert"]>
      }
      responses: {
        Row: {
          id: string
          survey_id: string
          question_id: string
          audio_url: string | null
          response_text: string | null
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          question_id: string
          audio_url?: string | null
          response_text?: string | null
          created_at?: string
          user_id?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["responses"]["Insert"]>
      }
      demo_sessions: {
        Row: {
          id: string
          survey_id: string
          email: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          email?: string | null
          created_at?: string
          expires_at: string
        }
        Update: Partial<Database["public"]["Tables"]["demo_sessions"]["Insert"]>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
