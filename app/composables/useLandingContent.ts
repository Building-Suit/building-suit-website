import { fallbackProjects, fallbackSettings } from '~/utils/fallbackContent'
import type { ProjectLink, SiteSettings } from '~/types/content'

export function useLandingContent() {
  const supabase = useSupabaseClient()

  return useAsyncData('building-suit-landing-content', async () => {
    try {
      const [settingsResult, projectsResult] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 'homepage').maybeSingle(),
        supabase.from('project_links').select('*').eq('is_visible', true).order('sort_order', { ascending: true }),
      ])

      if (settingsResult.error) throw settingsResult.error
      if (projectsResult.error) throw projectsResult.error

      return {
        settings: (settingsResult.data as SiteSettings | null) ?? fallbackSettings,
        projects: (projectsResult.data as ProjectLink[] | null) ?? [],
        isFallback: false,
      }
    } catch (error) {
      console.warn('[Building Suit] Using local landing fallback because Supabase content is unavailable.', error)
      return { settings: fallbackSettings, projects: fallbackProjects, isFallback: true }
    }
  }, { server: true, default: () => ({ settings: fallbackSettings, projects: fallbackProjects, isFallback: true }) })
}
