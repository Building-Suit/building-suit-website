<script setup lang="ts">
import { heroCta, heroHeadline, heroStatus, heroSupporting, heroVisual, hoverScale, hoverTransition, pressScale } from "~/utils/buildingSuitMotion";

const { copy } = useLandingLocale();
</script>

<template>
  <section class="bs-hero">
    <div class="bs-hero__backdrop" aria-hidden="true">
      <div class="bs-hero__grid-motif" />
      <div class="bs-hero__gold-glow" />
    </div>

    <div class="bs-container bs-hero__layout">
      <div class="bs-hero__copy">
        <Motion as="p" class="bs-hero__status" v-bind="heroStatus">
          <span class="bs-hero__status-dot" aria-hidden="true" />
          {{ copy.status }}
        </Motion>

        <Motion as="p" class="bs-hero__eyebrow" v-bind="heroStatus">
          {{ copy.eyebrow }}
        </Motion>

        <Motion as="h1" class="bs-hero__headline" v-bind="heroHeadline">
          {{ copy.headline }}
        </Motion>

        <Motion as="p" class="bs-hero__supporting" v-bind="heroSupporting">
          {{ copy.supporting }}
        </Motion>

        <Motion
          as="a"
          href="#value-pillars"
          class="bs-hero__cta"
          v-bind="heroCta"
          :while-hover="{ scale: hoverScale }"
          :while-press="{ scale: pressScale }"
          :transition="hoverTransition"
        >
          {{ copy.primaryAction }}
        </Motion>

        <LandingTrustDescriptors />
      </div>

      <Motion as="div" class="bs-hero__visual" v-bind="heroVisual">
        <LandingArchitecturalSignal />
      </Motion>
    </div>
  </section>
</template>

<style scoped>
.bs-hero {
  position: relative;
  overflow: hidden;
  background: var(--bs-gradient-navy);
  padding-top: calc(72px + var(--bs-spacing-9));
  padding-bottom: var(--bs-spacing-9);
}

.bs-hero__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bs-hero__grid-motif {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(var(--bs-color-brand-context-grid-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--bs-color-brand-context-grid-subtle) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, black, transparent 85%);
}

.bs-hero__gold-glow {
  position: absolute;
  inset-inline-end: -10%;
  top: 10%;
  width: 480px;
  height: 480px;
  max-width: 60%;
  border-radius: var(--bs-radius-full);
  background: radial-gradient(circle, rgba(216, 155, 66, 0.28) 0%, rgba(216, 155, 66, 0) 70%);
}

.bs-hero__layout {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--bs-spacing-9);
  align-items: center;
}

@media (min-width: 960px) {
  .bs-hero__layout {
    grid-template-columns: 7fr 5fr;
    gap: var(--bs-spacing-8);
  }
}

.bs-hero__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--bs-spacing-4);
}

.bs-hero__status {
  display: inline-flex;
  align-items: center;
  gap: var(--bs-spacing-2);
  padding: var(--bs-spacing-1) var(--bs-spacing-3);
  border-radius: var(--bs-radius-full);
  background: var(--bs-color-brand-context-overlay);
  color: var(--bs-color-brand-context-on-surface);
  font-size: var(--bs-type-caption-size);
  font-weight: var(--bs-typography-font-weight-semibold);
}

.bs-hero__status-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--bs-radius-full);
  background: var(--bs-color-brand-highlight-gold);
}

.bs-hero__eyebrow {
  color: var(--bs-color-brand-highlight-gold);
  font-size: var(--bs-type-overline-size);
  font-weight: var(--bs-typography-font-weight-semibold);
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

html[lang="ar"] .bs-hero__eyebrow {
  text-transform: none;
  letter-spacing: 0;
}

.bs-hero__headline {
  color: var(--bs-color-brand-context-on-surface);
  font-size: clamp(2.25rem, 1.6rem + 2.6vw, 3.5rem);
  line-height: calc(1.12 * var(--bs-lh-scale));
  font-weight: var(--bs-typography-font-weight-extrabold);
  max-width: 18ch;
}

.bs-hero__supporting {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: var(--bs-type-body-l-size);
  line-height: calc(var(--bs-type-body-l-lh) * var(--bs-lh-scale));
  max-width: 52ch;
}

.bs-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--bs-size-button-height);
  padding-inline: var(--bs-spacing-6);
  border-radius: var(--bs-radius-button);
  background: var(--bs-color-brand-premium-gold);
  color: var(--bs-color-brand-deep-structure-navy);
  font-size: var(--bs-type-button-size);
  font-weight: var(--bs-typography-font-weight-semibold);
}

.bs-hero__visual {
  display: flex;
  justify-content: center;
}
</style>
