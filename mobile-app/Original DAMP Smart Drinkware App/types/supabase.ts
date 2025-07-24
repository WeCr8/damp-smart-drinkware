export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      device_registrations: {
        Row: {
          id: string
          user_id: string
          device_type: string
          device_name: string
          operating_system: string | null
          registered_at: string
          last_active: string
          status: string
          device_metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          device_type: string
          device_name: string
          operating_system?: string | null
          registered_at?: string
          last_active?: string
          status?: string
          device_metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          device_type?: string
          device_name?: string
          operating_system?: string | null
          registered_at?: string
          last_active?: string
          status?: string
          device_metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "device_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_greetings: {
        Row: {
          id: string
          user_id: string
          greeting_message: string
          language: string
          time_context: string
          is_custom: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          greeting_message: string
          language?: string
          time_context?: string
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          greeting_message?: string
          language?: string
          time_context?: string
          is_custom?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_greetings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
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