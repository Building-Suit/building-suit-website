import type { LandingLocale } from '~/types/content'

const legacyCopy = {
  en: {
    brandName: 'Building Suit',
    status: 'Coming Soon',
    promise: 'Clarity you can trust.',
    logoAlt: 'Building Suit',
    platformsTitle: 'More from Building Suit.',
    platformsSubtitle: 'Other platforms and systems we run.',
    newTabHint: 'opens in a new tab',
  },
  ar: {
    brandName: 'Building Suit',
    status: 'قريبًا',
    promise: 'وضوح تثق به.',
    logoAlt: 'Building Suit',
    platformsTitle: 'المزيد من Building Suit',
    platformsSubtitle: 'منصّات وأنظمة أخرى نُشغّلها.',
    newTabHint: 'يفتح في تبويب جديد',
  },
} as const

export function useLandingLocale() {
  const cookie = useCookie<LandingLocale>('bs-lang', {
    default: () => 'en',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const locale = computed<LandingLocale>(() => cookie.value === 'ar' ? 'ar' : 'en')
  const dir = computed<'ltr' | 'rtl'>(() => locale.value === 'ar' ? 'rtl' : 'ltr')

  // Compatibility for the original BrandIdentity/PlatformsRail components that remain
  // in the repository after the dynamic page was overlaid. The active dynamic landing
  // does not source its editable copy from here; it reads Supabase through useLandingContent().
  const copy = computed(() => legacyCopy[locale.value])

  const setLocale = (value: LandingLocale) => { cookie.value = value }
  const toggleLocale = () => setLocale(locale.value === 'en' ? 'ar' : 'en')

  return { locale, dir, copy, setLocale, toggleLocale }
}
