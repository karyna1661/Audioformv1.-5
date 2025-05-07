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
          user_id: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          type: string
          questions: Json
          user_id?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          type?: string
          questions?: Json
          user_id?: string | null
          created_at?: string
          expires_at?: string | null
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
      responses: {
        Row: {
          id: string
          survey_id: string
          question_id: string
          audio_path: string
          email: string | null
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          survey_id: string
          question_id: string
          audio_path: string
          email?: string | null
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          survey_id?: string
          question_id?: string
          audio_path?: string
          email?: string | null
          created_at?: string
          expires_at?: string | null
        }
      }
      demo_sessions: {
        Row: {
          id: string
          user_id: string | null
          survey_id: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          survey_id: string
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string | null
          survey_id?: string
          created_at?: string
          expires_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          properties: Json
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          properties?: Json
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          properties?: Json
          created_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      // Add views here if you have any
    }
    Functions: {
      // Add functions here if you have any
    }
    Enums: {
      // Add enums here if you have any
    }
  }
}
