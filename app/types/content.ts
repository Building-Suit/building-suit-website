import type { Tables } from '~/types/database.types'

type SiteSettingsRow = Tables<'site_settings'>
type ProjectLinkRow = Tables<'project_links'>

export type SiteSettings = Omit<SiteSettingsRow, 'id' | 'updated_at'> & {
  id: 'homepage'
  updated_at?: string
}

export type ProjectLink = Omit<ProjectLinkRow, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
}

export type LandingLocale = 'en' | 'ar'
