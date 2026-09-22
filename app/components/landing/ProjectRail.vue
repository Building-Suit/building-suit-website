<script setup lang="ts">
import type { ProjectLink, SiteSettings } from '~/types/content'
import { hoverScale, hoverTransition, platformReveal, pressScale } from '~/utils/buildingSuitMotion'

const props = defineProps<{ projects: ProjectLink[]; settings: SiteSettings; locale: 'en' | 'ar' }>()
const reducedMotion = useSafeReducedMotion()

const title = computed(() => props.locale === 'ar' ? props.settings.projects_title_ar : props.settings.projects_title_en)
const helper = computed(() => props.locale === 'ar' ? props.settings.projects_helper_text_ar : props.settings.projects_helper_text_en)

const entries = computed(() => props.projects.map((project) => ({
  ...project,
  title: props.locale === 'ar' ? (project.title_ar || project.title_en) : (project.title_en || project.title_ar || ''),
  description: props.locale === 'ar'
    ? (project.description_ar || project.description_en || '')
    : (project.description_en || project.description_ar || ''),
  ribbon: props.locale === 'ar'
    ? (project.ribbon_text_ar || project.ribbon_text_en || '')
    : (project.ribbon_text_en || project.ribbon_text_ar || ''),
})))

const newTabHint = computed(() => props.locale === 'ar' ? 'يفتح في تبويب جديد' : 'opens in a new tab')
const headerMotion = computed(() => platformReveal(0, reducedMotion.value))
const itemMotion = (index: number) => platformReveal(index, reducedMotion.value)

const interactionVars = {
  '--bs-hover-scale': String(hoverScale),
  '--bs-press-scale': String(pressScale),
  '--bs-hover-duration': `${hoverTransition.duration}s`,
} as const
</script>

<template>
  <section
    v-if="entries.length"
    class="bs-rail"
    aria-labelledby="bs-rail-title"
    data-testid="platforms-rail"
  >
    <Motion id="bs-rail-title" as="h2" class="bs-rail__title" v-bind="headerMotion">
      {{ title }}
    </Motion>

    <Motion v-if="helper" as="p" class="bs-rail__subtitle" v-bind="headerMotion">
      {{ helper }}
    </Motion>

    <ul class="bs-rail__list" :style="interactionVars">
      <Motion
        v-for="(entry, index) in entries"
        :key="entry.id"
        as="li"
        class="bs-rail__item"
        v-bind="itemMotion(index)"
      >
        <a
          class="bs-platform"
          :class="{
            'bs-platform--with-logo': Boolean(entry.logo_url),
          }"
          :href="entry.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span v-if="entry.ribbon" class="bs-platform__ribbon">{{ entry.ribbon }}</span>

          <span v-if="entry.logo_url" class="bs-platform__logo" aria-hidden="true">
            <img :src="entry.logo_url" alt="">
          </span>

          <span class="bs-platform__body">
            <span class="bs-platform__name">{{ entry.title }}</span>
            <span v-if="entry.description" class="bs-platform__tagline">{{ entry.description }}</span>
          </span>

          <svg
            class="bs-platform__arrow"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 16 16 8" />
            <path d="M9.5 8H16v6.5" />
          </svg>

          <span class="bs-visually-hidden">({{ newTabHint }})</span>
        </a>
      </Motion>
    </ul>
  </section>
</template>

<style scoped>
.bs-rail {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  text-align: center;
  gap: clamp(0.25rem, 0.8dvh, 0.6rem);
}

.bs-rail__title {
  color: var(--bs-color-brand-context-on-surface);
  font-size: clamp(1rem, 0.4vw + 1.3dvh, 1.4rem);
  line-height: calc(1.25 * var(--bs-lh-scale));
  font-weight: var(--bs-typography-font-weight-bold);
}

.bs-rail__subtitle {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(0.8rem, 0.3vw + 1dvh, 1rem);
  line-height: calc(1.35 * var(--bs-lh-scale));
}

