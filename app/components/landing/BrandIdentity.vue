<script setup lang="ts">
import { logoReveal, textReveal } from "~/utils/buildingSuitMotion";

const { copy } = useLandingLocale();
const reducedMotion = useSafeReducedMotion();

const logo = computed(() => logoReveal(reducedMotion.value));
const wordmark = computed(() => textReveal(0, reducedMotion.value));
const status = computed(() => textReveal(1, reducedMotion.value));
const promise = computed(() => textReveal(2, reducedMotion.value));
</script>

<template>
  <div class="bs-brand">
    <Motion as="div" class="bs-brand__logo-frame" v-bind="logo">
      <img
        src="/brand/building-suit-logo-light-lg.png"
        srcset="/brand/building-suit-logo-light-lg.png 1x, /brand/building-suit-logo-light-lg@2x.png 2x"
        width="177"
        height="240"
        :alt="copy.logoAlt"
        class="bs-brand__logo"
      >
    </Motion>

    <Motion as="p" class="bs-brand__wordmark" v-bind="wordmark">
      {{ copy.brandName }}
    </Motion>

    <Motion as="h1" class="bs-brand__status" v-bind="status">
      {{ copy.status }}
    </Motion>

    <Motion as="p" class="bs-brand__promise" v-bind="promise">
      {{ copy.promise }}
    </Motion>
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
  height: clamp(56px, 8dvh + 3.5vw, 168px);
  width: auto;
}

.bs-brand__wordmark {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(0.85rem, 0.5vw + 1.3dvh, 1.15rem);
  font-weight: var(--bs-typography-font-weight-semibold);
  letter-spacing: 0.02em;
}

.bs-brand__status {
  color: var(--bs-color-brand-context-on-surface);
  font-size: clamp(2.5rem, 4vw + 5dvh, 6.5rem);
  line-height: calc(1.05 * var(--bs-lh-scale));
  font-weight: var(--bs-typography-font-weight-extrabold);
  letter-spacing: -0.01em;
}

.bs-brand__promise {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: clamp(1rem, 0.6vw + 1.8dvh, 1.5rem);
  font-weight: var(--bs-typography-font-weight-medium);
}

html[lang="ar"] .bs-brand__status {
  letter-spacing: 0;
}
</style>
