export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      surveys: {
        Row: {
          id: string
          title: string
          type: string
          questions: Json
          created_at: string
          expires_at: string
          user_id: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          type?: string
          questions: Json
          created_at?: string
          expires_at?: string
          user_id?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          type?: string
          questions?: Json
          created_at?: string
          expires_at?: string
          user_id?: string | null
          is_active?: boolean
        }
      }
      responses: {
        Row: {
          id: string
          survey_id: string
          question_id: string
          audio_path: string
          email: string | null
          created_at: string
          transcript: string | null
          sentiment: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          question_id: string
          audio_path: string
          email?: string | null
          created_at?: string
          transcript?: string | null
          sentiment?: string | null
          expires_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          question_id?: string
          audio_path?: string
          email?: string | null
          created_at?: string
          transcript?: string | null
          sentiment?: string | null
          expires_at?: string
        }
      }
      demo_sessions: {
        Row: {
          id: string
          user_id: string | null
          survey_id: string
          started_at: string
          expires_at: string
          notified: boolean
        }
        Insert: {
          id?: string
          user_id?: string | null
          survey_id: string
          started_at?: string
          expires_at: string
          notified?: boolean
        }
        Update: {
          id?: string
          user_id?: string | null
          survey_id?: string
          started_at?: string
          expires_at?: string
          notified?: boolean
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          survey_id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          email?: string
          created_at?: string
        }
      }
      analytics_funnels: {
        Row: {
          id: number
          funnel_name: string
          created_at: string
        }
        Insert: {
          id?: number
          funnel_name: string
          created_at?: string
        }
        Update: {
          id?: number
          funnel_name?: string
          created_at?: string
        }
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
  }
}
