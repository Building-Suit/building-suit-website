<script setup lang="ts">
const { dir, locale, copy } = useLandingLocale();
const { theme, resolvedTheme } = useAppearance();

useHead({
  htmlAttrs: {
    lang: locale,
    dir,
    // Explicit light/dark choices are known at SSR time and can render correctly on
    // first paint; "system" is resolved client-side by the blocking script in
    // nuxt.config.ts (see composables/useAppearance.ts for the shared contract).
    "data-theme": computed(() => (theme.value === "system" ? undefined : resolvedTheme.value)),
  },
  meta: [{ name: "theme-color", content: computed(() => (resolvedTheme.value === "dark" ? "#0E1114" : "#16293B")) }],
});
</script>

<template>
  <a class="bs-skip-link" href="#main-content">{{ copy.skipToContent }}</a>
  <MotionConfig reduced-motion="user">
    <NuxtPage />
  </MotionConfig>
</template>
