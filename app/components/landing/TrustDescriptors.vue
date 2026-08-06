<script setup lang="ts">
import { distance, easing, trustDescriptorDelay, duration as motionDuration } from "~/utils/buildingSuitMotion";

const { copy } = useLandingLocale();

function itemMotion(index: number) {
  return {
    initial: { opacity: 0, y: distance.microPx },
    animate: { opacity: 1, y: 0 },
    transition: { duration: motionDuration.standard, ease: easing.enter, delay: trustDescriptorDelay(index) },
  };
}
</script>

<template>
  <ul class="bs-trust">
    <Motion
      v-for="(descriptor, index) in copy.trustDescriptors"
      :key="descriptor"
      as="li"
      class="bs-trust__item"
      v-bind="itemMotion(index)"
    >
      {{ descriptor }}
    </Motion>
  </ul>
</template>

<style scoped>
.bs-trust {
  display: flex;
  flex-wrap: wrap;
  gap: var(--bs-spacing-2) var(--bs-spacing-5);
  margin-top: var(--bs-spacing-2);
}

.bs-trust__item {
  position: relative;
  padding-inline-start: var(--bs-spacing-4);
  color: var(--bs-color-brand-context-on-surface-muted);
  font-size: var(--bs-type-body-m-size);
}

.bs-trust__item::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 0.6em;
  width: 6px;
  height: 6px;
  border-radius: var(--bs-radius-full);
  background: var(--bs-color-brand-highlight-gold);
}
</style>
