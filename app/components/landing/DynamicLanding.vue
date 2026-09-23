<script setup lang="ts">
import type { ProjectLink, SiteSettings } from '~/types/content'

const props = defineProps<{
  settings: SiteSettings
  projects: ProjectLink[]
  locale: 'en' | 'ar'
}>()

const root = ref<HTMLElement | null>(null)
const { toggleLocale } = useLandingLocale()
const { theme, setTheme } = useAppearance()

const title = computed(() => props.locale === 'ar'
  ? props.settings.coming_soon_text_ar
  : props.settings.coming_soon_text_en)

const helper = computed(() => props.locale === 'ar'
  ? props.settings.helper_text_ar
  : props.settings.helper_text_en)

const projectsTitle = computed(() => props.locale === 'ar'
  ? props.settings.projects_title_ar
  : props.settings.projects_title_en)

const projectsHelper = computed(() => props.locale === 'ar'
  ? props.settings.projects_helper_text_ar
  : props.settings.projects_helper_text_en)

const customLogo = computed(() => props.settings.logo_url || '')
const hasCover = computed(() => Boolean(props.settings.cover_image_url))
const hasBackground = computed(() => Boolean(props.settings.background_image_url))

const ui = computed(() => props.locale === 'ar'
  ? {
      scroll: 'مرّر لاكتشاف المزيد',
      open: 'فتح المنصة',
      language: 'التبديل إلى الإنجليزية',
      appearance: 'المظهر',
      newTab: 'يفتح في تبويب جديد',
    }
  : {
      scroll: 'Scroll to explore',
      open: 'Open platform',
      language: 'Switch to Arabic',
      appearance: 'Appearance',
      newTab: 'opens in a new tab',
    })

const entries = computed(() => props.projects.map((project) => ({
  ...project,
  title: props.locale === 'ar'
    ? (project.title_ar || project.title_en)
    : (project.title_en || project.title_ar || ''),
  description: props.locale === 'ar'
    ? (project.description_ar || project.description_en || '')
    : (project.description_en || project.description_ar || ''),
  ribbon: props.locale === 'ar'
    ? (project.ribbon_text_ar || project.ribbon_text_en || '')
    : (project.ribbon_text_en || project.ribbon_text_ar || ''),
})))

const overlayStyle = computed(() => ({
  backgroundColor: props.settings.background_overlay_color || '#0B0B0D',
  opacity: String(props.settings.background_overlay_opacity ?? 0.58),
}))

const appearanceOrder = ['system', 'dark', 'light'] as const

function cycleAppearance() {
  const current = appearanceOrder.indexOf(theme.value)
  setTheme(appearanceOrder[(current + 1) % appearanceOrder.length]!)
}

const appearanceLabel = computed(() => ui.value.appearance + ': ' + theme.value)

let gsapContext: { revert: () => void } | undefined
let ScrollTriggerApi: { refresh: () => void } | undefined