.bs-rail__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 420px));
  grid-auto-rows: 1fr;
  justify-content: center;
  align-items: stretch;
  gap: clamp(0.5rem, 1.4dvh, 1rem);
  width: 100%;
  max-width: 880px;
  margin: 0;
  margin-block-start: clamp(0.4rem, 1.4dvh, 1.1rem);
  padding: 0;
  list-style: none;
}

.bs-rail__item {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 100%;
}

/* Keep incomplete final rows optically centered. With the two-column desktop grid this
   means 1 item is centered, 2 sit side by side, and for 3/5/7/... the final card spans
   the row but keeps the same 420px card width instead of stretching across both columns. */
.bs-rail__item:last-child:nth-child(odd) {
  grid-column: 1 / -1;
  justify-self: center;
  max-width: 420px;
}

/* Default geometry is intentionally copied from the original static website. Optional
   logo/ribbon elements only alter the card when the admin actually supplies them. */
.bs-platform {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--bs-spacing-3);
  width: 100%;
  height: 100%;
  padding: clamp(0.7rem, 1.6dvh, 1.05rem) clamp(0.85rem, 2vw, 1.25rem);
  border: 1px solid var(--bs-color-brand-context-boundary);
  border-radius: var(--bs-radius-button);
  background: var(--bs-color-brand-context-overlay);
  color: var(--bs-color-brand-context-on-surface);
  text-decoration: none;
  text-align: start;
  overflow: hidden;
  transition:
    background-color var(--bs-hover-duration) var(--bs-easing-standard),
    border-color var(--bs-hover-duration) var(--bs-easing-standard),
    transform var(--bs-hover-duration) var(--bs-easing-standard);
}


.bs-platform__logo {
  flex: 0 0 62px;
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  border: 1px solid var(--bs-color-brand-context-boundary);
  border-radius: var(--bs-radius-card);
  background: rgba(14, 17, 20, 0.38);
  overflow: hidden;
}

.bs-platform__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0;
}

.bs-platform__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}

.bs-platform__name {
  font-size: clamp(0.9rem, 0.3vw + 1.1dvh, 1.1rem);
  font-weight: var(--bs-typography-font-weight-semibold);
  line-height: calc(1.25 * var(--bs-lh-scale));
}

.bs-platform__tagline {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(0.75rem, 0.25vw + 0.9dvh, 0.9rem);
  line-height: calc(1.3 * var(--bs-lh-scale));
}

.bs-platform__arrow {
  flex: 0 0 auto;
  color: var(--bs-color-brand-premium-gold);
  transition: color var(--bs-hover-duration) var(--bs-easing-standard);
}

.bs-platform__ribbon {
  position: absolute;
  z-index: 2;
  inset-block-start: 0;
  inset-inline-end: 0;
  pointer-events: none;
  max-width: 62%;
  padding: 4px 9px;
  border-end-start-radius: var(--bs-radius-chip);
  background: var(--bs-color-brand-premium-gold);
  color: var(--bs-color-brand-deep-structure-navy);
  font-size: 0.65rem;
  font-weight: var(--bs-typography-font-weight-bold);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

html[lang="ar"] .bs-platform__arrow {
  transform: scaleX(-1);
}

@media (max-width: 640px) {
  .bs-rail__list {
    grid-template-columns: minmax(0, 420px);
  }

  .bs-rail__item:last-child:nth-child(odd) {
    grid-column: auto;
    justify-self: stretch;
    max-width: none;
  }
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .bs-platform:hover {
    transform: scale(var(--bs-hover-scale));
  }

  .bs-platform:active {
    transform: scale(var(--bs-press-scale));
  }
}

.bs-platform:hover {
  background: var(--bs-color-brand-context-overlay-hover);
  border-color: var(--bs-color-brand-premium-gold);
}

.bs-platform:hover .bs-platform__arrow {
  color: var(--bs-color-brand-highlight-gold);
}

.bs-platform:focus-visible {
  outline: var(--bs-size-focus-ring) solid var(--bs-color-brand-highlight-gold);
  outline-offset: var(--bs-size-focus-offset);
}
</style>
