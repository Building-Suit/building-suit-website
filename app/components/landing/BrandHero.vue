<script setup lang="ts">
import type { SiteSettings } from '~/types/content'
import { logoReveal, textReveal } from '~/utils/buildingSuitMotion'

const props = defineProps<{ settings: SiteSettings; locale: 'en' | 'ar'; compact?: boolean }>()
const reducedMotion = useSafeReducedMotion()

const title = computed(() => props.locale === 'ar' ? props.settings.coming_soon_text_ar : props.settings.coming_soon_text_en)
const helper = computed(() => props.locale === 'ar' ? props.settings.helper_text_ar : props.settings.helper_text_en)
const uploadedLogo = computed(() => props.settings.logo_url)

const logoMotion = computed(() => logoReveal(reducedMotion.value))
const wordmarkMotion = computed(() => textReveal(0, reducedMotion.value))
const statusMotion = computed(() => textReveal(1, reducedMotion.value))
const helperMotion = computed(() => textReveal(2, reducedMotion.value))
</script>

<template>
  <div class="bs-brand" :class="{ 'bs-brand--compact': compact }">
    <Motion as="div" class="bs-brand__logo-frame" v-bind="logoMotion">
      <img
        v-if="uploadedLogo"
        :src="uploadedLogo"
        alt="Building Suit"
        class="bs-brand__logo"
      >
      <img
        v-else
        src="/brand/building-suit-logo-light-lg.png"
        srcset="/brand/building-suit-logo-light-lg.png 1x, /brand/building-suit-logo-light-lg@2x.png 2x"
        width="177"
        height="240"
        alt="Building Suit"
        class="bs-brand__logo"
      >
    </Motion>

    <Motion as="p" class="bs-brand__wordmark" v-bind="wordmarkMotion">Building Suit</Motion>
    <Motion as="h1" class="bs-brand__status" v-bind="statusMotion">{{ title }}</Motion>
    <Motion v-if="helper" as="p" class="bs-brand__promise" v-bind="helperMotion">{{ helper }}</Motion>
  </div>
</template>

<style scoped>
.bs-brand {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: clamp(0.5rem, 1.4dvh, 1rem);
}

.bs-brand__logo-frame {
  margin-block-end: clamp(0.25rem, 1dvh, 0.75rem);
}

.bs-brand__logo {
  height: clamp(52px, 7dvh + 3vw, 140px);
  width: auto;
  object-fit: contain;
}

.bs-brand__wordmark {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(0.8rem, 0.45vw + 1.15dvh, 1.05rem);
  font-weight: var(--bs-typography-font-weight-semibold);
  letter-spacing: 0.02em;
}

.bs-brand__status {
  color: var(--bs-color-brand-context-on-surface);
  font-size: clamp(2.25rem, 3.4vw + 4.2dvh, 5rem);
  line-height: calc(1.05 * var(--bs-lh-scale));
  font-weight: var(--bs-typography-font-weight-extrabold);
  letter-spacing: -0.01em;
}

.bs-brand__promise {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(0.95rem, 0.5vw + 1.5dvh, 1.35rem);
  font-weight: var(--bs-typography-font-weight-medium);
}

/* Cover mode intentionally changes only the hero sizing. With no cover, every value
   above is the original standalone website composition. */
.bs-brand--compact .bs-brand__logo {
  height: clamp(52px, 6dvh + 2vw, 118px);
}

.bs-brand--compact .bs-brand__status {
  font-size: clamp(2.25rem, 2.5vw + 3dvh, 4.2rem);
}

html[lang="ar"] .bs-brand__status {
  letter-spacing: 0;
}
</style>
