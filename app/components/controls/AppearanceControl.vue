<script setup lang="ts">
withDefaults(defineProps<{ onBrandSurface?: boolean }>(), { onBrandSurface: false });

const { theme, setTheme } = useAppearance();
const { copy } = useLandingLocale();

const options = computed(() => [
  { value: "light" as const, icon: icons.themeLight, label: copy.value.appearanceOptions.light },
  { value: "dark" as const, icon: icons.themeDark, label: copy.value.appearanceOptions.dark },
  { value: "system" as const, icon: icons.themeSystem, label: copy.value.appearanceOptions.system },
]);
</script>

<template>
  <div
    class="bs-appearance-control"
    :class="{ 'bs-appearance-control--on-brand': onBrandSurface }"
    role="group"
    :aria-label="copy.appearanceLabel"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="bs-appearance-control__button"
      :class="{ 'is-active': theme === option.value }"
      :aria-pressed="theme === option.value"
      :aria-label="option.label"
      :title="option.label"
      @click="setTheme(option.value)"
    >
      <HugeiconsIcon :icon="option.icon" :size="18" :stroke-width="2" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.bs-appearance-control {
  display: inline-flex;
  align-items: center;
  gap: var(--bs-spacing-1);
  padding: var(--bs-spacing-1);
  border-radius: var(--bs-radius-full);
  background: var(--bs-hover-overlay);
}

.bs-appearance-control--on-brand {
  background: var(--bs-color-brand-context-overlay);
}

.bs-appearance-control__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--bs-size-target-minimum);
  height: var(--bs-size-target-minimum);
  border-radius: var(--bs-radius-full);
  color: var(--bs-text-muted);
  transition: background-color var(--bs-duration-quick) var(--bs-easing-standard),
    color var(--bs-duration-quick) var(--bs-easing-standard);
}

.bs-appearance-control--on-brand .bs-appearance-control__button {
  color: var(--bs-color-brand-context-on-surface-muted);
}

.bs-appearance-control__button:hover {
  background: var(--bs-pressed-overlay);
}

.bs-appearance-control--on-brand .bs-appearance-control__button:hover {
  background: var(--bs-color-brand-context-overlay-hover);
}

.bs-appearance-control__button.is-active {
  color: var(--bs-accent);
  background: var(--bs-selected-overlay);
}

.bs-appearance-control--on-brand .bs-appearance-control__button.is-active {
  color: var(--bs-color-brand-gold300);
  background: var(--bs-color-brand-context-overlay-hover);
}
</style>
