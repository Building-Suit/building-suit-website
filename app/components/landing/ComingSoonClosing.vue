<script setup lang="ts">
import { revealItemMotion } from "~/utils/buildingSuitMotion";

const { copy } = useLandingLocale();
const reducedMotion = useReducedMotion();

const sectionRef = ref<HTMLElement | null>(null);
const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
const shouldReveal = computed(() => isInView.value || reducedMotion.value);
const closingReveal = computed(() => revealItemMotion(0, shouldReveal.value));
</script>

<template>
  <section ref="sectionRef" class="bs-section bs-closing" aria-labelledby="closing-heading">
    <div class="bs-closing__line" aria-hidden="true" />
    <div class="bs-container bs-closing__inner">
      <Motion as="p" class="bs-closing__status" v-bind="closingReveal">
        {{ copy.status }}
      </Motion>
      <Motion id="closing-heading" as="h2" class="bs-closing__headline" v-bind="closingReveal">
        {{ copy.closingHeadline }}
      </Motion>
      <Motion as="p" class="bs-closing__supporting" v-bind="closingReveal">
        {{ copy.closingSupporting }}
      </Motion>
    </div>
  </section>
</template>

<style scoped>
.bs-closing {
  position: relative;
  background: var(--bs-gradient-navy);
  text-align: center;
  overflow: hidden;
}

.bs-closing__line {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--bs-color-brand-highlight-gold) 50%,
    transparent
  );
  opacity: 0.4;
}

.bs-closing__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--bs-spacing-3);
  max-width: 640px;
}

.bs-closing__status {
  display: inline-flex;
  padding: var(--bs-spacing-1) var(--bs-spacing-3);
  border-radius: var(--bs-radius-full);
  background: var(--bs-color-brand-context-overlay);
  color: var(--bs-color-brand-context-on-surface);
  font-size: var(--bs-type-caption-size);
  font-weight: var(--bs-typography-font-weight-semibold);
}

.bs-closing__headline {
  color: var(--bs-color-brand-context-on-surface);
  font-size: clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem);
  line-height: calc(1.2 * var(--bs-lh-scale));
  font-weight: var(--bs-typography-font-weight-extrabold);
}

.bs-closing__supporting {
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: var(--bs-type-body-l-size);
  line-height: calc(var(--bs-type-body-l-lh) * var(--bs-lh-scale));
  max-width: 48ch;
}
</style>