onMounted(async () => {
  if (!root.value) return

  const [{ gsap }, scrollTriggerModule] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])

  const ScrollTrigger = scrollTriggerModule.ScrollTrigger
  ScrollTriggerApi = ScrollTrigger
  gsap.registerPlugin(ScrollTrigger)

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsapContext = gsap.context(() => {
    const progress = root.value?.querySelector<HTMLElement>('[data-gsap-progress]')

    if (progress) {
      gsap.set(progress, {
        scaleX: reduced ? 1 : 0,
        transformOrigin: props.locale === 'ar' ? '100% 50%' : '0% 50%',
      })

      if (!reduced) {
        gsap.to(progress, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root.value,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2,
          },
        })
      }
    }

    if (reduced) return

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    intro
      .from('[data-gsap="header"]', { autoAlpha: 0, y: -18, duration: 0.6 })
      .from('[data-gsap="kicker"]', { autoAlpha: 0, y: 22, duration: 0.5 }, 0.12)
      .from('[data-gsap="title"]', { autoAlpha: 0, yPercent: 28, duration: 1.05 }, 0.2)
      .from('[data-gsap="promise"]', { autoAlpha: 0, y: 24, duration: 0.65 }, 0.42)
      .from('[data-gsap="hero-line"]', {
        scaleX: 0,
        duration: 0.8,
        transformOrigin: props.locale === 'ar' ? '100% 50%' : '0% 50%',
      }, 0.5)
      .from('[data-gsap="tower"]', {
        autoAlpha: 0,
        y: 54,
        scaleY: 0.86,
        duration: 0.95,
        stagger: 0.1,
        transformOrigin: '50% 100%',
      }, 0.32)
      .from('[data-gsap="cover"]', { autoAlpha: 0, y: 36, scale: 0.96, duration: 1 }, 0.32)
      .from('[data-gsap="orbit"]', { autoAlpha: 0, scale: 0.74, duration: 1, stagger: 0.12 }, 0.48)
      .from('[data-gsap="scroll"]', { autoAlpha: 0, y: 16, duration: 0.5 }, 0.86)

    gsap.to('[data-gsap-orbit-a]', { rotation: 360, duration: 34, repeat: -1, ease: 'none' })
    gsap.to('[data-gsap-orbit-b]', { rotation: -360, duration: 46, repeat: -1, ease: 'none' })

    gsap.to('[data-gsap="hero-visual"]', {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-gsap="hero"]',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    if (entries.value.length) {
      gsap.from('[data-gsap="projects-heading"] > *', {
        autoAlpha: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-gsap="projects-heading"]',
          start: 'top 82%',
          once: true,
        },
      })

      gsap.from('[data-gsap="project-card"]', {
        autoAlpha: 0,
        y: 48,
        rotateX: 5,
        transformPerspective: 900,
        duration: 0.85,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '[data-gsap="project-grid"]',
          start: 'top 84%',
          once: true,
        },
      })
    }

    gsap.to('[data-gsap="wordmark"]', {
      xPercent: props.locale === 'ar' ? 18 : -18,
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-gsap="wordmark-section"]',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    })

    gsap.from('[data-gsap="footer"] > *', {
      autoAlpha: 0,
      y: 18,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '[data-gsap="footer"]',
        start: 'top 92%',
        once: true,
      },
    })
  }, root.value)

  nextTick(() => ScrollTrigger.refresh())
})

watch(
  () => [props.locale, entries.value.length, hasCover.value],
  () => nextTick(() => ScrollTriggerApi?.refresh()),
)

onBeforeUnmount(() => {
  gsapContext?.revert()
})
</script>

