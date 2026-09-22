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
      admin_users: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          background_image_url: string | null
          background_image_path: string | null
          background_overlay_enabled: boolean
          background_overlay_color: string
          background_overlay_opacity: number
          logo_url: string | null
          logo_path: string | null
          cover_image_url: string | null
          cover_image_path: string | null
          coming_soon_text_en: string
          coming_soon_text_ar: string
          helper_text_en: string | null
          helper_text_ar: string | null
          projects_title_en: string
          projects_title_ar: string
          projects_helper_text_en: string | null
          projects_helper_text_ar: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          background_image_url?: string | null
          background_image_path?: string | null
          background_overlay_enabled?: boolean
          background_overlay_color?: string
          background_overlay_opacity?: number
          logo_url?: string | null
          logo_path?: string | null
          cover_image_url?: string | null
          cover_image_path?: string | null
          coming_soon_text_en?: string
          coming_soon_text_ar?: string
          helper_text_en?: string | null
          helper_text_ar?: string | null
          projects_title_en?: string
          projects_title_ar?: string
          projects_helper_text_en?: string | null
          projects_helper_text_ar?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          background_image_url?: string | null
          background_image_path?: string | null
          background_overlay_enabled?: boolean
          background_overlay_color?: string
          background_overlay_opacity?: number
          logo_url?: string | null
          logo_path?: string | null
          cover_image_url?: string | null
          cover_image_path?: string | null
          coming_soon_text_en?: string
          coming_soon_text_ar?: string
          helper_text_en?: string | null
          helper_text_ar?: string | null
          projects_title_en?: string
          projects_title_ar?: string
          projects_helper_text_en?: string | null
          projects_helper_text_ar?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_links: {
        Row: {
          id: string
          title_en: string
          title_ar: string | null
          description_en: string | null
          description_ar: string | null
          url: string
          logo_url: string | null
          logo_path: string | null
          ribbon_text_en: string | null
          ribbon_text_ar: string | null
          sort_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_en: string
          title_ar?: string | null
          description_en?: string | null
          description_ar?: string | null
          url: string
          logo_url?: string | null
          logo_path?: string | null
          ribbon_text_en?: string | null
          ribbon_text_ar?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_en?: string
          title_ar?: string | null
          description_en?: string | null
          description_ar?: string | null
          url?: string
          logo_url?: string | null
          logo_path?: string | null
          ribbon_text_en?: string | null
          ribbon_text_ar?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_landing_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  TableName extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][TableName]['Row']

export type TablesInsert<
  TableName extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][TableName]['Insert']

export type TablesUpdate<
  TableName extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][TableName]['Update']
