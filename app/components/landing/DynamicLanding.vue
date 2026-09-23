<script setup lang="ts">
import type { ProjectLink, SiteSettings } from '~/types/content'

const props = defineProps<{
  settings: SiteSettings
  projects: ProjectLink[]
  locale: 'en' | 'ar'
}>()

const root = ref<HTMLElement | null>(null)
const activeProjectIndex = ref(0)
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
      language: 'التبديل إلى الإنجليزية',
      appearance: 'المظهر',
      previous: 'المشروع السابق',
      next: 'المشروع التالي',
      open: 'فتح المنصة',
      newTab: 'يفتح في تبويب جديد',
      counter: 'مشروع',
      navigation: 'التنقل بين المشاريع',
    }
  : {
      language: 'Switch to Arabic',
      appearance: 'Appearance',
      previous: 'Previous project',
      next: 'Next project',
      open: 'Open platform',
      newTab: 'opens in a new tab',
      counter: 'Project',
      navigation: 'Project navigation',
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

const activeProject = computed(() => entries.value[activeProjectIndex.value] ?? null)
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

let playProjectTransition: ((direction: number) => void) | undefined
let cleanupPointer: (() => void) | undefined
let gsapContext: { revert: () => void } | undefined

function changeProject(direction: number) {
  if (entries.value.length <= 1) return
  activeProjectIndex.value = (
    activeProjectIndex.value + direction + entries.value.length
  ) % entries.value.length
  nextTick(() => playProjectTransition?.(direction))
}

watch(
  () => entries.value.length,
  (length) => {
    if (!length) activeProjectIndex.value = 0
    else if (activeProjectIndex.value >= length) activeProjectIndex.value = length - 1
  },
)

onMounted(async () => {
  if (!root.value) return

  const { gsap } = await import('gsap')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  gsapContext = gsap.context(() => {
    if (!reduced) {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .from('[data-gsap="header"]', { autoAlpha: 0, y: -14, duration: 0.55 })
        .from('[data-gsap="eyebrow"]', { autoAlpha: 0, y: 18, duration: 0.42 }, 0.12)
        .from('[data-gsap="title"]', { autoAlpha: 0, y: 34, duration: 0.78 }, 0.18)
        .from('[data-gsap="helper"]', { autoAlpha: 0, y: 18, duration: 0.52 }, 0.3)
        .from('[data-gsap="accent"]', {
          scaleX: 0,
          duration: 0.65,
          transformOrigin: props.locale === 'ar' ? '100% 50%' : '0% 50%',
        }, 0.36)
        .from('[data-gsap="visual-frame"]', { autoAlpha: 0, scale: 0.96, y: 18, duration: 0.78 }, 0.2)
        .from('[data-gsap="tower"]', {
          autoAlpha: 0,
          y: 36,
          scaleY: 0.88,
          duration: 0.72,
          stagger: 0.07,
          transformOrigin: '50% 100%',
        }, 0.28)
        .from('[data-gsap="project-shelf"]', { autoAlpha: 0, y: 22, duration: 0.58 }, 0.45)

      gsap.to('[data-gsap="ring-a"]', { rotation: 360, duration: 30, repeat: -1, ease: 'none' })
      gsap.to('[data-gsap="ring-b"]', { rotation: -360, duration: 42, repeat: -1, ease: 'none' })
      gsap.to('[data-gsap="beacon"]', {
        opacity: 0.45,
        scale: 1.35,
        repeat: -1,
        yoyo: true,
        duration: 1.8,
        ease: 'sine.inOut',
      })

      const visual = root.value?.querySelector<HTMLElement>('[data-gsap="visual"]')
      if (visual && window.matchMedia('(pointer: fine)').matches) {
        const xTo = gsap.quickTo(visual, 'rotationY', { duration: 0.55, ease: 'power3.out' })
        const yTo = gsap.quickTo(visual, 'rotationX', { duration: 0.55, ease: 'power3.out' })

        const onPointerMove = (event: PointerEvent) => {
          const bounds = visual.getBoundingClientRect()
          const x = (event.clientX - bounds.left) / bounds.width - 0.5
          const y = (event.clientY - bounds.top) / bounds.height - 0.5
          xTo(x * 5)
          yTo(y * -4)
        }

        const onPointerLeave = () => {
          xTo(0)
          yTo(0)
        }

        visual.addEventListener('pointermove', onPointerMove)
        visual.addEventListener('pointerleave', onPointerLeave)
        cleanupPointer = () => {
          visual.removeEventListener('pointermove', onPointerMove)
          visual.removeEventListener('pointerleave', onPointerLeave)
        }
      }
    }

    playProjectTransition = (direction) => {
      if (reduced) return
      const card = root.value?.querySelector<HTMLElement>('[data-gsap="active-project"]')
      if (!card) return
      gsap.fromTo(card,
        { autoAlpha: 0, x: direction > 0 ? 18 : -18 },
        { autoAlpha: 1, x: 0, duration: 0.36, ease: 'power3.out' },
      )
    }
  }, root.value)
})

onBeforeUnmount(() => {
  cleanupPointer?.()
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

    <div class="bs-gsap-atmosphere" aria-hidden="true">
      <span class="bs-gsap-atmosphere__glow bs-gsap-atmosphere__glow--navy" />
      <span class="bs-gsap-atmosphere__glow bs-gsap-atmosphere__glow--gold" />
      <span class="bs-gsap-atmosphere__grid" />
    </div>

    <header class="bs-gsap-header" data-gsap="header">
      <div class="bs-gsap-header__inner">
        <a class="bs-gsap-brand" href="#main-content" aria-label="Building Suit">
          <span v-if="customLogo" class="bs-gsap-brand__logo" aria-hidden="true">
            <img :src="customLogo" alt="">
          </span>
          <span v-else class="bs-gsap-brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
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
      </div>
    </header>

    <main id="main-content" class="bs-gsap-main" aria-label="Building Suit">
      <section class="bs-gsap-copy" aria-labelledby="bs-gsap-title">
        <p class="bs-gsap-eyebrow" data-gsap="eyebrow">Building Suit</p>
        <h1 id="bs-gsap-title" class="bs-gsap-title" data-gsap="title">{{ title }}</h1>
        <p v-if="helper" class="bs-gsap-helper" data-gsap="helper">{{ helper }}</p>
        <span class="bs-gsap-accent" data-gsap="accent" aria-hidden="true" />
      </section>

      <section class="bs-gsap-visual-shell" aria-hidden="true" data-gsap="visual-frame">
        <div class="bs-gsap-visual" data-gsap="visual">
          <span class="bs-gsap-visual__halo" />
          <span class="bs-gsap-visual__frame" />
          <span class="bs-gsap-ring bs-gsap-ring--a" data-gsap="ring-a" />
          <span class="bs-gsap-ring bs-gsap-ring--b" data-gsap="ring-b" />

          <div v-if="hasCover" class="bs-gsap-cover">
            <img :src="settings.cover_image_url || ''" alt="">
          </div>

          <div v-else class="bs-gsap-skyline">
            <div class="bs-gsap-tower bs-gsap-tower--one" data-gsap="tower">
              <span v-for="n in 6" :key="'one-' + n" />
            </div>
            <div class="bs-gsap-tower bs-gsap-tower--two" data-gsap="tower">
              <span v-for="n in 9" :key="'two-' + n" />
            </div>
            <div class="bs-gsap-tower bs-gsap-tower--three" data-gsap="tower">
              <span v-for="n in 7" :key="'three-' + n" />
            </div>
          </div>

          <span class="bs-gsap-beacon" data-gsap="beacon" />
        </div>
      </section>

      <section
        v-if="activeProject"
        class="bs-gsap-projects"
        aria-labelledby="bs-gsap-projects-title"
        data-testid="platforms-rail"
        data-gsap="project-shelf"
      >
        <div class="bs-gsap-projects__heading">
          <div>
            <p class="bs-gsap-projects__eyebrow">
              {{ ui.counter }} {{ activeProjectIndex + 1 }}/{{ entries.length }}
            </p>
            <h2 id="bs-gsap-projects-title">{{ projectsTitle }}</h2>
          </div>
          <p v-if="projectsHelper">{{ projectsHelper }}</p>
        </div>

        <div class="bs-gsap-projects__body">
          <a
            :key="activeProject.id"
            class="bs-gsap-project-card"
            :href="activeProject.url"
            target="_blank"
            rel="noopener noreferrer"
            data-gsap="active-project"
          >
            <span v-if="activeProject.logo_url" class="bs-gsap-project-card__logo" aria-hidden="true">
              <img :src="activeProject.logo_url" alt="">
            </span>
            <span v-else class="bs-gsap-project-card__mark" aria-hidden="true">
              {{ activeProject.title.charAt(0).toUpperCase() }}
            </span>

            <span class="bs-gsap-project-card__copy">
              <strong>{{ activeProject.title }}</strong>
              <span v-if="activeProject.description">{{ activeProject.description }}</span>
            </span>

            <span v-if="activeProject.ribbon" class="bs-gsap-project-card__ribbon">
              {{ activeProject.ribbon }}
            </span>

            <span class="bs-gsap-project-card__action">
              {{ ui.open }}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 16 16 8M9 8h7v7" />
              </svg>
            </span>
            <span class="bs-visually-hidden">({{ ui.newTab }})</span>
          </a>

          <div
            v-if="entries.length > 1"
            class="bs-gsap-project-nav"
            :aria-label="ui.navigation"
          >
            <button type="button" :aria-label="ui.previous" @click="changeProject(-1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button type="button" :aria-label="ui.next" @click="changeProject(1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </section>
    </main>

    <div class="bs-gsap-signature" aria-hidden="true">BS / 26</div>
  </div>
</template>
