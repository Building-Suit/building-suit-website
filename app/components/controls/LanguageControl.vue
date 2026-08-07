<script setup lang="ts">
// Not currently rendered on the Coming Soon page (no visible chrome — see
// FutureActionsSlot.vue) but preserved as working infrastructure for future pages.
withDefaults(defineProps<{ onBrandSurface?: boolean }>(), { onBrandSurface: false });

const { locale, setLocale } = useLandingLocale();

const nextLocale = computed(() => (locale.value === "en" ? "ar" : "en"));
const accessibleLabel = computed(() =>
  locale.value === "en" ? "Switch to Arabic — التبديل إلى العربية" : "Switch to English — التبديل إلى الإنجليزية"
);

function toggle() {
  setLocale(nextLocale.value);
}
</script>

<template>
  <button
    type="button"
    class="bs-lang-control"
    :class="{ 'bs-lang-control--on-brand': onBrandSurface }"
    :aria-label="accessibleLabel"
    @click="toggle"
  >
    <HugeiconsIcon :icon="icons.language" :size="20" :stroke-width="2" aria-hidden="true" />
    <span class="bs-lang-control__pair">
      <span :class="{ 'is-active': locale === 'en' }">EN</span>
      <span aria-hidden="true">/</span>
      <span :class="{ 'is-active': locale === 'ar' }" lang="ar" dir="rtl">العربية</span>
    </span>
  </button>
</template>

<style scoped>
.bs-lang-control {
  display: inline-flex;
  align-items: center;
  gap: var(--bs-spacing-2);
  min-height: var(--bs-size-target-minimum);
  padding-inline: var(--bs-spacing-3);
  border-radius: var(--bs-radius-full);
  color: var(--bs-text);
  background: var(--bs-hover-overlay);
  transition: background-color var(--bs-duration-quick) var(--bs-easing-standard);
}

.bs-lang-control:hover {
  background: var(--bs-pressed-overlay);
}

.bs-lang-control--on-brand {
  color: var(--bs-color-brand-context-on-surface);
  background: var(--bs-color-brand-context-overlay);
}

.bs-lang-control--on-brand:hover {
  background: var(--bs-color-brand-context-overlay-hover);
}

.bs-lang-control__pair {
  display: inline-flex;
  align-items: center;
  gap: var(--bs-spacing-1);
  font-size: var(--bs-type-caption-size);
  font-weight: var(--bs-typography-font-weight-semibold);
  opacity: 0.85;
}

.bs-lang-control__pair .is-active {
  opacity: 1;
}
</style>
