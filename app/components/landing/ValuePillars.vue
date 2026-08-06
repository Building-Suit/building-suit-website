<script setup lang="ts">
import { revealItemMotion } from "~/utils/buildingSuitMotion";

const { copy } = useLandingLocale();
const reducedMotion = useReducedMotion();

const gridRef = ref<HTMLElement | null>(null);
const isInView = useInView(gridRef, { once: true, amount: 0.3 });
const shouldReveal = computed(() => isInView.value || reducedMotion.value);

const pillarIcons = [icons.pillarFinance, icons.pillarOrganisation, icons.pillarTrust];
</script>

<template>
  <section id="value-pillars" class="bs-section bs-pillars" aria-labelledby="value-pillars-heading">
    <div class="bs-container">
      <h2 id="value-pillars-heading" class="bs-visually-hidden">{{ copy.eyebrow }}</h2>

      <div ref="gridRef" class="bs-pillars__grid">
        <Motion
          v-for="(pillar, index) in copy.pillars"
          :key="pillar.title"
          as="article"
          class="bs-pillar"
          v-bind="revealItemMotion(index, shouldReveal)"
        >
          <span class="bs-pillar__icon">
            <HugeiconsIcon :icon="pillarIcons[index]" :size="24" :stroke-width="2" aria-hidden="true" />
          </span>
          <h3 class="bs-pillar__title">{{ pillar.title }}</h3>
          <p class="bs-pillar__description">{{ pillar.description }}</p>
        </Motion>
      </div>
    </div>
  </section>
</template>

<style scoped>
.bs-pillars {
  background: var(--bs-background);
}

.bs-pillars__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--bs-spacing-5);
}

@media (min-width: 768px) {
  .bs-pillars__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bs-spacing-6);
  }
}

.bs-pillar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--bs-spacing-3);
  padding: var(--bs-spacing-6);
  border-radius: var(--bs-radius-card);
  border: 1px solid var(--bs-border);
  background: var(--bs-surface);
}

.bs-pillar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--bs-radius-button);
  background: var(--bs-surface-container);
  color: var(--bs-primary);
}

.bs-pillar__title {
  font-size: var(--bs-type-h3-size);
  line-height: calc(var(--bs-type-h3-lh) * var(--bs-lh-scale));
  font-weight: var(--bs-typography-font-weight-semibold);
  color: var(--bs-text);
}

.bs-pillar__description {
  font-size: var(--bs-type-body-m-size);
  line-height: calc(var(--bs-type-body-m-lh) * var(--bs-lh-scale));
  color: var(--bs-text-muted);
}
</style>
