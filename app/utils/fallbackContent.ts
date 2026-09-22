import type { ProjectLink, SiteSettings } from '~/types/content'

export const fallbackSettings: SiteSettings = {
  id: 'homepage',
  background_image_url: null,
  background_image_path: null,
  background_overlay_enabled: false,
  background_overlay_color: '#0B0B0D',
  background_overlay_opacity: 0.58,
  logo_url: null,
  logo_path: null,
  cover_image_url: null,
  cover_image_path: null,
  coming_soon_text_en: 'Coming Soon',
  coming_soon_text_ar: 'قريبًا',
  helper_text_en: 'Clarity you can trust.',
  helper_text_ar: 'وضوح تثق به.',
  projects_title_en: 'More from Building Suit.',
  projects_title_ar: 'المزيد من Building Suit',
  projects_helper_text_en: 'Other platforms and systems we run.',
  projects_helper_text_ar: 'منصّات وأنظمة أخرى نُشغّلها.',
}

export const fallbackProjects: ProjectLink[] = [
  {
    id: 'fallback-ledger-suit',
    title_en: 'Ledger Suit',
    title_ar: 'Ledger Suit',
    description_en: 'Business finance, clearly managed.',
    description_ar: 'إدارة واضحة لماليات أعمالك.',
    url: 'https://ledger.building-suit.com/',
    logo_url: null,
    logo_path: null,
    ribbon_text_en: null,
    ribbon_text_ar: null,
    sort_order: 10,
    is_visible: true,
  },
]
