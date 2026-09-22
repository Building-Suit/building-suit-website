import type { LandingLocale } from '~/types/content'

export function useLandingLocale() {
  const cookie = useCookie<LandingLocale>('bs-lang', {
    default: () => 'en',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const locale = computed<LandingLocale>(() => cookie.value === 'ar' ? 'ar' : 'en')
  const dir = computed<'ltr' | 'rtl'>(() => locale.value === 'ar' ? 'rtl' : 'ltr')
  const setLocale = (value: LandingLocale) => { cookie.value = value }
  const toggleLocale = () => setLocale(locale.value === 'en' ? 'ar' : 'en')
  return { locale, dir, setLocale, toggleLocale }
}
