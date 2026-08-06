<script setup lang="ts">
import { parallaxRangePx } from "~/utils/buildingSuitMotion";

const { copy } = useLandingLocale();

const panelRef = ref<HTMLElement | null>(null);
const reducedMotion = useReducedMotion();

const { scrollYProgress } = useScroll({ target: panelRef, offset: ["start end", "end start"] });
const layerY = useTransform(scrollYProgress, [0, 1], [-parallaxRangePx, parallaxRangePx]);
</script>

<template>
  <div ref="panelRef" class="bs-signal" role="img" :aria-label="copy.eyebrow">
    <Motion as="div" class="bs-signal__plane bs-signal__plane--back" :style="{ y: reducedMotion ? 0 : layerY }" />

    <div class="bs-signal__window-grid" aria-hidden="true">
      <span v-for="cell in 24" :key="cell" class="bs-signal__window" :class="{ 'is-lit': cell === 6 || cell === 15 }" />
    </div>

    <div class="bs-signal__logo-frame">
      <img
        src="/brand/building-suit-logo-light-md.png"
        srcset="/brand/building-suit-logo-light-md.png 1x, /brand/building-suit-logo-light-md@2x.png 2x"
        width="95"
        height="128"
        alt="Building Suit"
        class="bs-signal__logo"
      >
    </div>

    <ul class="bs-signal__labels">
      <li v-for="label in copy.signalLabels" :key="label" class="bs-signal__label">
        <span class="bs-signal__label-dot" aria-hidden="true" />
        {{ label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.bs-signal {
  position: relative;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 4 / 5;
  border-radius: var(--bs-radius-large);
  border: 1px solid var(--bs-color-brand-context-boundary);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--bs-spacing-6);
}

.bs-signal__plane {
  position: absolute;
  inset: var(--bs-spacing-5);
  border-radius: var(--bs-radius-card);
  border: 1px solid var(--bs-color-brand-context-boundary);
}

.bs-signal__plane--back {
  inset: var(--bs-spacing-4);
  opacity: 0.5;
}

.bs-signal__window-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 1px;
  padding: var(--bs-spacing-7);
  pointer-events: none;
}

.bs-signal__window {
  border: 1px solid var(--bs-color-brand-context-grid-subtle);
  border-radius: 2px;
}

.bs-signal__window.is-lit {
  background: rgba(216, 155, 66, 0.35);
  border-color: rgba(235, 180, 90, 0.5);
}

.bs-signal__logo-frame {
  position: relative;
  z-index: 1;
}

.bs-signal__logo {
  height: 128px;
  width: auto;
}

.bs-signal__labels {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--bs-spacing-4);
  margin-top: var(--bs-spacing-6);
}

.bs-signal__label {
  display: flex;
  align-items: center;
  gap: var(--bs-spacing-1);
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: var(--bs-type-caption-size);
  font-weight: var(--bs-typography-font-weight-medium);
}

.bs-signal__label-dot {
  width: 5px;
  height: 5px;
  border-radius: var(--bs-radius-full);
  background: var(--bs-color-brand-highlight-gold);
}
</style>