<template>
  <div ref="root" class="bs-gsap-landing">
    <div v-if="hasBackground" class="bs-gsap-background" aria-hidden="true">
      <img :src="settings.background_image_url || ''" alt="">
      <span
        v-if="settings.background_overlay_enabled"
        class="bs-gsap-background__overlay"
        :style="overlayStyle"
      />
    </div>

    <div class="bs-gsap-progress" aria-hidden="true">
      <span data-gsap-progress />
    </div>

    <div class="bs-gsap-ambient bs-gsap-ambient--one" aria-hidden="true" />
    <div class="bs-gsap-ambient bs-gsap-ambient--two" aria-hidden="true" />

    <header class="bs-gsap-header" data-gsap="header">
      <a class="bs-gsap-brand" href="#top" aria-label="Building Suit">
        <span v-if="customLogo" class="bs-gsap-brand__uploaded-logo" aria-hidden="true">
          <img :src="customLogo" alt="">
        </span>
        <span v-else class="bs-gsap-brand__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span class="bs-gsap-brand__name">Building Suit</span>
      </a>

      <div class="bs-gsap-header__controls">
        <button
          class="bs-gsap-control"
          type="button"
          :aria-label="ui.language"
          data-testid="language-control"
          @click="toggleLocale"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 5h12M9 3v2c0 4.2-2.4 7.8-6 9.6M5 9c1.4 2.2 3.6 4 6 5M14 19l3.5-8 3.5 8M15.2 16h4.6" />
          </svg>
          <span>{{ locale === 'en' ? 'AR' : 'EN' }}</span>
        </button>

        <button
          class="bs-gsap-control bs-gsap-control--icon"
          type="button"
          :aria-label="appearanceLabel"
          :title="appearanceLabel"
          data-testid="appearance-control"
          @click="cycleAppearance"
        >
          <svg v-if="theme === 'light'" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3.7" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg v-else-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.4 15.4A8.6 8.6 0 0 1 8.6 3.6 8.6 8.6 0 1 0 20.4 15.4Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="13" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </button>
      </div>
    </header>

    <main id="main-content" aria-label="Building Suit">
      <section id="top" class="bs-gsap-hero" aria-labelledby="bs-gsap-hero-title" data-gsap="hero">
        <div class="bs-gsap-hero__content">
          <p class="bs-gsap-kicker" data-gsap="kicker">Building Suit</p>
          <h1 id="bs-gsap-hero-title" class="bs-gsap-title" data-gsap="title">
            <span>{{ title }}</span>
          </h1>
          <p v-if="helper" class="bs-gsap-promise" data-gsap="promise">{{ helper }}</p>
          <div class="bs-gsap-hero-line" data-gsap="hero-line" aria-hidden="true" />
        </div>

        <div class="bs-gsap-visual" data-gsap="hero-visual" aria-hidden="true">
          <div class="bs-gsap-visual__halo" />
          <div class="bs-gsap-visual__grid" />

          <div v-if="hasCover" class="bs-gsap-cover" data-gsap="cover">
            <span class="bs-gsap-cover__glow" />
            <img :src="settings.cover_image_url || ''" alt="">
          </div>

          <template v-else>
            <div class="bs-gsap-tower bs-gsap-tower--left" data-gsap="tower">
              <span v-for="n in 7" :key="'left-' + n" />
            </div>
            <div class="bs-gsap-tower bs-gsap-tower--center" data-gsap="tower">
              <span v-for="n in 10" :key="'center-' + n" />
            </div>
            <div class="bs-gsap-tower bs-gsap-tower--right" data-gsap="tower">
              <span v-for="n in 8" :key="'right-' + n" />
            </div>
          </template>

          <div class="bs-gsap-orbit bs-gsap-orbit--a" data-gsap="orbit" data-gsap-orbit-a />
          <div class="bs-gsap-orbit bs-gsap-orbit--b" data-gsap="orbit" data-gsap-orbit-b />
          <div class="bs-gsap-visual__focus" />
        </div>

        <a v-if="entries.length" class="bs-gsap-scroll" href="#projects" data-gsap="scroll">
          <span>{{ ui.scroll }}</span>
          <span class="bs-gsap-scroll__track" aria-hidden="true"><span /></span>
        </a>
      </section>

      <section
        v-if="entries.length"
        id="projects"
        class="bs-gsap-projects"
        aria-labelledby="bs-gsap-projects-title"
        data-testid="platforms-rail"
      >
        <div class="bs-gsap-shell">
          <div class="bs-gsap-section-heading" data-gsap="projects-heading">
            <p class="bs-gsap-section-heading__eyebrow">Building Suit</p>
            <h2 id="bs-gsap-projects-title">{{ projectsTitle }}</h2>
            <p v-if="projectsHelper">{{ projectsHelper }}</p>
          </div>

          <div class="bs-gsap-project-grid" data-gsap="project-grid">
            <a
              v-for="(entry, index) in entries"
              :key="entry.id"
              class="bs-gsap-project-card"
              :href="entry.url"
              target="_blank"
              rel="noopener noreferrer"
              data-gsap="project-card"
            >
              <span class="bs-gsap-project-card__glow" aria-hidden="true" />
              <span class="bs-gsap-project-card__number" aria-hidden="true">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <span v-if="entry.ribbon" class="bs-gsap-project-card__ribbon">{{ entry.ribbon }}</span>

              <span class="bs-gsap-project-card__content">
                <span v-if="entry.logo_url" class="bs-gsap-project-card__logo" aria-hidden="true">
                  <img :src="entry.logo_url" alt="">
                </span>
                <span v-else class="bs-gsap-project-card__mark" aria-hidden="true">
                  {{ entry.title.charAt(0).toUpperCase() }}
                </span>
                <span class="bs-gsap-project-card__text">
                  <strong>{{ entry.title }}</strong>
                  <span v-if="entry.description">{{ entry.description }}</span>
                </span>
              </span>

              <span class="bs-gsap-project-card__action">
                {{ ui.open }}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 16 16 8M9 8h7v7" />
                </svg>
              </span>
              <span class="bs-visually-hidden">({{ ui.newTab }})</span>
            </a>
          </div>
        </div>
      </section>

      <section class="bs-gsap-wordmark-section" aria-hidden="true" data-gsap="wordmark-section">
        <div class="bs-gsap-wordmark" data-gsap="wordmark">
          <span>Building Suit</span>
          <span>Building Suit</span>
          <span>Building Suit</span>
          <span>Building Suit</span>
        </div>
      </section>
    </main>

    <footer class="bs-gsap-footer" data-gsap="footer">
      <div class="bs-gsap-footer__line" />
      <div class="bs-gsap-footer__content">
        <span class="bs-gsap-footer__brand">Building Suit</span>
        <span v-if="helper" class="bs-gsap-footer__promise">{{ helper }}</span>
      </div>
    </footer>
  </div>
</template>
