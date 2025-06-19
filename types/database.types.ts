export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
      }
      surveys: {
        Row: {
          id: string
          title: string
          type: string
          questions: Json
          created_at: string
          expires_at: string | null
          is_active: boolean
          user_id: string | null
          settings: Json | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          type: string
          questions: Json
          created_at?: string
          expires_at?: string | null
          is_active?: boolean
          user_id?: string | null
          settings?: Json | null
          metadata?: Json | null
        }
        Update: Partial<Database["public"]["Tables"]["surveys"]["Insert"]>
      }
      responses: {
        Row: {
          id: string
          survey_id: string
          question_id: string
          question_index: number | null
          audio_path: string
          audio_url: string | null
          transcript: string | null
          sentiment_score: number | null
          created_at: string
          user_id: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          survey_id: string
          question_id: string
          question_index?: number | null
          audio_path: string
          audio_url?: string | null
          transcript?: string | null
          sentiment_score?: number | null
          created_at?: string
          user_id?: string | null
          metadata?: Json | null
        }
        Update: Partial<Database["public"]["Tables"]["responses"]["Insert"]>
      }
      demo_sessions: {
        Row: {
          id: string
          survey_id: string
          email: string | null
          started_at: string
          expires_at: string
          notified: boolean
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          email?: string | null
          started_at?: string
          expires_at: string
          notified?: boolean
          user_id?: string | null
          created_at?: string
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
