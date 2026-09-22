<script setup lang="ts">
import type { ProjectLink, SiteSettings } from '~/types/content'
import { ruleReveal } from '~/utils/buildingSuitMotion'

const props = defineProps<{ settings: SiteSettings; projects: ProjectLink[]; locale: 'en' | 'ar' }>()
const reducedMotion = useSafeReducedMotion()
const rule = computed(() => ruleReveal(reducedMotion.value))
const hasCover = computed(() => Boolean(props.settings.cover_image_url))
const coverSrc = computed(() => props.settings.cover_image_url || '')
const needsScroll = computed(() => hasCover.value || props.projects.length > 4)
</script>

<template>
  <div
    class="bs-experience"
    :class="{
      'bs-experience--cover': hasCover,
      'bs-experience--scrollable': needsScroll,
    }"
  >
    <LandingDynamicBackground :settings="settings" />

    <div class="bs-experience__spacer bs-experience__spacer--top" aria-hidden="true" />

    <div v-if="hasCover" class="bs-experience__hero-grid">
      <LandingBrandHero :settings="settings" :locale="locale" compact />
      <LandingCoverPanel :src="coverSrc" />
    </div>
    <LandingBrandHero v-else :settings="settings" :locale="locale" />

    <div class="bs-experience__spacer bs-experience__spacer--gap" aria-hidden="true" />

    <Motion as="div" class="bs-experience__rule" aria-hidden="true" v-bind="rule" />

    <div class="bs-experience__spacer bs-experience__spacer--gap" aria-hidden="true" />

    <LandingProjectRail :projects="projects" :settings="settings" :locale="locale" />

    <div class="bs-experience__spacer bs-experience__spacer--bottom" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* No-cover mode intentionally matches the original ComingSoonExperience.vue geometry. */
.bs-experience {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100svh;
  min-height: 100dvh;
  overflow: hidden;
  padding-inline: max(env(safe-area-inset-left), 24px) max(env(safe-area-inset-right), 24px);
  padding-block-start: max(env(safe-area-inset-top), 20px);
  padding-block-end: max(env(safe-area-inset-bottom), 20px);
  /* Compatibility values come from the standalone website's locked public-page token
     set. They are scoped here so the admin UI continues using the current monorepo
     neutral palette while the no-customization public state stays visually identical. */
  --bs-color-role-dark-background: #0E1114;
  --bs-color-neutral-900: #151A1F;
  background: var(--bs-color-role-dark-background);
}

.bs-experience__spacer--top {
  flex: 0.95 0 0;
  min-height: 8px;
}

.bs-experience__spacer--gap {
  flex: 0.5 0 0;
  min-height: clamp(10px, 1.8dvh, 28px);
}

.bs-experience__spacer--bottom {
  flex: 0.55 0 0;
  min-height: 8px;
}

.bs-experience__rule {
  position: relative;
  z-index: 1;
  width: clamp(56px, 10vw, 120px);
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--bs-color-brand-premium-gold) 50%,
    transparent 100%
  );
}

.bs-experience__hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
  align-items: center;
  gap: clamp(32px, 5vw, 72px);
  width: min(1060px, 100%);
}

/* Extra content is allowed to scroll only when the dynamic configuration needs more
   room. The default one-project/no-cover state remains the original single viewport. */
.bs-experience--scrollable {
  min-height: 100dvh;
  overflow-y: auto;
}

.bs-experience--scrollable .bs-experience__spacer--top,
.bs-experience--scrollable .bs-experience__spacer--bottom {
  flex-basis: clamp(20px, 4vh, 48px);
}

@media (max-width: 820px) {
  .bs-experience--cover .bs-experience__hero-grid {
    grid-template-columns: 1fr;
    gap: 26px;
  }

  .bs-experience--cover .bs-experience__spacer--top {
    flex: 0 0 12px;
  }

  .bs-experience--cover .bs-experience__spacer--gap {
    flex: 0 0 22px;
  }
}
</style>
