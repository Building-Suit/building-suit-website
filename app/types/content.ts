export interface SiteSettings {
  id: 'homepage'
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
  updated_at?: string
}

export interface ProjectLink {
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
  created_at?: string
  updated_at?: string
}

export type LandingLocale = 'en' | 'ar'
